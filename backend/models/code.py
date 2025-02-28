import uuid
from database import Base
from sqlalchemy.sql import func
from sqlalchemy import Column, String, Integer, Text, Enum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID

class Code(Base):
  __tablename__ = "codes"
  
  id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4, unique=True)
  file_name = Column(String)
  code = Column(Text)
  language = Column(Enum("cpp", "c", "py", name="language"), default="cpp")
  owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  created_at = Column(DateTime, default=func.now())
  updated_at = Column(DateTime, default=func.now(), onupdate=func.now())