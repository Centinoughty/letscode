from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from schemas.user import UserCreate, UserLogin
from database import get_db
from crud.user import register_user, login_user
from utils.security import get_user_from_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

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

# get logged in user details
@router.get("/me", response_model=None)
def get_logged_in_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
  try:
    user = get_user_from_token(db, token)
    if not user:
      raise HTTPException(status_code=401, detail="User not found")

    response = {"email": user.email, "id": user.id}
    return {"message": "User details fetched", "user": response}
  except HTTPException as err:
    raise err
  except Exception as err:
    print(err)
    raise HTTPException(status_code=500, detail="Internal Server Error")