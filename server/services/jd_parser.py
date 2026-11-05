import os
from server.config import STORAGE_DIR, UPLOADED_JD_PATH


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

