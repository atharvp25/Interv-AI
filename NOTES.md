# Engineering Notes & Verification Log

## 1. Baseline Run (Verified on 06 Nov 2026)
- **MongoDB:** Running locally on port 27017.
- **FastAPI Backend (Port 8000):** Starts cleanly; CORS pre-flight returns 200; JWT auth returns 401 when unauthenticated.
- **LiveKit Agent Worker:** Connects to LiveKit Cloud (India South region, protocol 18) with ID registered.
- **React Frontend (Port 5173):** Vite boots in < 1s.

## 2. Technical Debt & Defects Identified
- `google.generativeai` emits a deprecation warning (`FutureWarning`). Must migrate to `google-genai` / LiveKit native LLM.
- Speech pipeline still wired to Deepgram/Cartesia; needs migration to Gnani Prisma (STT) and Timbre (TTS).
- 3 separate terminal sessions needed for dev startup; needs unified single-command runner (`run.py`).
- Runtime data currently sits inside source folder (`server/storage/`).
- DB connection opened on every evaluation submission instead of reusing connection pool.