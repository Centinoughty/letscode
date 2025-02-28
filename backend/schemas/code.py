from pydantic import BaseModel

class CodeCreate(BaseModel):
  file_name: str
  language: str