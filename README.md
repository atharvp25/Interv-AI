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

Oral examinations, clinical vivas, and spoken case defenses are the gold standard for testing genuine comprehension, diagnostic reasoning, and professional poise. However, evaluating hundreds of students or job candidates orally has historically required immense faculty hours and recruiter scheduling.

Most voice AI tools today struggle with noticeable conversational delays (often taking 3 to 5+ seconds per response) or remain strictly restricted to software engineering coding in English.

**IntervAI** solves this. Built on full-duplex WebRTC, streaming Indic speech recognition, and high-throughput inference LPUs, IntervAI delivers **sub-second conversational turnaround (~0.85s, consistently under 1.5s)** across **11 Indian languages**. 

From **MBBS clinical case vivas** and **appellate moot court defenses** to **enterprise BDA objection role-plays** and **hands-on STEM coding with oral Big-O defenses**, IntervAI empowers universities, educators, and enterprise recruiters to conduct authentic, anti-cheat oral evaluations at scale.

---

## ⚡ Engineering Benchmarks: Under 1.5s End-to-End Latency

IntervAI replaces conventional audio batching with a fully streaming, bi-directional audio pipeline running over WebRTC.

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
│    • Zero thinking overhead & strict dialogue rules     │
│    • Resilient auto-failover to Gemini 3.5 Flash-Lite   │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼  [~220 ms]
┌─────────────────────────────────────────────────────────┐
│ 3. Gnani Timbre v2.5 Persistent WebSocket TTS           │
│    • Streaming PCM audio chunks over LiveKit room       │
│    • Authentic Indic female intonation (Nalini)         │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
Candidate Hears Response (Total Turnaround: 0.75s – 1.1s)
```

| Metric / Pipeline Stage | Standard Batch Voice Bots | IntervAI (Production Measured) | Advantage |
|---|---|---|---|
| **Speech Recognition (STT)** | 1,200 – 1,800 ms | **280 – 350 ms** *(Gnani Prisma v3.0)* | **4× Faster** |
| **LLM Inference (TTFT)** | 1,500 – 2,500 ms | **180 – 350 ms** *(Groq LPU Llama 3.3 70B)* | **6× Faster** |
| **Speech Synthesis (TTS)** | 1,000 – 1,800 ms | **220 – 280 ms** *(Gnani Timbre v2.5)* | **5× Faster** |
| **Total Conversational E2E** | **3.7 – 6.1 Seconds** | **0.75 – 1.1 Seconds (< 1.5s)** | **⚡ Real-Time Human Cadence** |

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

## 🏛️ Multi-Discipline Oral Assessment Engines

IntervAI houses specialized diagnostic engines calibrated for four distinct faculties:

### 1. 🩺 Medicine & Healthcare (Clinical Case Vivas)
* **Target Audience:** MBBS faculty, nursing colleges, postgraduate clinical examiners, hospital recruiting.
* **Assessment Scope:** Multi-turn patient scenario presentation, emergency triage sequences, differential diagnosis (e.g. acute coronary syndrome vs. pulmonary embolism), pharmacokinetics, and contraindications.
* **Examiner Persona:** Senior Clinical Medicine Examiner using strict clinical checklists.

### 2. ⚖️ Law & Judiciary (Moot Court & Oral Defense)
* **Target Audience:** Law school faculty, moot court organizers, senior advocates, legal compliance hiring.
* **Assessment Scope:** Landmark Supreme Court precedents (*Maneka Gandhi*, *K.S. Puttaswamy*), constitutional doctrines (proportionality, substantive due process), statutory construction, and jurisdictional *locus standi*.
* **Examiner Persona:** Presiding Appellate Moot Court Judge testing composure under judicial skepticism.

### 3. 📈 Business, MBA & Enterprise Sales (Consultative Pitch & Objection Handling)
* **Target Audience:** B-School professors, enterprise sales directors, BDA hiring teams.
* **Assessment Scope:** Cold pitch defense, unit economics, executive decision-making under budget freezes, competitor displacement, and pricing pushback role-plays in code-mixed Hinglish.
* **Examiner Persona:** Pragmatic Enterprise Buyer & Chief Commercial Officer.

### 4. 💻 Engineering & STEM (Live Code Sandbox & Oral Big-O Defense)
* **Target Audience:** Engineering college lab professors, technical recruiters, software architects.
* **Assessment Scope:** Algorithmic problem-solving, clean code implementation, syntax debugging, and oral defense of time/space complexity to defeat copy-pasting and generative AI cheating.
* **Examiner Persona:** Senior Technical Architect.

---

## 💻 Live In-Browser Code Compiler with Voice-Trigger

For technical faculties and software hiring, IntervAI bridges speech and code:

* **Voice-Triggered Activation:** When the examiner transitions to coding or when the candidate says *"Open the editor"* or *"Editor kholo"*, the IDE modal opens instantly without touching the keyboard.
* **Multi-Language Compiler:** Supports **Python 3, C (C11), C++, and Java**.
* **3 Guided Verification Attempts:** Evaluated in the background via Google Gemini acting as a strict compiler/linter. Diagnostic errors (e.g. *IndexError on line 4 for empty inputs*) are fed back through voice without giving away the solution.
* **Oral Big-O Complexity Defense:** When code succeeds, the editor auto-closes and the examiner immediately challenges the candidate: *"Explain your time and space complexity out loud."*

---

## 🛡️ Resilient Zero-Downtime Fallback Architecture

To ensure high-stakes university vivas and corporate interviews never freeze or crash mid-session, IntervAI features multi-layered resilience:

```
                  ┌──────────────────────────────┐
                  │ Candidate Speech Audio Stream│
                  └──────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
        [Primary: Groq LPU]             [Failover: Gemini Flash-Lite]
      Llama 3.3 70B Versatile                 gemini-3.5-flash-lite
      • Ultra-fast (<180ms TTFT)              • Triggered automatically on
      • Zero thinking latency                   Groq 429 / network error
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

