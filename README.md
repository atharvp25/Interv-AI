# 🎙️ IntervAI — Universal Voice Assessment & Viva Studio

> **Real-Time Oral Examinations, Case Defenses & Candidate Screenings in 11 Indian Languages with Sub-Second Turnaround (< 1.5s).**

[![LiveKit WebRTC](https://img.shields.io/badge/WebRTC-LiveKit_Cloud-blue.svg?style=flat-square&logo=webrtc)](https://livekit.io)
[![Gnani Prisma ASR](https://img.shields.io/badge/Indic_ASR-Gnani_Prisma_v3.0-orange.svg?style=flat-square)](https://gnani.ai)
[![Groq LPU](https://img.shields.io/badge/Inference-Groq_LPU_Llama_3.3_70B-red.svg?style=flat-square)](https://groq.com)
[![Google Gemini](https://img.shields.io/badge/Evaluation-Gemini_3.5_Flash--Lite-4285F4.svg?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB.svg?style=flat-square&logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Motor-47A248.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 📌 Executive Summary

Oral examinations, clinical vivas, and spoken case defenses are one of the most effective ways to evaluate genuine comprehension, reasoning, and communicative clarity. However, conducting one-on-one spoken evaluations for large cohorts requires immense faculty hours and recruiter scheduling.

Many existing conversational voice systems experience noticeable latency pauses (often several seconds per turn) or are configured solely for generic English chatbots.

**IntervAI** addresses this with a streaming, real-time voice pipeline. Built on WebRTC, streaming Indic speech recognition, and high-throughput inference, IntervAI delivers **sub-second conversational turnaround (~0.85s, consistently under 1.5s)** across **11 Indian languages**.

With prompt-tailored tracks for **MBBS clinical case vivas**, **appellate moot court defenses**, **enterprise BDA objection handling**, and **STEM coding accompanied by oral logic defenses**, IntervAI provides educators, university departments, and hiring teams with a scalable platform for authentic spoken evaluations.

---

## ⚡ Latency Benchmarks: Under 1.5s End-to-End Pipeline

IntervAI replaces traditional multi-hop HTTP audio batching with a fully streaming, bi-directional audio pipeline over WebRTC.

```
Candidate Speaks (WebRTC)
       │
       ▼  [~280 ms]
┌─────────────────────────────────────────────────────────┐
│ 1. Gnani Prisma v3.0 Streaming Indic STT                │
│    • Real-time ASR with WebSocket frame streaming       │
│    • Domain keyword boosting injected from syllabus/JD  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼  [~350 ms]
┌─────────────────────────────────────────────────────────┐
│ 2. Groq LPU Voice Inference (Llama 3.3 70B Versatile)   │
│    • Sub-180ms Time-To-First-Token (TTFT)               │
│    • Direct spoken conversational dialogue              │
│    • Resilient auto-failover to Gemini 3.5 Flash-Lite   │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼  [~220 ms]
┌─────────────────────────────────────────────────────────┐
│ 3. Gnani Timbre v2.5 Persistent WebSocket TTS           │
│    • Streaming PCM audio chunks over LiveKit room       │
│    • Natural Indic voice models (e.g., Nalini)          │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
Candidate Hears Response (Total Turnaround: 0.75s – 1.1s)
```

### Architectural Latency Comparison

| Pipeline Stage | Baseline Architecture (Traditional HTTP REST Cascade) | IntervAI Streaming WebRTC Architecture | Technical Optimization |
|---|---|---|---|
| **Audio Ingestion & STT** | 1,200 – 1,800 ms *(Chunked audio upload & REST transcription)* | **280 – 350 ms** *(Gnani Prisma v3.0 WebSocket streaming)* | Eliminates file upload overhead; transcribes continuous audio frames. |
| **LLM Inference (TTFT)** | 1,200 – 2,000 ms *(Standard cloud API queue & TTFT)* | **180 – 350 ms** *(Groq LPU Llama 3.3 70B)* | High token/s generation tailored for natural dialogue. |
| **Speech Synthesis (TTS)** | 900 – 1,500 ms *(Full response audio file synthesis)* | **220 – 280 ms** *(Gnani Timbre v2.5 streaming chunks)* | Streams initial PCM audio packets to WebRTC track immediately. |
| **Total Conversational E2E** | **3.3 – 5.3 Seconds** *(Noticeable conversational pause)* | **0.75 – 1.1 Seconds (< 1.5s target)** | **Natural conversational rhythm** |

---

## 🌐 11 Indian & Regional Languages Supported

IntervAI natively supports 11 Indian languages, handling code-mixed conversational speech (e.g. Hinglish, Marathi-English blend) without losing technical or clinical context:

| Language | Native Script | Language Code | Speech Engine |
|---|---|---|---|
| **English (India)** | English | `en-IN` | Gnani Prisma v3.0 + Timbre v2.5 |
| **Hinglish** | Hindi-English Code-Mixed | `hinglish` | Gnani Prisma v3.0 + Timbre v2.5 |
| **Hindi** | हिन्दी | `hi-IN` | Gnani Prisma v3.0 + Timbre v2.5 |
| **Marathi** | मराठी | `mr-IN` | Gnani Prisma v3.0 + Timbre v2.5 |
| **Tamil** | தமிழ் | `ta-IN` | Gnani Prisma v3.0 + Timbre v2.5 |
| **Telugu** | తెలుగు | `te-IN` | Gnani Prisma v3.0 + Timbre v2.5 |
| **Kannada** | ಕನ್ನಡ | `kn-IN` | Gnani Prisma v3.0 + Timbre v2.5 |
| **Bengali** | বাংলা | `bn-IN` | Gnani Prisma v3.0 + Timbre v2.5 |
| **Gujarati** | ગુજરાતી | `gu-IN` | Gnani Prisma v3.0 + Timbre v2.5 |
| **Punjabi** | ਪੰਜਾਬੀ | `pa-IN` | Gnani Prisma v3.0 + Timbre v2.5 |
| **Malayalam** | മലയാളം | `ml-IN` | Gnani Prisma v3.0 + Timbre v2.5 |

* **Zero-Cost Regex Keyword Booster:** Medical terminology (e.g. *Troponin-I, STEMI*), legal articles (e.g. *Article 21, locus standi*), or technical jargon (*FastAPI, Big-O*) are extracted in < 1ms from the professor's syllabus or recruiter's JD and dynamically injected into Prisma ASR headers to prevent phonetic misrecognition.

---

## 🏛️ Multi-Discipline Oral Assessment Tracks

IntervAI provides prompt-tailored evaluation tracks designed for common university vivas and professional interview workflows:

### 1. 🩺 Medicine & Healthcare (Clinical Case Vivas)
* **Target Scenarios:** Medical and nursing colleges, clinical oral examinations, hospital staff screening.
* **Assessment Scope:** Multi-turn patient scenario presentation, emergency triage sequences, differential diagnosis, pharmacokinetics, and contraindications derived from provided syllabi or case studies.
* **Examiner Persona:** Senior Clinical Medicine Examiner using structured diagnostic checklists.

### 2. ⚖️ Law & Judiciary (Moot Court & Oral Defense)
* **Target Scenarios:** Law school moot courts, procedural oral defense, compliance role evaluations.
* **Assessment Scope:** Landmark Supreme Court precedents (*Maneka Gandhi*, *K.S. Puttaswamy*), constitutional doctrines (proportionality, due process), statutory construction, and jurisdictional *locus standi*.
* **Examiner Persona:** Presiding Appellate Moot Court Judge testing poise and legal reasoning under questioning.

### 3. 📈 Business, MBA & Sales (Consultative Pitch & Objection Handling)
* **Target Scenarios:** B-School case presentations, corporate BDA hiring, customer-facing role-play.
* **Assessment Scope:** Value proposition defense, unit economics, handling budget freeze objections, competitor differentiation, and pricing negotiation in English or code-mixed Hinglish.
* **Examiner Persona:** Pragmatic Enterprise Buyer & Chief Commercial Officer.

### 4. 💻 Engineering & STEM (Code Review & Spoken Logic Defense)
* **Target Scenarios:** Computer science lab vivas, technical screenings, software engineering interviews.
* **Assessment Scope:** Algorithmic problem-solving, code structure, edge case handling, and verbal defense of time/space complexity to test deep conceptual grasp.
* **Examiner Persona:** Senior Technical Architect.

---

## 💻 In-Browser Code Editor & AI Code Review (with Voice Trigger)

For technical faculties and software hiring, IntervAI bridges spoken dialogue and code review:

* **Voice-Triggered Activation:** When the examiner transitions to technical problem-solving or when the candidate says *"Open the editor"* or *"Editor kholo"*, the editor modal opens seamlessly in the browser.
* **Multi-Language Syntax Support:** Supports **Python 3, C (C11), C++, and Java** with syntax highlighting.
* **AI-Assisted Logic & Syntax Review:** Candidates write and submit their solution in the browser. IntervAI uses Google Gemini as an AI code reviewer to inspect code structure, identify syntax errors or logic flaws, and provide constructive oral hints without executing untrusted binary code on the host.
* **Spoken Logic & Big-O Defense:** Once the code is analyzed, the examiner immediately asks the candidate to walk through their algorithm out loud and justify their time and space complexity, ensuring genuine comprehension.

---

## 🛡️ Resilient Multi-Model Fallback Architecture

To ensure university vivas and interview sessions remain stable even during upstream API degradation or rate-limits, IntervAI implements automated failover:

```
                  ┌──────────────────────────────┐
                  │ Candidate Speech Audio Stream│
                  └──────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
        [Primary: Groq LPU]             [Failover: Gemini Flash-Lite]
      Llama 3.3 70B Versatile                 gemini-3.5-flash-lite
      • Low-latency (<180ms TTFT)             • Triggered automatically on
      • Natural conversational dialogue         Groq 429 / network error
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
                    [Output Sanitization Layer]
                    • Drops Gemini `part.thought` parts
                    • Strips <think>...</think> monologue
                    • Erases tool signatures & bracket noise
                                 │
                                 ▼
                     Gnani Timbre v2.5 TTS
```

* **Dynamic Evaluation Cascade:** When generating comprehensive post-session scorecards, the backend gracefully cascades across `[gemini-3.5-flash-lite, gemini-3.8-flash, gemini-3.1-flash-lite]` if an individual model endpoint is temporarily unavailable.
* **Session Continuity:** Session state, transcripts, and evaluation data are preserved in MongoDB, allowing candidate recovery if the client browser temporarily disconnects.

---

## 📊 Structured 6-Axis Evaluation Rubric

Rather than relying on unguided LLM summaries that often generate generic median scores, IntervAI evaluates session transcripts against explicit rubric anchors across six dimensions:

```
                     Technical / Domain Accuracy (1-10)
                                    /\
                                   /  \
     Analytical Depth (1-10)      /    \      Verbal Articulation (1-10)
                                 /      \
                                /        \
     Thoroughness (1-10)       <          >   Professional Composure (1-10)
                                \        /
                                 \      /
                                  \    /
                                   \  /
                                    \/
                         Composite Grade (1-10)
```

1. **Domain Accuracy (7–10 correct, 5–6 partial, 1–4 incorrect):** Evaluates clinical diagnosis, legal citations, or technical logic based on the user's reference context.
2. **Analytical Depth:** Assesses whether the candidate explained the underlying rationale and considered trade-offs.
3. **Verbal Articulation & Fluency:** Evaluates clarity, sentence structure, and coherence in the candidate's chosen language.
4. **Professional Composure:** Measures confidence, tone stability, and poise under follow-up questioning.
5. **Thoroughness:** Assesses how completely inquiries and edge cases were addressed.
6. **Composite Grade:** Balanced overall score reflecting performance across all axes.

* **PDF Export & Roster Management:** Teachers and recruiters can export clean, print-ready PDF scorecards containing candidate metrics, timestamps, identified strengths, and targeted improvement areas.

---

## 📂 Project Architecture & Directory Structure

```
IntervAI/
├── frontend/                              # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/                    # Reusable UI & Role Components
│   │   │   ├── roles/                     # Dedicated Role Dashboard Views
│   │   │   │   ├── TeacherDashboardView.jsx    # Faculty class roster, active vivas & PDF export
│   │   │   │   ├── RecruiterDashboardView.jsx  # Candidate benchmark matrix & scorecard review
│   │   │   │   ├── StudentDashboardView.jsx    # Assigned exam roster & practice viva history
│   │   │   │   └── CandidateDashboardView.jsx  # Screening status & feedback radar
│   │   │   ├── ui/                        # Design System Primitives
│   │   │   │   ├── ScoreRadar.jsx         # 6-axis SVG radar visualization & print-ready scorecard
│   │   │   │   ├── AnimatedOrb.jsx        # WebRTC audio state visualizer (listening/thinking/speaking)
│   │   │   │   └── Skeleton.jsx / Toast.jsx
│   │   │   ├── Header.jsx                 # Top navbar with role indicator & guest switcher
│   │   │   └── Footer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx            # Auth state, Google OAuth token, & judge guest mode
│   │   ├── pages/
│   │   │   ├── Home.jsx                   # Landing page with interactive live session simulation
│   │   │   ├── Setup.jsx                  # Google-Form-style 5-step dynamic assessment creation wizard
│   │   │   ├── Interview.jsx              # Live WebRTC voice studio with split code editor & telemetry
│   │   │   ├── Dashboard.jsx              # Role-based workspace & roster management
│   │   │   ├── SelectRole.jsx             # Dedicated 2-track workspace role selector
│   │   │   ├── AssessEntry.jsx            # Tokenized single-claimer assessment link entry (/assess/:token)
│   │   │   └── Login.jsx / Register.jsx   # Authentication screens
│   │   ├── brand.js                       # Platform brand constants
│   │   └── theme.css                      # WCAG AA verified calm B2B SaaS design tokens
│   ├── package.json
│   └── vite.config.js
│
├── server/                                # FastAPI Backend & LiveKit AI Agent Worker
│   ├── agent/                             # LiveKit Real-Time Speech Agent
│   │   ├── worker.py                      # Agent entrypoint, WebRTC session orchestration, failover & telemetry
│   │   ├── gnani_prisma.py                # Gnani Prisma v3.0 Streaming ASR & Indic Language Handler
│   │   ├── prompts.py                     # Multi-discipline persona prompts & spoken dialogue rules
│   │   └── tools.py                       # Assistant function tools (code editor control, scorecard submission)
│   ├── api/                               # REST API Endpoints
│   │   ├── auth.py                        # Google OAuth 2.0 GIS, password login, onboarding & token exchange
│   │   ├── interviews.py                  # Assessment links, room tokens, session state & evaluation CRUD
│   │   └── uploads.py                     # PDF/TXT syllabus and JD document parser
│   ├── core/
│   │   └── security.py                    # JWT generation, token hashing & password hashing
│   ├── services/
│   │   ├── jd_parser.py                   # Zero-token regex keyword extractor & syllabus context loader
│   │   └── report_generator.py            # PDF scorecard generation service
│   ├── app.py / main.py                   # FastAPI application factory & CORS configuration
│   ├── config.py                          # Environment settings & model fallbacks
│   └── database.py                        # Async MongoDB connection pool (Motor)
│
├── data/                                  # Uploaded syllabi and temporary PDF storage
├── requirements.txt                       # Backend Python dependencies
└── .env.example                           # Environment configuration template
```

---

## 👥 Four Specialized Workspaces & Hybrid Access

| Persona | Primary Workflow | Key Features |
|---|---|---|
| 🎓 **Faculty / Professor** | Conduct lab vivas, thesis defenses, clinical case exams | 5-step wizard, custom question banks, instructor directives, class roster with exportable PDF scorecards. |
| 💼 **Recruiter / Hiring Manager** | Screen candidates across tech, sales, healthcare, legal | JD keyword boosting, benchmark comparison matrix, single-claimer assessment links. |
| 🧑‍🎓 **Student** | Take university-assigned vivas or private mock practice | Voice studio, Hinglish practice, live code editor, review professor-released grades. |
| 👔 **Job Candidate** | Claim official assessment links or rehearse interviews | WebRTC voice room, tokenized single-claimer verification, comprehensive feedback report. |

* **Hackathon Judge Mode:** Click **Explore in Guest Mode** to instantly explore Faculty, Recruiter, Student, or Candidate dashboards without entering credentials. Live session creation is gated behind Google Sign-In to protect API credits.
* **Single-Claimer Security:** Assessment links use 192-bit URL-safe tokens stored as SHA-256 hashes (`token_hash`) with expiration dates and maximum attempt limits. Once claimed by a candidate, other users are blocked.

---

## 🛠️ Complete Tech Stack

| Layer | Technologies |
|---|---|
| **Audio & WebRTC** | LiveKit Cloud / LiveKit Server, WebRTC, Silero VAD (250ms endpointing), BVC Noise Cancellation |
| **Speech-to-Text (STT)** | Gnani.ai Prisma v3.0 Streaming ASR (11 Indian languages, keyword boosting) |
| **Voice LLM (Primary)** | Groq LPU — Llama 3.3 70B Versatile (< 180ms TTFT) |
| **Voice LLM (Failover)**| Google Gemini 3.5 Flash-Lite via `google-genai` SDK |
| **Text-to-Speech (TTS)** | Gnani.ai Timbre v2.5 Persistent WebSocket Streaming |
| **Code Evaluation** | In-Browser Editor with Gemini AI syntax & logic review (Python 3, C, C++, Java) |
| **Backend API** | FastAPI, Python 3.12, Motor (Async MongoDB), PyJWT, Uvicorn |
| **Database** | MongoDB (sessions, assessments, evaluations, users) |
| **Frontend UI** | React 18, Vite, Framer Motion, Lucide Icons, WCAG AA Design System |
| **Authentication** | Google OAuth 2.0 (GIS) + JWT Bearer Tokens |

---

## 🚀 Quick Start & Installation

### Prerequisites
* **Node.js** (v18+) & **npm** / **pnpm**
* **Python** (v3.11 or v3.12)
* **MongoDB** running locally on `localhost:27017` (or MongoDB Atlas URI)
* API Keys: LiveKit Cloud, Gnani AI, Groq Cloud, Google Gemini

### 1. Clone the Repository
```bash
git clone https://github.com/atharvp25/IntervAI.git
cd IntervAI
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# LiveKit Cloud Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# AI & Speech Engine Keys
GNANI_API_KEY=your_gnani_api_key
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite

# Database & Security
MONGODB_URI=mongodb://localhost:27017/
JWT_SECRET=your_super_secret_jwt_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Backend Setup
```bash
# Create and activate Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Start FastAPI Server (Port 8000)
uvicorn server.main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Start the LiveKit Voice Agent Worker
In a second terminal window:
```bash
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
python server/agent/worker.py dev
```

### 5. Frontend Setup
In a third terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in Chrome to launch IntervAI.

---

## 🏛️ Pipeline Comparison: Traditional Approach vs. IntervAI Streaming WebRTC

| Architectural Dimension | Traditional Non-Streaming Pipeline | IntervAI Streaming WebRTC Pipeline |
|---|---|---|
| **Audio Transport** | Audio recorded into local blobs, uploaded via HTTP POST | Bi-directional, full-duplex WebRTC audio streaming via LiveKit Cloud |
| **Conversational Turnaround** | 3.3 – 5.3s (Multi-hop file upload + batched inference) | **0.75 – 1.1s (< 1.5s total)** (Continuous audio frame streaming) |
| **Indic Speech Recognition** | Standard generic ASR without specialized vocabulary | Gnani Prisma v3.0 with dynamic syllabus/JD keyword injection |
| **Language Flexibility** | Restricted to English or basic translation layers | **11 Indian Languages + Hinglish** with native accent handling |
| **Discipline Adaptability** | Monolithic prompt for all candidates | 4 prompt-tailored tracks (Medicine viva, Law moot court, B-School sales, STEM) |
| **Coding Assessment** | Static text submissions or external coding links | Voice-triggered in-browser editor with Gemini AI logic review + spoken Big-O defense |
| **Model Redundancy** | Single API endpoint (susceptible to 429/500 errors) | Multi-model fallback: Groq LPU Llama 3.3 70B ↔ Google Gemini 3.5 Flash-Lite |
| **Scorecard Quality** | Freeform text generation prone to median scores | Structured 6-axis rubric with explicit criterion bands & printable PDF export |

---

## 📜 License & Credits

Built with ❤️ by **Atharv** for the developer community and modern education.  
Released under the [MIT License](LICENSE).
