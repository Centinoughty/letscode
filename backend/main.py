from fastapi import FastAPI
from api.user import router as auth_router
from api.code import router as code_router

app = FastAPI()

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(code_router, prefix="/api/code", tags=["code"])