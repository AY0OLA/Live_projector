from fastapi import APIRouter

router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio():
    return {"text": "Sample transcription from audio"}