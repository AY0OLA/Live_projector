from fastapi import APIRouter
from app.api.v1.endpoints import speech, verses, translation

from app.api.v1.endpoints import audio_ws
from app.api.v1.endpoints import websocket
api_router = APIRouter()

api_router.include_router(speech.router, prefix="/speech", tags=["Speech"])
api_router.include_router(verses.router, prefix="/verses", tags=["Verses"])
api_router.include_router(translation.router, prefix="/translation", tags=["Translation"])


api_router.include_router(websocket.router)

api_router.include_router(audio_ws.router)