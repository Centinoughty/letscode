from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from schemas.code import CodeCreate
from crud.code import create_code, delete_code

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/create")
def create(code: CodeCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
  try:
    code = create_code(db, code, token)
    return {"code_id": code.id}
  except HTTPException as err:
    raise err
  except:
    raise HTTPException(status_code=500, detail="Internal Server Error")

@router.delete("/{code_id}")
def delete(code_id: str, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
  try:
    delete_code(db, code_id, token)
    return {"message": "Code deleted succesfully"}
  except HTTPException as err:
    raise err
  except Exception as err:
    raise err