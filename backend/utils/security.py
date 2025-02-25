from sqlalchemy.orm import Session
from models.user import User
from passlib.context import CryptContext
from dotenv import load_dotenv
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os

load_dotenv
ALGORITHM = os.getenv("ALGORITHM", "")
SECRET_KEY = os.getenv("SECRET_KEY", "")
ACCESS_TOKEN_EXPIRY = 120

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
  return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
  return db.query(User).filter(User.username == username).first()

def hash_password(password: str) -> str:
  return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
  return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
  to_encode = data.copy()
  expiry = datetime.now() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRY))
  to_encode.update({"exp": expiry})
  return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)