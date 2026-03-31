from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def translate(text: str):
    return {"translated": f"Translated: {text}"}