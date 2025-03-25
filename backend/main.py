from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.user import router as auth_router
from api.code import router as code_router

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"], # for testing purpose only, need to change it at the time of production
  allow_credentials=True,
  allow_methods=["POST", "GET"],
  allow_headers=["*"]
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(code_router, prefix="/api/code", tags=["code"])