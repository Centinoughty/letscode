from fastapi import HTTPException

from sqlalchemy.orm import Session
from utils.security import get_user_by_email, get_user_by_username, hash_password, verify_password, create_access_token
from schemas.user import UserCreate, UserLogin
from models.user import User

# FUNTION TO REGISTER A USER
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
  
  data = {"email": db_user.email, "id": db_user.id}
  access_token = create_access_token(data)
  
  return {"token": access_token, "token_type": "bearer", "user": data}


# FUNCTION TO AUTHENTICATE A USER
def authenticate_user(db: Session, email: str, password):
  user = get_user_by_email(db, email)
  if not user:
    raise HTTPException(status_code=401, detail="User not found")
  
  if not verify_password(password, user.password):
    raise HTTPException(status_code=401, detail="Incorrect password")
  
  return user


# FUNCTION TO LOGIN A USER
def login_user(db: Session, user: UserLogin):
  user = authenticate_user(db, user.email, user.password)
  data = {"email": user.email, "id": user.id}
  access_token = create_access_token(data)
  return {"token": access_token, "token_type": "bearer", "user": data}