from fastapi import HTTPException

from sqlalchemy.orm import Session
from schemas.code import CodeCreate
from utils.security import decode_access_token
from crud.user import get_user_by_email

from models.code import Code

def create_code(db: Session, code: CodeCreate, token: str):
  payload = decode_access_token(token)
  if payload is None:
    raise HTTPException(status_code=401, detail="Invalid or expired token")
  
  user_email = payload.get("sub")
  if not user_email:
    raise HTTPException(status_code=401, detail="Invalid token data")
  
  user = get_user_by_email(db, user_email)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  
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