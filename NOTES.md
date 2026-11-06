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
- [ ] Migrate deprecated `google.generativeai` to `google-genai` / LiveKit native LLM.
- [ ] Fix dual agent dispatch in `token_server` / LiveKit Cloud rules.
- [ ] Add browser WebRTC AEC constraints in `Interview.jsx`.

## 3. Phase 2 Benchmarks & Verified Facts (07 Nov 2026)
- **Gnani Timbre TTS (REST):** Latency ~1109 ms | Model: `timbre-v2.5` | Voice: `Nalini` | Audio: 540 KB WAV.
- **Gnani Prisma v3.0 STT (REST):** Latency: **589.7 ms** (Sub-600ms!) | Model: `prisma-v3.0` | Language: `indic-auto` with `["en-IN", "hi-IN"]`.
- **Transcription Accuracy:** Accurately captured Hinglish loanwords in Devanagari script: *"नमस्ते, वेलकम टू योर इंटरव्यू। मैं आपका ए आई इंटरव्यूअर हूँ। कृपया अपना नाम बताइए।"*
- **LiveKit Agent Worker:** Successfully loaded `livekit.plugins.gnani` (v1.8.11) and registered with LiveKit Cloud (India South region).
- **Zero-LLM Turn 1:** Pre-defined warm greeting pool (`GREETINGS_POOL`) integrated to save LLM tokens and eliminate opening turn latency.

## 4. Plan for Tomorrow (Phase 3 & 4)
- **Phase 3:** Fix agent dispatch duplicate bug, add WebRTC AEC (`echoCancellation: true`), and test the live voice interview in the browser.
- **Phase 4:** Multi-track interview engine (BDA/Sales Hinglish pitch role-play vs. Tech Coding Viva) and dynamic MongoDB session links.