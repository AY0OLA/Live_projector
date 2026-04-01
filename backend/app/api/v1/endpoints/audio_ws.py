from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from typing import Optional, Dict, Any

from app.services.speech_service import transcribe_audio_bytes
from app.services.verse_detector import detect_verse
from app.services.translation_service import translate_text

router = APIRouter()


def make_response(
    transcript: str,
    translation: Optional[str] = None,
    verse: Optional[Dict[str, Any]] = None,
    verse_text: Optional[str] = None,
) -> Dict[str, Any]:
    payload: Dict[str, Any] = {"transcript": transcript}
    if translation is not None:
        payload["translation"] = translation
    if verse is not None:
        payload["verse"] = verse
    if verse_text is not None:
        payload["verse_text"] = verse_text
    return payload


@router.websocket("/ws/audio")
async def audio_stream(websocket: WebSocket):
    """
    WebSocket endpoint that receives raw audio bytes from the client,
    transcribes them, optionally detects verse references, translates the
    transcript, and sends JSON responses back to the client.

    Expected client behavior:
      - Connect to /ws/audio
      - Send binary audio chunks (e.g., small PCM/ogg/webm blobs)
      - Close the socket when finished
    """
    await websocket.accept()
    client = websocket.client
    print("Client connected", client)

    # Optional accumulation buffer if your transcriber expects larger chunks
    buffer = bytearray()

    try:
        loop = asyncio.get_running_loop()

        while True:
            # receive_bytes will raise WebSocketDisconnect when client closes
            audio_bytes = await websocket.receive_bytes()

            # If you want to accumulate and transcribe every N bytes or seconds,
            # you can extend the buffer and only transcribe when it reaches a threshold.
            # For now we transcribe each chunk as-is:
            if not audio_bytes:
                continue

            # Run transcription in a threadpool to avoid blocking the event loop
            try:
                text: str = await loop.run_in_executor(
                    None, transcribe_audio_bytes, audio_bytes
                )
            except Exception as e:
                # Log and notify client of transcription error, but keep connection alive
                print("Transcription error:", e)
                try:
                    await websocket.send_json({"error": "transcription_failed"})
                except Exception:
                    break
                continue

            if not text:
                # No transcript returned for this chunk; skip sending
                continue

            # Detect verse from the transcribed text (non-blocking if fast)
            verse_ref = None
            verse_data = None
            try:
                verse_data = detect_verse(text)
                # detect_verse may return None or a dict like {"reference": "...", "text": "..."}
                if isinstance(verse_data, dict) and "reference" in verse_data:
                    verse_ref = verse_data.get("reference")
            except Exception as e:
                # keep verse_data None but log error
                print("Verse detection error:", e)
                verse_data = None
                verse_ref = None

            # Translate the text (run in executor if blocking)
            translated = None
            try:
                translated = await loop.run_in_executor(None, translate_text, text, "en")
            except Exception as e:
                print("Translation error:", e)
                translated = None

            # Build and send JSON response
            payload = make_response(
                transcript=text,
                translation=translated,
                verse=verse_ref,
                verse_text=verse_data.get("text") if verse_data else None,
            )

            try:
                await websocket.send_json(payload)
            except Exception as e:
                print("Failed to send to client:", e)
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
