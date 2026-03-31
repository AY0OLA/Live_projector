import re
from typing import Optional, Dict, Tuple, List

BOOKS = [
    "genesis","exodus","leviticus","numbers","deuteronomy",
    "joshua","judges","ruth","samuel","kings","chronicles",
    "ezra","nehemiah","esther","job","psalm","proverbs",
    "ecclesiastes","song","isaiah","jeremiah","ezekiel",
    "daniel","hosea","joel","amos","obadiah","jonah",
    "micah","nahum","habakkuk","zephaniah","haggai",
    "zechariah","malachi","matthew","mark","luke","john",
    "acts","romans","corinthians","galatians","ephesians",
    "philippians","colossians","thessalonians","timothy",
    "titus","philemon","hebrews","james","peter","jude",
    "revelation"
]

NUMBERS = {
    "one": "1", "two": "2", "three": "3", "four": "4",
    "five": "5", "six": "6", "seven": "7", "eight": "8",
    "nine": "9", "ten": "10", "eleven": "11", "twelve": "12",
    "thirteen": "13", "fourteen": "14", "fifteen": "15",
    "sixteen": "16", "seventeen": "17", "eighteen": "18",
    "nineteen": "19", "twenty": "20"
}

# common abbreviations and aliases
ALIASES = {
    "psalms": "psalm",
    "song of solomon": "song",
    "song of songs": "song",
    "songs": "song",
    "rev": "revelation",
    "jn": "john",
    "jhn": "john",
    "cor": "corinthians",
    "1 cor": "1 corinthians",
    "2 cor": "2 corinthians",
    "1 corinthians": "corinthians",
    "2 corinthians": "corinthians",
    "1 samuel": "samuel",
    "2 samuel": "samuel",
    "1 kings": "kings",
    "2 kings": "kings",
    "1 chronicles": "chronicles",
    "2 chronicles": "chronicles",
    "1 thess": "thessalonians",
    "2 thess": "thessalonians",
    "1 tim": "timothy",
    "2 tim": "timothy",
    "1 pet": "peter",
    "2 pet": "peter",
    "ps": "psalm",
    "psa": "psalm",
    "prov": "proverbs",
    "eccl": "ecclesiastes",
    "isa": "isaiah",
    "jer": "jeremiah",
    "ezr": "ezra",
    "neh": "nehemiah",
    "est": "esther",
    "dan": "daniel",
    "hos": "hosea",
    "joel": "joel",
    "amos": "amos",
    "jon": "jonah",
    "mic": "micah",
    "nah": "nahum",
    "hab": "habakkuk",
    "zep": "zephaniah",
    "hag": "haggai",
    "zec": "zechariah",
    "mal": "malachi",
    "matt": "matthew",
    "mark": "mark",
    "luke": "luke",
    "act": "acts",
    "rom": "romans",
    "gal": "galatians",
    "eph": "ephesians",
    "phil": "philippians",
    "col": "colossians",
    "philem": "philemon",
    "heb": "hebrews",
    "jas": "james",
    "jud": "jude"
}

# Build lookup with plurals and base forms
def build_lookup(books: List[str]) -> Dict[str, str]:
    lookup = {}
    for b in books:
        lookup[b] = b
        lookup[b + "s"] = b
    # add aliases
    for k, v in ALIASES.items():
        lookup[k] = v
    return lookup

BOOK_LOOKUP = build_lookup(BOOKS)

