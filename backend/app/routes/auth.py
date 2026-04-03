from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.services.db import SessionLocal, engine, Base
from app.services.auth_service import User, hash_password, verify_password, create_token

router = APIRouter()

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🔐 SIGNUP
@router.post("/signup")
def signup(email: str, password: str, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(400, "User already exists")

    user = User(
        email=email,
        password=hash_password(password)
    )

    db.add(user)
    db.commit()

    return {"message": "User created"}

# 🔐 LOGIN
@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.password):
        raise HTTPException(401, "Invalid credentials")

    token = create_token({"user_id": user.id})

    return {"token": token}