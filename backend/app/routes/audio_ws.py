import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from collections import defaultdict

router = APIRouter()

# Store connections per session
sessions = defaultdict(list)

@router.websocket("/ws/audio")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    session_id = websocket.query_params.get("session", "default")
    role = websocket.query_params.get("role", "audience")

    sessions[session_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_bytes()

            # 🔊 Convert audio → text
            text = transcribe_audio_bytes(data)

            # 📖 Detect verse
            verse_ref = detect_verse(text)

            verse_text = ""
            if verse_ref:
                verse_text = fetch_bible_verse(verse_ref)

            # 🌍 Translate
            translation = translate_text(text)

            payload = {
                "transcript": text,
                "translation": translation,
                "verse": verse_ref,
                "verse_text": verse_text
            }

            # 📡 Broadcast to all in session
            for client in sessions[session_id]:
                await client.send_json(payload)

    except WebSocketDisconnect:
        sessions[session_id].remove(websocket)