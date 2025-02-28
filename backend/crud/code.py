from fastapi import HTTPException
import docker
import uuid
import os
import shutil
import asyncio
from collections import deque

from sqlalchemy.orm import Session
from schemas.code import CodeCreate
from utils.security import get_user_from_token
from models.code import Code

client = docker.from_env()

MAX_CONCURRENT_CONTAINERS = 7
container_queue = deque()

def find_code(db: Session, code_id: uuid.UUID):
  return db.query(Code).filter(Code.id == code_id).first()

def create_code(db: Session, code: CodeCreate, token: str):
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")
  
  db_code = Code(
    file_name=code.file_name,
    code="",
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
  
  code.code = code_input
  db.commit()
  db.refresh(code)
  return {"code_id": code.id}

async def run_container(image, cmd, temp_dir):
  if len(container_queue) >= MAX_CONCURRENT_CONTAINERS:
    while len(container_queue) >= MAX_CONCURRENT_CONTAINERS:
      await asyncio.sleep(0.1)

  container_queue.append(1)
  try:
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
    output = {"Error": err}
  finally:
    container_queue.popleft()
  
  return output

def run_code(db: Session, code_id: uuid.UUID, stdin: str, token: str):
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")
  
  code = find_code(db, code_id)
  if not code:
    raise HTTPException(status_code=404, detail="Code not found")
  
  if code.owner_id != user.id:
    raise HTTPException(status_code=403, detail="Not authorized")
  
  temp_dir = f"/tmp/{uuid.uuid4()}"
  os.makedirs(temp_dir, exist_ok=True)
  
  source_file = os.path.join(temp_dir, f"main.{code.language}")
  input_file = os.path.join(temp_dir, "input.txt")
  
  with open(source_file, "w") as f:
    f.write(code.code)
  
  with open(input_file, "w") as f:
    f.write(stdin)
    
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
  
  try:
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