# Helpers
def normalize(text: str) -> str:
    s = text.lower()
    s = re.sub(r"[.,;:()\"']", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def replace_number_words(s: str) -> str:
    # handle ordinals first (first/second/third)
    s = re.sub(r"\bfirst\b", "1", s)
    s = re.sub(r"\bsecond\b", "2", s)
    s = re.sub(r"\bthird\b", "3", s)
    # replace number words (twenty three -> 20 3 -> combine later)
    tokens = s.split()
    out = []
    i = 0
    while i < len(tokens):
        t = tokens[i]
        if t in NUMBERS:
            # handle "twenty three" -> 23
            if t == "twenty" and i + 1 < len(tokens) and tokens[i+1] in NUMBERS:
                out.append(str(int(NUMBERS[t]) + int(NUMBERS[tokens[i+1]])))
                i += 2
                continue
            out.append(NUMBERS[t])
        else:
            out.append(t)
        i += 1
    return " ".join(out)

def find_book(text: str) -> Tuple[Optional[str], str, Optional[str]]:
    """
    Returns (book_key, rest_text, display_book)
    display_book includes numeric prefix if present (e.g., "1 Samuel")
    """
    text = normalize(text)
    text = replace_number_words(text)

    # check for numeric prefix like "1 samuel" or "1samuel"
    m = re.match(r"^(?P<prefix>[123])\s*(?P<book>[a-z ]+)", text)
    if m:
        prefix = m.group("prefix")
        book_part = m.group("book").strip()
        # try combined key
        combined = f"{prefix} {book_part}"
        if combined in BOOK_LOOKUP:
            book_key = BOOK_LOOKUP[combined]
            rest = text[len(m.group(0)):].strip()
            display = f"{prefix} {book_key.title()}"
            return book_key, rest, display
        # sometimes book_part is like "corinthians" and lookup expects "corinthians"
        if book_part in BOOK_LOOKUP:
            book_key = BOOK_LOOKUP[book_part]
            rest = text[len(m.group(0)):].strip()
            display = f"{prefix} {book_key.title()}"
            return book_key, rest, display

    # longest-first match for book names/aliases
    candidates = sorted(BOOK_LOOKUP.keys(), key=lambda x: -len(x))
    for name in candidates:
        if text.startswith(name + " ") or text == name:
            rest = text[len(name):].strip()
            return BOOK_LOOKUP[name], rest, BOOK_LOOKUP[name].title()
    # try to find book anywhere (not only start)
    for name in candidates:
        idx = text.find(" " + name + " ")
        if idx != -1:
            rest = text[idx + len(name) + 1:].strip()
            return BOOK_LOOKUP[name], rest, BOOK_LOOKUP[name].title()
    return None, text, None

def parse_chapter_verse(rest: str) -> Tuple[Optional[int], Optional[int], Optional[int]]:
    if not rest:
        return None, None, None
    r = rest.strip()
    r = r.replace("–", "-").replace("—", "-")
    # patterns:
    # 3:16-18, 3:16, 3 16-18, 3 16, 3, 16 (verse only)
    # cross-chapter like 3:16-4:2 (we return start chapter/verse and end chapter/verse as verse_end None for cross-chapter)
    # try chapter:verse-range with optional spaces
    m = re.match(r"^(\d+)\s*:\s*(\d+)\s*-\s*(\d+)\s*:\s*(\d+)", r)
    if m:
        ch1, v1, ch2, v2 = map(int, m.groups())
        return ch1, v1, v2 if ch1 == ch2 else v1, v2
    m = re.match(r"^(\d+)\s*:\s*(\d+)\s*-\s*(\d+)", r)
    if m:
        ch, v1, v2 = map(int, m.groups())
        return ch, v1, v2
    m = re.match(r"^(\d+)\s*:\s*(\d+)", r)
    if m:
        ch, v = map(int, m.groups())
        return ch, v, v
    # patterns like "3 16-18" or "3 16"
    m = re.match(r"^(\d+)\s+(\d+)\s*-\s*(\d+)", r)
    if m:
        ch, v1, v2 = map(int, m.groups())
        return ch, v1, v2
    m = re.match(r"^(\d+)\s+(\d+)", r)
    if m:
        ch, v = map(int, m.groups())
        return ch, v, v
    # single chapter "3" or "chapter 3"
    m = re.search(r"(?:chapter\s*)?^?(\d+)$", r)
    if m and r.strip().isdigit():
        return int(r.strip()), None, None
    # verse only "verse 16" or just "16" (ambiguous; treat as verse with chapter None)
    m = re.search(r"verse\s+(\d+)", r)
    if m:
        v = int(m.group(1))
        return None, v, v
    if r.isdigit():
        # ambiguous: could be chapter or verse; prefer chapter if book commonly has many chapters (heuristic omitted)
        return int(r), None, None
    return None, None, None

def detect_verse(text: str) -> Optional[Dict[str, Optional[object]]]:
    original = text
    book_key, rest, display = find_book(text)
    if not book_key:
        return None
    chapter, vstart, vend = parse_chapter_verse(rest)
    # if verse present but chapter missing, assume chapter 1 only when book is a short book? keep conservative: set chapter None
    return {
        "raw": original,
        "book_key": book_key,            # canonical key like "samuel" or "psalm"
        "book_display": display,         # e.g., "1 Samuel" or "Psalm"
        "chapter": chapter,
        "verse_start": vstart,
        "verse_end": vend
    }

# quick tests
if __name__ == "__main__":
    tests = [
        "John 3:16",
        "John 3 16",
        "john chapter 3 verse 16",
        "first john 2:1-6",
        "psalm twenty three",
        "psalms 23:1",
        "1 cor 13",
        "1 Corinthians 13",
        "2 Timothy 3:16",
        "revelation 22:21",
        "1 samuel 17:4-58",
        "song of solomon 2:1-3",
        "mark 5:1-20",
        "genesis 1",
        "john 3",
        "16"  # ambiguous
    ]
    for t in tests:
        print(t, "->", detect_verse(t))
