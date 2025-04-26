from fastapi import HTTPException
import docker
import uuid
import os
import shutil

from sqlalchemy.orm import Session
from schemas.code import CodeCreate
from utils.security import get_user_from_token, get_user_by_email
from models.code import Code
from models.collaborator import Collaborator
from schemas.collaborator import CollaboratorCreate

client = docker.from_env()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


### -- HELPER FUNCTIONS --
def find_code(db: Session, code_id: uuid.UUID):
  return db.query(Code).filter(Code.id == code_id).first()


def get_collaborators(db: Session, code_id: uuid.UUID):
  return db.query(Collaborator).filter(Collaborator.code_id == code_id).all()


def get_file_path(code_id: uuid.UUID, language: str):
  ext = {"py": "py", "cpp": "cpp", "c": "c"}.get(language, None)
  if not ext:
    raise HTTPException(status_code=400, detail="unsupported language")

  return os.path.join(UPLOAD_DIR, f"{code_id}.{ext}")


# find the collaborator to a code
def get_collaborator_for_code(db: Session, code_id: uuid.UUID, user_id: int):
  return db.query(Collaborator).filter(
    Collaborator.code_id == code_id,
    Collaborator.user_id == user_id
  ).first()


# check the access level for the collaborator
def get_access_level(db: Session, code_id: uuid.UUID, user_id: int):
  if (is_admin(db, code_id, user_id)):
    return "write"

  collaborator = get_collaborator_for_code(db, code_id, user_id)
  if not collaborator:
    return None

  return collaborator.access_level


# check if the user is the owner
def is_admin(db: Session, code_id: uuid.UUID, user_id: int):
  code = find_code(db, code_id)
  if not code:
    return False
  
  return code.owner_id == user_id


### FUNCTION TO CREATE A CODE
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


### FUNCTION TO DELETE A CODE
def delete_code(db: Session, code_id: uuid.UUID, token: str):
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")

  code = find_code(db, code_id)
  if not code:
    raise HTTPException(status_code=404, detail="Code not found")

  if code.owner_id != user.id:
    raise HTTPException(status_code=403, detail="Not authorized")

  if os.path.exists(code.code_path):
    os.remove(code.code_path)

  db.delete(code)
  db.commit()
  return


### FUNTION TO SAVE A CODE
def save_code(db: Session, code_id: uuid.UUID, code_input: str, token: str):
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")

  code = find_code(db, code_id)
  if not code:
    raise HTTPException(status_code=404, detail="Code not found")

  if code.owner_id != user.id:
    collaborator_access_level = get_access_level(db, code_id, user.id)
    if collaborator_access_level != "write":
      raise HTTPException(status_code=403, detail="Not authorized")

  with open(code.code_path, "w") as f:
    f.write(code_input)

  return {"code_id": code.id}


### FUNTION TO GET A CODE
def get_code_data(db: Session, code_id: uuid.UUID, token: str):
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")
  
  code = find_code(db, code_id)
  if not code:
    raise HTTPException(status_code=404, detail="Code not found")
  
  if code.owner_id != user.id:
    all_collaborators = get_collaborators(db, code_id)
    if user.id not in [collab.user_id for collab in all_collaborators]:
      raise HTTPException(status_code=403, detail="You do not permission to access the code")
  
  if not os.path.exists(code.code_path):
    raise HTTPException(status_code=404, detail="Code file not found")
  
  try:
    with open(code.code_path, "r") as f:
      code_content = f.read()
  except Exception as err:
    raise HTTPException(status_code=500, detail="Failed to read code contents")
    
  return {
    "code_id": str(code_id),
    "owner_id": str(code.owner_id),
    "code": code_content,
    "language": code.language
  }


### FUNCTION TO RUN A CODE
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
    collab_access_level = get_access_level(db, code_id, user.id)
    if collab_access_level not in ["read", "write"]:
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

    # create a container
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


# FUNCTION TO ADD A COLLABORATOR(READ, WRITE)
def add_collaborator(db: Session, code_id: str, collaborator: CollaboratorCreate, token: str):
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")
  
  code = find_code(db, code_id)
  if not code:
    raise HTTPException(status_code=404, detail="Code not found")
  
  if code.owner_id != user.id:
    raise HTTPException(status_code=403, detail="Not authorized")
  
  collab_user = get_user_by_email(db, collaborator.user_email)
  if not collab_user:
    raise HTTPException(status_code=400, detail="User not found")
  
  if collab_user.id == code.owner_id:
    raise HTTPException(status_code=400, detail="Owner cannot be a collaborator")
  
  user_id = collab_user.id
  existing_collaborator = get_collaborator_for_code(db, code_id, user_id)
  if existing_collaborator:
    raise HTTPException(status_code=400, detail="User is already added as a collaborator")
  
  new_collaborator = Collaborator(
    code_id=code_id,
    user_id=user_id,
    access_level=collaborator.access_level
  )
  
  db.add(new_collaborator)
  db.commit()
  db.refresh(new_collaborator)
  return new_collaborator


# FUNCTION TO REMOVE A COLLABORATOR
def remove_collaborator(db: Session, code_id: uuid.UUID, user_email: str, token: str):
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")
  
  code = find_code(db, code_id)
  if not code:
    raise HTTPException(status_code=404, detail="Code not found")
  
  if code.owner_id != user.id:
    raise HTTPException(status_code=403, detail="Not authorized")
  
  collab_user = get_user_by_email(db, user_email)
  if not collab_user:
    raise HTTPException(status_code=400, detail="User not found")
  
  user_id = collab_user.id
  existing_collaborator = get_collaborator_for_code(db, code_id, user_id)
  if not existing_collaborator:
    raise HTTPException(status_code=404, detail="Collaborator does not exist")
  
  db.delete(existing_collaborator)
  db.commit()
  return {"message": "Collaborator removed successfully"}


# FUNCTION TO UPDATE ACCESS LEVEL OF COLLABORATOR
def update_access_level(db: Session, code_id: uuid.UUID, collaborator: CollaboratorCreate, token: str):
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")
  
  code = find_code(db, code_id)
  if not code:
    raise HTTPException(status_code=404, detail="Code not found")
  
  if code.owner_id != user.id:
    raise HTTPException(status_code=403, detail="Not authorized")
  
  collab_user = get_user_by_email(db, collaborator.user_email)
  if not collab_user:
    raise HTTPException(status_code=400, detail="User not found")
  
  if collab_user.id == code.owner_id:
    raise HTTPException(status_code=400, detail="Owner cannot be updated as collaborator")
  
  user_id = collab_user.id
  existing_collaborator = get_collaborator_for_code(db, code_id, user_id)
  if not existing_collaborator:
    raise HTTPException(status_code=404, detail="Collaborator does not exist")

  existing_collaborator.access_level = collaborator.access_level
  
  db.commit()
  db.refresh(existing_collaborator)
  
  return {"message": "Collaborator access level updated successfully"}


### -- FUNCTION TO GET CODES OWNED BY --
def get_owned_codes(db: Session, token: str):
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")
  
  all_codes = db.query(Code).filter(Code.owner_id == user.id).all()
  return all_codes


### -- FUNCTION TO GET CODES COLLABORATED WITH --
def get_collaborated_codes(db: Session, token: str):
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="No access")
  
  collaborated_codes = db.query(Code).join(Collaborator).filter(Collaborator.user_id == user.id, Collaborator.accepted == True).all()
  return collaborated_codes
