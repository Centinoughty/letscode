from database import Base, engine
from models.user import User
from models.code import Code
from models.collaborator import Collaborator

Base.metadata.create_all(bind=engine)

print("All tables created succesfully")