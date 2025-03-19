from pydantic import BaseModel, UUID4
from enum import Enum

class AccessLevel(str, Enum):
  read = "read"
  write = "write"

class CollaboratorCreate(BaseModel):
  user_email: str
  access_level: AccessLevel