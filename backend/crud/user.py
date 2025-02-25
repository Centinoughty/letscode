from fastapi import HTTPException

from sqlalchemy.orm import Session
from utils.security import get_user_by_email, get_user_by_username, hash_password
from schemas.user import UserCreate
from models.user import User

def register_user(db: Session, user: UserCreate):
  existing_email = get_user_by_email(db, user.email)
  if existing_email:
    raise HTTPException(status_code=409, detail="Email already exist")
  
  existing_username = get_user_by_username(db, user.username)
  if existing_username:
    raise HTTPException(status_code=409, detail="Username already exist")
  
  hashed_password = hash_password(user.password)
  
  db_user = User(
    email=user.email,
    username=user.username,
    password=hashed_password,
  )
  
  db.add(db_user)
  db.commit()
  db.refresh(db_user)
  
  return db_user