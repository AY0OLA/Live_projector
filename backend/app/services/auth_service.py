from sqlalchemy import Column, Integer, String
from app.services.db import Base
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

# SECRET_KEY = 
# ALGORITHM = 

pwd_context = CryptContext(schemes=["bcrypt"])

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True)
    password = Column(String)





def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)

def create_token(data: dict):
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(days=1)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)