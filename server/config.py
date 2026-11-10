import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
SERVER_DIR = Path(__file__).resolve().parent
STORAGE_DIR = BASE_DIR / "data"
STORAGE_TEMP_DIR = STORAGE_DIR / "temp"
UPLOADED_JD_PATH = STORAGE_DIR / "uploaded_jd.txt"
FRONTEND_DIST_DIR = BASE_DIR / "frontend" / "dist"

# ── LiveKit ──────────────────────────────────────────────────────────────────
LIVEKIT_URL = os.environ.get("LIVEKIT_URL")
LIVEKIT_API_KEY = os.environ.get("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.environ.get("LIVEKIT_API_SECRET")

# ── MongoDB ──────────────────────────────────────────────────────────────────
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")

# ── JWT / Auth ───────────────────────────────────────────────────────────────
JWT_SECRET = os.environ.get("JWT_SECRET", "super_secret_fallback")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")

# ── Model & Speech Providers ─────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GNANI_API_KEY = os.environ.get("GNANI_API_KEY")

# Groq LPU Ultra-Fast Voice Inference (< 150ms TTFT) with Gemini fallback
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

# Primary fallback model: lightweight, ultra-fast (0.76s), zero thinking overhead, high rate-limits
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite")
GEMINI_FALLBACK_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.8-flash",
]

# ── Upload constraints ───────────────────────────────────────────────────────
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".pdf", ".txt"}

