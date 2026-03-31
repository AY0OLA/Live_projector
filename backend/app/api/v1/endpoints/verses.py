from fastapi import APIRouter

router = APIRouter()

@router.get("/detect")
async def detect_verse(text: str):
    if "john 3:16" in text.lower():
        return {
            "reference": "John 3:16",
            "text": "For God so loved the world..."
        }
    return {"reference": None}