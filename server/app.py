import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from server.config import (
    LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET,
    FRONTEND_DIST_DIR, STORAGE_DIR, STORAGE_TEMP_DIR,
)
from server.api.auth import router as auth_router
from server.api.interviews import router as interviews_router
from server.api.uploads import router as uploads_router

# ── Validate required env vars at startup ────────────────────────────────────
if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET or not LIVEKIT_URL:
    raise ValueError("LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET must be set in the .env file")

# ── Application Lifespan (Startup & Shutdown) ────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: safely ensure runtime storage directories exist
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    STORAGE_TEMP_DIR.mkdir(parents=True, exist_ok=True)
    yield
    # Shutdown: clean up any hanging connections if needed

# ── Create app ───────────────────────────────────────────────────────────────
app = FastAPI(title="IntervAI API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(interviews_router)
app.include_router(uploads_router)


# ── Serve React frontend (catch-all, must be last) ──────────────────────────
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serve the React frontend and handle client-side routing."""
    frontend_dir = str(FRONTEND_DIST_DIR)
    # Check if the requested file exists in the frontend_dir (e.g. assets, js, css)
    file_path = os.path.join(frontend_dir, full_path)
    if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Fallback to index.html for React Router
    index_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"detail": "Frontend build not found. Run 'npm run build' inside the frontend directory."}


if __name__ == "__main__":
    import uvicorn
    # Start the server on port 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)

