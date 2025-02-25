from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.user import UserCreate
from database import get_db
from crud.user import register_user

router = APIRouter()

@router.post("/register")
def register(user: UserCreate, db:Session = Depends(get_db)):
  try:
    register_user(db, user)
    return {"message": "User registered"}
  except:
    raise HTTPException(status_code=500, detail="Internal Server Error")