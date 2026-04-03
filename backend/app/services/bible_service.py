import requests

def fetch_bible_verse(ref: str):
    try:
        url = f"https://bible-api.com/{ref}"
        res = requests.get(url).json()
        return res.get("text", "")
    except:
        return ""