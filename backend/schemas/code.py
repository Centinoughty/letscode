from pydantic import BaseModel

class CodeCreate(BaseModel):
  file_name: str
  language: str

class CodeInput(BaseModel):
  code_input: str

class CodeRun(BaseModel):
  stdin: str