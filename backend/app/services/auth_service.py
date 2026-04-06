from sqlalchemy import Column, Integer, String, DateTime
from app.services.db import Base
from sqlalchemy.sql import func
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from ..config import settings

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
DAYS= settings.access_token_expire_days

pwd_context = CryptContext(schemes=["bcrypt_sha256", "bcrypt"], deprecated="auto")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True)
    password = Column(String(128))
    created_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)



def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def create_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(days=DAYS)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)