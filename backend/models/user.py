from database import Base
from sqlalchemy.sql import func
from sqlalchemy import Column, Integer, String, Boolean, DateTime

class User(Base):
  __tablename__ = "users"
  
  id = Column(Integer, primary_key=True, index=True)
  email = Column(String, unique=True, index=True)
  username = Column(String, unique=True, index=True)
  password = Column(String)
  is_verified = Column(Boolean, default=False)
  is_admin = Column(Boolean, default=False)
  created_at = Column(DateTime, default=func.now())
  modified_at = Column(DateTime, default=func.now(), onupdate=func.now())