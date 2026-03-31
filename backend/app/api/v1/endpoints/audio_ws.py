from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from typing import Optional, Dict, Any

from app.services.speech_service import transcribe_audio_bytes
from app.services.verse_detector import detect_verse

router = APIRouter()

def make_response(transcript: str, verse: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    payload = {"transcript": transcript}
    if verse is not None:
        payload["verse"] = verse
    return payload

@router.websocket("/ws/audio")
async def audio_stream(websocket: WebSocket):
    await websocket.accept()
    client = websocket.client
    print("Client connected", client)

    # Optional buffer if you want to accumulate multiple chunks before transcribing
    buffer = bytearray()
    # If your transcribe_audio_bytes expects a complete file, accumulate and call periodically
    # If it accepts short chunks, you can call it per chunk

    try:
        while True:
            # receive_bytes will raise WebSocketDisconnect when client closes
            audio_bytes = await websocket.receive_bytes()

            # If you want to accumulate and transcribe every N bytes or seconds:
            # buffer.extend(audio_bytes)
            # if len(buffer) < SOME_THRESHOLD:
            #     continue
            # to_transcribe = bytes(buffer)
            # buffer.clear()

            # Run transcription in threadpool to avoid blocking the event loop
            loop = asyncio.get_running_loop()
            text = await loop.run_in_executor(None, transcribe_audio_bytes, audio_bytes)

            if not text:
                # send empty transcript or skip
                continue

            # Detect verse from the transcribed text
            verse = None
            try:
                verse = detect_verse(text)
            except Exception as e:
                # keep verse None but log error
                print("Verse detection error:", e)

            # Build and send JSON response
            payload = make_response(text, verse)
            try:
                await websocket.send_json(payload)
            except Exception as e:
                print("Failed to send to client:", e)
                # break to close connection
                break

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        # Log unexpected errors and attempt to close
        print("Connection closed with error:", e)
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
        print("WebSocket handler finished for", client)
