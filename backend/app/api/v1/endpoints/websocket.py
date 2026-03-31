from fastapi import APIRouter, WebSocket
import asyncio

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    # Simulate live sermon stream
    messages = [
        "For God so loved the world",
        "that He gave His only Son",
        "John 3:16"
    ]

    for msg in messages:
        await asyncio.sleep(2)

        data = {
            "transcript": msg,
            "verse": "John 3:16" if "john" in msg.lower() else None,
            "translation": f"Translated: {msg}"
        }

        await websocket.send_json(data)

    await websocket.close()