import requests

def translate_text(text: str, target_lang="en"):
    try:
        url = "https://translate.googleapis.com/translate_a/single"

        params = {
            "client": "gtx",
            "sl": "auto",
            "tl": target_lang,
            "dt": "t",
            "q": text
        }

        response = requests.get(url, params=params)
        data = response.json()

        return data[0][0][0]

    except Exception as e:
        print("Translation error:", e)
        return ""