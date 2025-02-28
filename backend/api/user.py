from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.user import UserCreate, UserLogin
from database import get_db
from crud.user import register_user, login_user

router = APIRouter()

@router.post("/register")
def register(user: UserCreate, db:Session = Depends(get_db)):
  try:
    register_user(db, user)
    return {"message": "User registered"}
  except HTTPException as err:
    raise err
  except Exception as err:
    raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
  try:
    return login_user(db, user)
  except HTTPException as err:
    raise err
  except Exception as err:
    raise HTTPException(status_code=500, detail="Internal Server Error")