import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
SERVER_DIR = Path(__file__).resolve().parent
STORAGE_DIR = SERVER_DIR / "storage"
STORAGE_TEMP_DIR = STORAGE_DIR / "temp"
UPLOADED_JD_PATH = STORAGE_DIR / "uploaded_jd.txt"
FRONTEND_DIST_DIR = BASE_DIR / "frontend" / "dist"

# Ensure storage directories exist
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
STORAGE_TEMP_DIR.mkdir(parents=True, exist_ok=True)

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

# ── Gemini ───────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# ── Upload constraints ───────────────────────────────────────────────────────
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".pdf", ".txt"}

