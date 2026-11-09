import os
import re
from typing import Any
from bson import ObjectId
from server.config import STORAGE_DIR, UPLOADED_JD_PATH
from server.database import db

# Curated High-Signal Keywords for Indian Technical & Sales Roles
CURATED_TECH_KEYWORDS = [
    "Python", "FastAPI", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "SQL",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "REST API",
    "Microservices", "Git", "CI/CD", "Redis", "Kafka", "Data Science", "OOP",
    "Data Structures", "Algorithms", "LiveKit", "WebRTC", "LLM", "Prompt Engineering"
]

CURATED_BDA_KEYWORDS = [
    "B2B", "B2C", "Cold Calling", "Lead Generation", "Objection Handling",
    "Sales Pipeline", "Customer Acquisition", "CAC", "LTV", "CRM", "Salesforce",
    "Pitch", "Negotiation", "Quota", "Revenue", "Deal Size", "Consultative Selling",
    "BFSI", "CASA", "KYC", "Cross-selling", "Upselling", "ROI", "Conversion Rate"
]

DEFAULT_TECH_JD = """
Role: Technical Software Engineer (SDE)
Requirements:
- Strong proficiency in Python, FastAPI, and RESTful API architecture.
- Hands-on experience with SQL, PostgreSQL, or MongoDB.
- Solid understanding of Data Structures, Algorithms, and System Design.
- Familiarity with Machine Learning concepts, LLMs, and real-time streaming (LiveKit / WebRTC).
- Ability to write clean, modular, and maintainable code.
"""

DEFAULT_BDA_JD = """
Role: Business Development Associate (BDA) / Enterprise Sales Executive
Requirements:
- Proven experience in outbound cold calling, lead generation, and B2B consultative sales.
- Exceptional objection handling and persuasion skills under pressure.
- Deep understanding of sales pipeline management, CRM workflows, and deal closing.
- Ability to pitch complex SaaS / BFSI products and clearly demonstrate business ROI.
- Fluency in communicating across English, Hindi, and regional languages.
"""


def extract_keywords_from_text(text: str, max_keywords: int = 50) -> list[str]:
    """Fast, zero-LLM keyword extractor to boost Gnani Prisma v3.0 STT accuracy.
    
    Extracts high-signal domain terms, acronyms (e.g. B2B, SaaS, SQL, ROI),
    and CamelCase frameworks without consuming any API tokens or latency.
    """
    if not text:
        return CURATED_TECH_KEYWORDS[:20]

    extracted = set()

    # 1. Match uppercase acronyms (2-6 chars: B2B, API, SQL, SaaS, CRM, ROI, KYC)
    acronyms = re.findall(r"\b[A-Z0-9]{2,6}\b", text)
    for acr in acronyms:
        if not acr.isdigit() and len(acr) >= 2:
            extracted.add(acr)

    # 2. Match CamelCase / PascalCase names (e.g. FastAPI, PostgreSQL, TensorFlow)
    camel_cases = re.findall(r"\b[A-Z][a-z]+(?:[A-Z][a-z0-9]+)+\b", text)
    for cc in camel_cases:
        extracted.add(cc)

    # 3. Match from known high-signal curated dictionaries
    for kw in CURATED_TECH_KEYWORDS + CURATED_BDA_KEYWORDS:
        if re.search(r"\b" + re.escape(kw) + r"\b", text, re.IGNORECASE):
            extracted.add(kw)

    # Filter out common stop words and generic short noise
    stop_words = {"AND", "FOR", "THE", "WITH", "THAT", "THIS", "FROM", "HAVE", "WILL", "YOUR", "NOT", "ARE"}
    filtered = [k for k in extracted if k.upper() not in stop_words]

    # Limit to top max_keywords
    return filtered[:max_keywords] if filtered else CURATED_TECH_KEYWORDS[:20]


