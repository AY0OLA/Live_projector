import whisper
import tempfile
import os

model = whisper.load_model("base")  # small, fast model

def transcribe_audio_bytes(audio_bytes: bytes) -> str:
    # Save temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        result = model.transcribe(tmp_path)
        return result["text"]
    except Exception as e:
        print("Whisper error:", e)
        return ""
    finally:
        os.remove(tmp_path)