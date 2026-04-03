import whisper
import tempfile

model = whisper.load_model("base")

def transcribe_audio_bytes(audio_bytes: bytes):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f:
            f.write(audio_bytes)
            result = model.transcribe(f.name)

        return result["text"]
    except Exception as e:
        print("Transcription error:", e)
        return ""