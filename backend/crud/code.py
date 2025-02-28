from fastapi import HTTPException
import uuid

from sqlalchemy.orm import Session
from schemas.code import CodeCreate
from utils.security import get_user_from_token

from models.code import Code

def create_code(db: Session, code: CodeCreate, token: str):
  user = get_user_from_token(db, token)
  if not user:
    raise HTTPException(status_code=401, detail="Invalid token")
  
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
    raise HTTPException(status_code=401, detail="Invalid token")
  
  code = db.query(Code).filter(Code.id == code_id).first()
  if not code:
    raise HTTPException(status_code=404, detail="Code not found")
  
  if code.owner_id != user.id:
    raise HTTPException(status_code=403, detail="Not authoruized")
  
  db.delete(code)
  db.commit()