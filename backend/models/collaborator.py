from database import Base
from sqlalchemy import Column, Integer, ForeignKey, Enum, UniqueConstraint, Boolean

class Collaborator(Base):
  __tablename__ = "collaborators"
  
  id = Column(Integer, primary_key=True, index=True)
  code_id = Column(ForeignKey("codes.id", ondelete="CASCADE"), nullable=False)
  user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  access_level = Column(Enum("read", "write", name="access_level"), nullable=False)
  accepted = Column(Boolean, nullable=False, default=False)

  __table_args__ = (UniqueConstraint("code_id", "user_id", name="unique_code_user"),)