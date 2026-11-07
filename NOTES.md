# Engineering Notes & Verification Log

## 1. Baseline Run (Verified on 06 Nov 2026)
- **MongoDB:** Running locally on port 27017.
- **FastAPI Backend (Port 8000):** Starts cleanly; CORS pre-flight returns 200; JWT auth returns 401 when unauthenticated.
- **LiveKit Agent Worker:** Connects to LiveKit Cloud (India South region, protocol 18) with ID registered.
- **React Frontend (Port 5173):** Vite boots in < 1s.

## 2. Technical Debt & Resolved Items
- [x] DB connection opened on every evaluation submission -> **Fixed:** Reusing shared `db` connection pool in `server.database`.
- [x] Runtime data inside source folder -> **Fixed:** Decoupled to root `data/` directory and updated `.gitignore`.
- [x] Import side-effects in `config.py` -> **Fixed:** Moved folder initialization to FastAPI `lifespan` hook.
- [x] 3 separate terminal startup friction -> **Fixed:** Created unified `run.py` subprocess controller.
- [x] Speech pipeline wired to Deepgram/Cartesia -> **Fixed:** Migrated to Gnani Prisma (STT) and Timbre (TTS) via `livekit-plugins-gnani`.
- [x] Fix dual agent dispatch in `token_server` / LiveKit Cloud rules -> **Fixed:** Implemented Named Agent Dispatch (`intervai-agent`) embedded in JWT `RoomConfiguration`.
- [x] Add browser WebRTC AEC constraints in `Interview.jsx` -> **Fixed:** Added `{ echoCancellation: true, noiseSuppression: true, autoGainControl: true }`.
- [x] Upgraded Gnani Prisma v3.0 WebSocket adapter (`server/agent/gnani_prisma.py`) with support for 10 Indian languages + Hinglish, `x-model: prisma-v3.0`, and `x-keywords` keyterm boosting.
- [x] Multi-user file collision in JD parser -> **Fixed:** MongoDB `interview_sessions` collection with zero-token regex keyterm extractor.
- [x] Remove 15-second hardcoded code editor timer -> **Fixed:** Deleted sleep timer hack; editor now triggers naturally via LLM function calling for coding questions only.
- [x] Migrated deprecated `google.generativeai` package to modern `from google import genai`.

## 3. Phase 2 & 3 Benchmarks & Verified Facts (07–08 Nov 2026)
- **Gnani Timbre TTS (REST):** Latency ~1109 ms | Model: `timbre-v2.5` | Voice: `Nalini` | Audio: 540 KB WAV.
- **Gnani Prisma v3.0 STT (REST):** Latency: **589.7 ms** (Sub-600ms!) | Model: `prisma-v3.0` | Language: `indic-auto` with `["en-IN", "hi-IN"]`.
- **Keyterm Boosting:** Zero-cost regex keyword extractor pulls domain jargon (FastAPI, SQL, B2B, ROI, etc.) in <1ms and injects them into Prisma v3.0 WebSocket headers.
- **Multi-Track Engine:**
  - **Track 1 (`bda`):** Enterprise Sales & BFSI pitch role-play with skeptical buyer persona and objection handling (voice-only).
  - **Track 2 (`tech`):** CS viva + split-screen live Python coding editor + oral viva defense to defeat AI copy-paste cheating.
- **Frontend Upgrades:**
  - Setup UI: Track card selector (`tech` vs `bda`), 11-language dropdown, 1-click presets, and shareable link generator with copy-to-clipboard.
  - Interview UI: Real-time telemetry badges (Track, Language, Encrypted status).
