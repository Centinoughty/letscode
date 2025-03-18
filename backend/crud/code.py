from fastapi import HTTPException
import docker
import uuid
import os
import shutil
import time

from sqlalchemy.orm import Session
from schemas.code import CodeCreate
from utils.security import get_user_from_token
from models.code import Code

client = docker.from_env()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def find_code(db: Session, code_id: uuid.UUID):
  return db.query(Code).filter(Code.id == code_id).first()

def get_file_path(code_id: uuid.UUID, language: str):
  ext = {"py": "py", "cpp": "cpp", "c": "c"}.get(language, None)
  if not ext:
    raise HTTPException(status_code=400, detail="unsupported language")

  return os.path.join(UPLOAD_DIR, f"{code_id}.{ext}")

def create_code(db: Session, code: CodeCreate, token: str):
  # check if user is authorized
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")

  # generate a unique UUID
  code_id = uuid.uuid4()
  file_path = get_file_path(code_id, code.language)
  
  # create an empty file with same name as UUID
  with open(file_path, "w") as f:
    pass
  
  # create a database entry
  db_code = Code(
    id=code_id,
    file_name=code.file_name,
    code_path=file_path,
    language=code.language,
    owner_id=user.id
  )

  db.add(db_code)
  db.commit()
  db.refresh(db_code)

  return db_code

def delete_code(db: Session, code_id: uuid.UUID, token: str):
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")

  code = find_code(db, code_id)
  if not code:
    raise HTTPException(status_code=404, detail="Code not found")

  if code.owner_id != user.id:
    raise HTTPException(status_code=403, detail="Not authoruized")

  if os.path.exists(code.code_path):
    os.remove(code.code_path)

  db.delete(code)
  db.commit()
  return

def save_code(db: Session, code_id: uuid.UUID, code_input: str, token: str):
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")

  code = find_code(db, code_id)
  if not code:
    raise HTTPException(status_code=404, detail="Code not found")

  if code.owner_id != user.id:
    raise HTTPException(status_code=403, detail="Not authoruized")

  with open(code.code_path, "w") as f:
    f.write(code_input)

  return {"code_id": code.id}

def run_code(db: Session, code_id: uuid.UUID, stdin: str, token: str):
  # check for  the user
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")

  # find the code
  code = find_code(db, code_id)
  if not code:
    raise HTTPException(status_code=404, detail="Code not found")
  
  if code.owner_id != user.id:
    raise HTTPException(status_code=403, detail="Not authorized")

  try:
    # create temporary direc  
    temp_dir = f"/tmp/{uuid.uuid4()}"
    os.makedirs(temp_dir, exist_ok=True)

    # copy the source file
    source_file = code.code_path
    dest_file = os.path.join(temp_dir, f"main.{code.language}")
    shutil.copy(source_file, dest_file)
    
    input_file = os.path.join(temp_dir, "input.txt")

    # write stdin
    with open(input_file, "w") as f:
      f.write(stdin)

    # get commands to run
    if code.language == "py":
      image = "python:3.10-alpine"
      cmd = f"python3 /app/main.py < /app/input.txt"
    elif code.language == "cpp":
      image = "gcc:latest"
      cmd = f"g++ /app/main.cpp -o /app/main && /app/main < /app/input.txt"
    elif code.language == "c":
      image = "gcc:latest"
      cmd = "gcc /app/main.c -o /app/main && /app/main < /app/input.txt"
    else:
      raise HTTPException(status_code=400, detail="Unsupported language")

    # cerate a container
    container = client.containers.run(
      image=image,
      command=["sh", "-c", cmd],
      volumes={temp_dir: {"bind": "/app", "mode": "rw"}},
      network_disabled=True,
      mem_limit="200mb",
      cpu_period=100000,
      cpu_quota=20000,
      stderr=True,
      stdout=True,
      detach=False,
      remove=True
    )

    output = container.decode().strip()
  except Exception as err:
    print(err)
    raise HTTPException(status_code=500, detail="Execution failed")
  finally:
    shutil.rmtree(temp_dir, ignore_errors=True)

  return {"output": output}