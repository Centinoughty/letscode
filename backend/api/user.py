from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.user import UserCreate, UserLogin
from database import get_db
from crud.user import register_user, login_user

router = APIRouter()

# register a user
@router.post("/register")
def register(user: UserCreate, db:Session = Depends(get_db)):
  try:
    response = register_user(db, user)
    return {"message": "User registered", "token": response["token"], "token_type": response["token_type"], "user": response["user"]}
  except HTTPException as err:
    raise err
  except Exception as err:
    raise HTTPException(status_code=500, detail="Internal Server Error")


# login a user
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
  try:
    response = login_user(db, user)
    return {"message": "Login successful", "token": response["token"], "token_type": response["token_type"], "user": response["user"]}
  except HTTPException as err:
    raise err
  except Exception as err:
    raise HTTPException(status_code=500, detail="Internal Server Error")