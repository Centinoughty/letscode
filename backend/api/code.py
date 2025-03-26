import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from schemas.code import CodeCreate, CodeInput, CodeRun
from schemas.collaborator import CollaboratorCreate, CollaboratorRemove
from crud.code import create_code, delete_code, run_code, save_code, add_collaborator, remove_collaborator, update_access_level, get_collaborated_codes, get_owned_codes
from utils.security import get_user_from_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# create a code
@router.post("/create")
def create(code: CodeCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
  try:
    code = create_code(db, code, token)
    return {"code": code}
  except HTTPException as err:
    raise err
  except:
    raise HTTPException(status_code=500, detail="Internal Server Error")


# delete a code
@router.delete("/{code_id}")
def delete(code_id: str, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
  try:
    delete_code(db, code_id, token)
    return {"message": "Code deleted succesfully"}
  except HTTPException as err:
    raise err
  except Exception as err:
    raise HTTPException(status_code=500, detail="Internal Server Error")


# save a code
@router.put("/{code_id}/save")
def save(code_id: uuid.UUID, code: CodeInput, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
  try:
    response = save_code(db, code_id, code.code_input, token)
    return response
  except HTTPException as err:
    raise err
  except Exception as err:
    print(err)
    raise HTTPException(status_code=500, detail="Internal Server Error")


# run a code
@router.post("/run/{code_id}")
def run(code_id: str, code: CodeRun, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
  try:
    return run_code(db, code_id, code.stdin, token)
  except HTTPException as err:
    raise err
  except Exception as err:
    raise HTTPException(status_code=500, detail="Internal Server Error")


# get all codes
@router.get("/all")
def get_all_codes(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
  try:
    user = get_user_from_token(db, token)
    if not user:
      raise HTTPException(status_code=401, detail="No access")
    
    owned_codes = get_owned_codes(db, token)
    collaborated_codes = get_collaborated_codes(db, token)
    return {
      "owned_codes": owned_codes,
      "collaborated_codes": collaborated_codes
    }
  except HTTPException as err:
    raise err
  except Exception as err:
    raise HTTPException(status_code=500, detail="Internal Server Error")


# add a collaborator to a code
@router.post("/{code_id}/collaborators/add")
def add_collaborator_to_code(code_id: uuid.UUID, collaborator: CollaboratorCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
  try:
    collaborator = add_collaborator(db, code_id, collaborator, token)
    return {"message": "Collaborator added succesfully"}
  except HTTPException as err:
    raise err
  except Exception as err:
    raise HTTPException(status_code=500, detial="Internal Server Error")


# removing a colaborator
@router.delete("/{code_id}/collaborators/remove")
def remove_collaborator_from_code(code_id: uuid.UUID, user: CollaboratorRemove, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
  try:
    response = remove_collaborator(db, code_id, user.user_email, token)
    return response
  except HTTPException as err:
    raise err
  except Exception as err:
    raise HTTPException(status_code=500, detail="Internal Server Error")


# update access level of collaborator
@router.put("/{code_id}/collaborators/update")
def update_collab_access_level(code_id: uuid.UUID, user: CollaboratorCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
  try:
    response = update_access_level(db, code_id, user, token)
    return response
  except HTTPException as err:
    raise err
  except Exception as err:
    raise HTTPException(status_code=500, detail="Internal Server Error")