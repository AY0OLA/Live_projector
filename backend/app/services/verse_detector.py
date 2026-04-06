import requests

def fetch_bible_verse(ref: str):
    try:
        url = f"https://bible-api.com/{ref}"
        res = requests.get(url).json()
        return res.get("text", "")
    except Exception as e:
        print("Bible fetch error:", e)
        return ""

def detect_verse(ref: str):
    return fetch_bible_verse(ref)
