from sqlalchemy.orm import Session
from models.user import User
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv
ALGORITHM = os.getenv("ALGORITHM", "")
SECRET_KEY = os.getenv("SECRET_KEY", "")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
  return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
  return db.query(User).filter(User.username == username).first()

def hash_password(password: str) -> str:
  return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
  return pwd_context.verify(plain_password, hashed_password)