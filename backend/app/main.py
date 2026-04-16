from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.routes.auth import router as auth_router
from app.routes.audio_ws import router as ws_router

app = FastAPI(title="SermonLive API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # local dev
        "https://live-projector-one.vercel.app/",  # production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/auth")
app.include_router(ws_router)

@app.get("/")
def root():
    return {"message": "SermonLive backend running 🚀"}