async def get_interview_session_context(
    session_id: str = "",
    username: str = "",
    track: str = "tech",
    language: str = "hinglish"
) -> dict[str, Any]:
    """Retrieve the exact interview context (JD text, track, language, and boosted keywords)
    from MongoDB. Falls back gracefully to curated defaults with zero credit cost.
    """
    session_doc = None

    # 1. Attempt lookup by session_id
    if session_id and ObjectId.is_valid(session_id):
        try:
            session_doc = await db.interview_sessions.find_one({"_id": ObjectId(session_id)})
        except Exception:
            session_doc = None

    # 2. Fall back to user's most recent session if not found
    if not session_doc and username and username != "unknown":
        try:
            session_doc = await db.interview_sessions.find_one(
                {"username": username},
                sort=[("created_at", -1)]
            )
        except Exception:
            session_doc = None

    # 3. If session found in DB, return its exact context
    if session_doc:
        jd_text = session_doc.get("jd_text", "").strip()
        keywords = session_doc.get("keywords") or extract_keywords_from_text(jd_text)
        return {
            "session_id": str(session_doc["_id"]),
            "assessment_id": session_doc.get("assessment_id"),
            "is_practice": session_doc.get("is_practice", True),
            "assessor_id": session_doc.get("assessor_id"),
            "assessor_username": session_doc.get("assessor_username"),
            "taker_user_id": session_doc.get("taker_user_id"),
            "taker_username": session_doc.get("taker_username") or session_doc.get("username", username),
            "taker_name": session_doc.get("taker_name") or session_doc.get("username", username),
            "taker_email": session_doc.get("taker_email", ""),
            "share_with_taker": session_doc.get("share_with_taker", True),
            "jd_file_id": session_doc.get("jd_file_id"),
            "role_title": session_doc.get("role_title", "Custom Interview Role"),
            "track": session_doc.get("track", track),
            "language": session_doc.get("language", language),
            "jd_text": jd_text if jd_text else (DEFAULT_TECH_JD if track == "tech" else DEFAULT_BDA_JD),
            "keywords": keywords,
        }

    # 4. Fall back to curated track defaults
    is_tech = (track.lower() == "tech")
    default_text = DEFAULT_TECH_JD if is_tech else DEFAULT_BDA_JD
    default_kws = CURATED_TECH_KEYWORDS if is_tech else CURATED_BDA_KEYWORDS

    return {
        "session_id": "",
        "role_title": "Technical Software Engineer (SDE) Screening" if is_tech else "Enterprise BDA Sales & Pitch Screening",
        "track": "tech" if is_tech else "bda",
        "language": language,
        "jd_text": default_text.strip(),
        "keywords": default_kws,
    }


def read_file(file_path: str) -> str:
    """Reads a JD file and returns its text content.
    Supports both .txt and .pdf files.
    """
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".txt":
        return _read_txt(file_path)
    elif ext == ".pdf":
        return _read_pdf(file_path)
    else:
        raise ValueError(f"Unsupported file type: '{ext}'. Only .pdf and .txt are allowed.")


def _read_txt(file_path: str) -> str:
    """Read a plain text file and return its content."""
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read().strip()


def _read_pdf(file_path: str) -> str:
    """Extract text from a PDF file using PyPDF2."""
    from PyPDF2 import PdfReader

    reader = PdfReader(file_path)
    pages_text = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages_text.append(text.strip())

    full_text = "\n\n".join(pages_text).strip()

    if not full_text:
        raise ValueError("The PDF file appears to be empty or contains no extractable text.")

    return full_text


def save_extracted_jd(text: str) -> str:
    """Save extracted JD text to the storage directory for the agent to read.
    Returns the path where the text was saved.
    """
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    with open(UPLOADED_JD_PATH, "w", encoding="utf-8") as f:
        f.write(text)
    return str(UPLOADED_JD_PATH)


def load_jd(filename: str = "data_science_jd.txt") -> str:
    """Load the Job Description text for the agent.
    
    Priority:
    1. If an uploaded JD exists (storage/uploaded_jd.txt), use that.
    2. Otherwise, fall back to the default JD file in the script directory.
    """
    # Check for an uploaded JD first
    if UPLOADED_JD_PATH.exists():
        text = _read_txt(str(UPLOADED_JD_PATH))
        if text:
            return text

    # Fall back to default JD file
    file_path = STORAGE_DIR / filename

    if not file_path.exists():
        raise FileNotFoundError(f"Job Description file not found at: {file_path}")

    return _read_txt(str(file_path))