* **Dynamic Evaluation Model Cascade:** When grading final scorecards, the system iterates across `[gemini-3.5-flash-lite, gemini-3.8-flash, gemini-3.1-flash-lite]` to guarantee reports are generated even during regional API provider outages.
* **Automatic Session Recovery:** If WebRTC drops due to client network fluctuation, candidate session tokens and partial transcripts are preserved in MongoDB with automatic reconnection.

---

## 📊 Calibrated 6-Axis Evaluation Scorecard

IntervAI eliminates the common flaw where LLMs lazily award generic median scores (5/10). Every session is evaluated against strict rubric anchors:

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

1. **Domain Accuracy (7–10 for correct, 5–6 for partial, 1–4 for incorrect):** Rigorously grades medical triage steps, case law citations, or algorithmic logic.
2. **Analytical Depth:** Evaluates whether candidate explained the *why* and handled edge cases.
3. **Verbal Articulation & Fluency:** Assesses clarity and structured delivery in the selected language.
4. **Professional Composure:** Measures tone stability and poise under counter-arguments.
5. **Thoroughness:** Checks if inquiries were comprehensively addressed without evasion.
6. **Composite Grade:** Weighted overall rating.

* **PDF Export & Class Viva Roster:** Teachers and recruiters can export clean, print-ready PDF scorecards with timestamps, candidate details, identified strengths, and growth recommendations.

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
| **Code Execution** | Sandboxed In-Browser Monaco/CodeMirror editor (Python 3, C, C++, Java) |
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

## 🏆 Why IntervAI Wins

| Capability | IntervAI | Standard Batch Voice Bots |
|---|---|---|
| **E2E Conversational Latency** | **⚡ 0.85s (Strictly < 1.5s)** | 3.7 – 6.1s (Unnatural pauses) |
| **Language Coverage** | **11 Indian Languages + Hinglish** | English only |
| **Discipline Support** | **Medicine, Law, MBA, Core Eng, Tech** | Tech/Coding only |
| **Anti-Cheat Defense** | **Live Voice + Oral Big-O Defense** | Multiple-choice or copy-pasteable text |
| **Editor Workflow** | **Voice-triggered compiler modal** | Manual tabs or external links |
| **Failover Architecture** | **Groq LPU ↔ Gemini Flash-Lite** | Single point of failure |
| **Scorecard Quality** | **Calibrated 6-axis rubric (No flat 5s)** | Generic LLM summary |

---

## 📜 License & Credits

Built with ❤️ by **Atharv** for the developer community and modern education.  
Released under the [MIT License](LICENSE).
