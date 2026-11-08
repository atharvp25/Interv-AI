import json
import datetime
import hashlib
import secrets
from typing import Optional
import jwt
from fastapi import APIRouter, HTTPException, Query, Depends, Body
from fastapi.responses import StreamingResponse
from livekit import api
from bson import ObjectId

from server.config import LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, JWT_SECRET, JWT_ALGORITHM
from server.core.security import (
    get_current_user,
    get_optional_user,
    require_assessor,
    ASSESSOR_ROLES,
    TAKER_ROLES,
)
from server.database import db
from server.services.report_generator import generate_evaluation_pdf
from server.services.jd_parser import (
    extract_keywords_from_text,
    get_interview_session_context,
    DEFAULT_TECH_JD,
    DEFAULT_BDA_JD,
)

router = APIRouter(prefix="/api", tags=["interviews"])

AGENT_NAME = "intervai-agent"


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def _parse_iso(ts: Optional[str]) -> Optional[datetime.datetime]:
    if not ts:
        return None
    try:
        clean = ts.rstrip("Z")
        return datetime.datetime.fromisoformat(clean)
    except Exception:
        return None


def _check_assessment_window(assessment: dict) -> None:
    """Validate status, opens_at, and expires_at for an assessment."""
    if assessment.get("status") == "revoked":
        raise HTTPException(status_code=410, detail="This assessment link has been revoked by the assessor.")

    now = datetime.datetime.utcnow()
    opens_at = _parse_iso(assessment.get("opens_at"))
    expires_at = _parse_iso(assessment.get("expires_at"))

    if opens_at and now < opens_at:
        raise HTTPException(status_code=400, detail="This assessment window has not opened yet.")
    if expires_at and now > expires_at:
        raise HTTPException(status_code=400, detail="This assessment link has expired.")


# ── 1. Assessor Endpoints (Recruiter & Teacher Only) ─────────────────────────

@router.post("/assessments")
async def create_assessment(
    payload: dict = Body(...),
    current_user: dict = Depends(require_assessor),
):
    """Create an assigned assessment with an unguessable shareable link token,
    availability window, attempt limit, and report sharing policy.
    """
    track = payload.get("track", "tech").lower()
    language = payload.get("language", "hinglish")
    default_title = "Technical Viva Assessment" if track == "tech" else "BDA Sales Role-Play Screening"
    role_title = (payload.get("role_title") or default_title).strip()
    jd_text = (payload.get("jd_text") or "").strip()
    jd_file_id = payload.get("jd_file_id")

    if not jd_text:
        jd_text = DEFAULT_TECH_JD.strip() if track == "tech" else DEFAULT_BDA_JD.strip()

    keywords = extract_keywords_from_text(jd_text)

    now = datetime.datetime.utcnow()
    opens_at = payload.get("opens_at") or (now.isoformat() + "Z")
    expires_hours = int(payload.get("expires_in_hours", 168))  # default 7 days
    expires_at = payload.get("expires_at") or ((now + datetime.timedelta(hours=expires_hours)).isoformat() + "Z")
    max_attempts = max(1, min(int(payload.get("max_attempts", 1)), 50))

    # Default sharing rule: Teacher = True (helps learning), Recruiter = False (standard hiring)
    default_share = current_user.get("role") == "teacher"
    share_with_taker = bool(payload.get("share_with_taker", default_share))

    raw_token = secrets.token_urlsafe(24)
    token_hash = _hash_token(raw_token)

    doc = {
        "owner_id": current_user["id"],
        "owner_username": current_user["username"],
        "owner_name": current_user.get("full_name", current_user["username"]),
        "owner_role": current_user["role"],
        "owner_organization": current_user.get("organization", ""),
        "role_title": role_title,
        "track": track,
        "language": language,
        "jd_text": jd_text,
        "jd_file_id": jd_file_id,
        "boost_keywords": keywords,
        "token_hash": token_hash,
        "share_token": raw_token,
        "opens_at": opens_at,
        "expires_at": expires_at,
        "max_attempts": max_attempts,
        "attempts_used": 0,
        "claimed_by_user_id": None,
        "claimed_by_email": None,
        "claim_secret": None,
        "share_with_taker": share_with_taker,
        "status": "active",
        "created_at": now.isoformat() + "Z",
    }
    res = await db.assessments.insert_one(doc)

    return {
        "success": True,
        "assessment_id": str(res.inserted_id),
        "share_token": raw_token,
        "role_title": role_title,
        "track": track,
        "language": language,
        "keywords": keywords,
        "opens_at": opens_at,
        "expires_at": expires_at,
        "max_attempts": max_attempts,
        "share_with_taker": share_with_taker,
        "status": "active",
    }


@router.get("/assessments")
async def list_my_assessments(current_user: dict = Depends(require_assessor)):
    """List only assessments owned by the authenticated Recruiter/Teacher."""
    cursor = db.assessments.find({"owner_id": current_user["id"]}).sort("created_at", -1)
    items = await cursor.to_list(length=100)
    results = []
    for item in items:
        results.append({
            "assessment_id": str(item["_id"]),
            "role_title": item.get("role_title"),
            "track": item.get("track"),
            "language": item.get("language"),
            "share_token": item.get("share_token"),
            "opens_at": item.get("opens_at"),
            "expires_at": item.get("expires_at"),
            "max_attempts": item.get("max_attempts", 1),
            "attempts_used": item.get("attempts_used", 0),
            "claimed_by_email": item.get("claimed_by_email"),
            "share_with_taker": item.get("share_with_taker", False),
            "status": item.get("status", "active"),
            "keywords_count": len(item.get("boost_keywords", [])),
            "created_at": item.get("created_at"),
        })
    return results


@router.get("/assessments/{assessment_id}")
async def get_assessment_by_id(
    assessment_id: str,
    current_user: dict = Depends(require_assessor),
):
    """Fetch a single assessment owned by the current assessor. Returns 404 for foreign objects."""
    if not ObjectId.is_valid(assessment_id):
        raise HTTPException(status_code=404, detail="Assessment not found")

    doc = await db.assessments.find_one({
        "_id": ObjectId(assessment_id),
        "owner_id": current_user["id"],
    })
    if not doc:
        raise HTTPException(status_code=404, detail="Assessment not found")

    doc["assessment_id"] = str(doc.pop("_id"))
    doc.pop("token_hash", None)
    doc.pop("claim_secret", None)
    return doc


@router.patch("/assessments/{assessment_id}")
async def update_assessment(
    assessment_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(require_assessor),
):
    """Allow the owning assessor to toggle 'share_with_taker' or revoke/reopen an assessment."""
    if not ObjectId.is_valid(assessment_id):
        raise HTTPException(status_code=404, detail="Assessment not found")

    doc = await db.assessments.find_one({
        "_id": ObjectId(assessment_id),
        "owner_id": current_user["id"],
    })
    if not doc:
        raise HTTPException(status_code=404, detail="Assessment not found")

    updates = {}
    if "share_with_taker" in payload:
        updates["share_with_taker"] = bool(payload["share_with_taker"])
        # Also propagate to any existing reports for this assessment
        await db.evaluations.update_many(
            {"assessment_id": assessment_id},
            {"$set": {"share_with_taker": updates["share_with_taker"]}},
        )
    if "status" in payload and payload["status"] in {"active", "revoked"}:
        updates["status"] = payload["status"]

    if updates:
        await db.assessments.update_one({"_id": doc["_id"]}, {"$set": updates})
        doc.update(updates)

    return {
        "assessment_id": str(doc["_id"]),
        "status": doc.get("status"),
        "share_with_taker": doc.get("share_with_taker"),
    }


# ── 2. Hybrid Taker Entry Endpoints (Token Link Preview & One-Claimer Claim) ─

@router.get("/assessments/by-token/{raw_token}")
async def preview_assessment_by_token(raw_token: str):
    """Public preview of an assessment link before the student/candidate starts."""
    token_hash = _hash_token(raw_token)
    doc = await db.assessments.find_one({"token_hash": token_hash})
    if not doc:
        raise HTTPException(status_code=404, detail="Invalid or unknown assessment link.")

    _check_assessment_window(doc)

    if doc.get("attempts_used", 0) >= doc.get("max_attempts", 1):
        raise HTTPException(status_code=400, detail="Maximum attempts for this assessment link have been used.")

    return {
        "assessment_id": str(doc["_id"]),
        "role_title": doc.get("role_title", "Assessment"),
        "track": doc.get("track", "tech"),
        "language": doc.get("language", "hinglish"),
        "owner_name": doc.get("owner_name", doc.get("owner_username", "Assessor")),
        "owner_role": doc.get("owner_role", "recruiter"),
        "owner_organization": doc.get("owner_organization", ""),
        "keywords_count": len(doc.get("boost_keywords", [])),
        "opens_at": doc.get("opens_at"),
        "expires_at": doc.get("expires_at"),
        "max_attempts": doc.get("max_attempts", 1),
        "attempts_used": doc.get("attempts_used", 0),
        "is_claimed": bool(doc.get("claimed_by_user_id") or doc.get("claimed_by_email")),
    }


@router.post("/assessments/claim")
async def claim_assessment_link(
    payload: dict = Body(...),
    current_user: Optional[dict] = Depends(get_optional_user),
):
    """Hybrid Taker Entry (Approach 3):
    - Works for a logged-in Student/Candidate (binds to taker_user_id)
    - Works for a Guest Student/Candidate providing Full Name + Email
    - Enforces window, attempt limits, and the One-Claimer lock (Taker B cannot claim Taker A's link).
    """
    raw_token = (payload.get("token") or "").strip()
    if not raw_token:
        raise HTTPException(status_code=400, detail="Assessment token is required.")

    # Assessors cannot take assigned links as takers
    if current_user and current_user.get("role") in ASSESSOR_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Recruiters and Teachers cannot take assigned links. Please use Self-Practice mode.",
        )

    token_hash = _hash_token(raw_token)
    assessment = await db.assessments.find_one({"token_hash": token_hash})
    if not assessment:
        raise HTTPException(status_code=404, detail="Invalid assessment link.")

    _check_assessment_window(assessment)

    # Resolve taker identity (Logged-in vs Guest Name + Email)
    if current_user:
        taker_user_id = current_user["id"]
        taker_username = current_user["username"]
        taker_name = (payload.get("taker_name") or current_user.get("full_name") or current_user["username"]).strip()
        taker_email = (payload.get("taker_email") or current_user.get("email") or "").strip().lower()
    else:
        taker_user_id = None
        taker_name = (payload.get("taker_name") or "").strip()
        taker_email = (payload.get("taker_email") or "").strip().lower()
        if not taker_name or not taker_email or "@" not in taker_email:
            raise HTTPException(
                status_code=400,
                detail="Please enter your Full Name and a valid Email address to start the assessment.",
            )
        taker_username = f"guest_{secrets.token_hex(3)}"

    # One-Claimer Enforcement (Acceptance Test #1)
    claimed_user_id = assessment.get("claimed_by_user_id")
    claimed_email = assessment.get("claimed_by_email")
    existing_claim_secret = assessment.get("claim_secret")
    provided_claim_secret = payload.get("claim_secret")

    is_already_claimed = bool(claimed_user_id or claimed_email)
    if is_already_claimed:
        same_logged_in_user = bool(taker_user_id and claimed_user_id == taker_user_id)
        same_guest_with_secret = bool(
            not claimed_user_id
            and existing_claim_secret
            and provided_claim_secret == existing_claim_secret
        )
        if not (same_logged_in_user or same_guest_with_secret):
            raise HTTPException(
                status_code=403,
                detail="This assessment link has already been claimed by another participant.",
            )

    # Check attempt limit (Acceptance Test #2)
    attempts_used = int(assessment.get("attempts_used", 0))
    max_attempts = int(assessment.get("max_attempts", 1))
    if attempts_used >= max_attempts:
        raise HTTPException(
            status_code=400,
            detail="Maximum attempts for this assessment link have been reached.",
        )

    # Lock claim on assessment and increment attempts_used
    claim_secret = existing_claim_secret or secrets.token_urlsafe(16)
    await db.assessments.update_one(
        {"_id": assessment["_id"]},
        {
            "$set": {
                "claimed_by_user_id": claimed_user_id or taker_user_id,
                "claimed_by_email": claimed_email or taker_email,
                "claimed_by_name": taker_name,
                "claim_secret": claim_secret,
            },
            "$inc": {"attempts_used": 1},
        },
    )

    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    session_secret = secrets.token_urlsafe(24)
    session_doc = {
        "assessment_id": str(assessment["_id"]),
        "is_practice": False,
        "assessor_id": assessment["owner_id"],
        "assessor_username": assessment["owner_username"],
        "assessor_role": assessment.get("owner_role", "recruiter"),
        "taker_user_id": taker_user_id,
        "taker_username": taker_username,
        "taker_name": taker_name,
        "taker_email": taker_email,
        "username": taker_username,
        "session_secret": session_secret,
        "state": "claimed",
        "role_title": assessment.get("role_title", "Assessment"),
        "track": assessment.get("track", "tech"),
        "language": assessment.get("language", "hinglish"),
        "jd_text": assessment.get("jd_text", ""),
        "jd_file_id": assessment.get("jd_file_id"),
        "keywords": assessment.get("boost_keywords", []),
        "share_with_taker": assessment.get("share_with_taker", False),
        "expires_at": assessment.get("expires_at"),
        "created_at": now_iso,
    }
    sess_res = await db.interview_sessions.insert_one(session_doc)

    return {
        "success": True,
        "session_id": str(sess_res.inserted_id),
        "session_secret": session_secret,
        "claim_secret": claim_secret,
        "assessment_id": str(assessment["_id"]),
        "role_title": session_doc["role_title"],
        "track": session_doc["track"],
        "language": session_doc["language"],
        "taker_name": taker_name,
        "taker_email": taker_email,
        "keywords_count": len(session_doc["keywords"]),
    }


# ── 3. Self-Practice Sessions (Requires Logged-In User) ──────────────────────

@router.post("/sessions")
async def create_practice_session(
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """Create a Self-Practice session for any logged-in user who has completed role onboarding."""
    if current_user.get("needs_onboarding"):
        raise HTTPException(
            status_code=403,
            detail="Please complete role selection before starting a practice interview.",
        )

    track = payload.get("track", "tech").lower()
    language = payload.get("language", "hinglish")
    role_title = payload.get(
        "role_title",
        "Technical Practice Viva" if track == "tech" else "BDA Sales Practice Role-Play",
    )
    jd_text = (payload.get("jd_text") or "").strip()

    if not jd_text:
        jd_text = DEFAULT_TECH_JD.strip() if track == "tech" else DEFAULT_BDA_JD.strip()

    keywords = extract_keywords_from_text(jd_text)
    session_secret = secrets.token_urlsafe(24)
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    doc = {
        "assessment_id": None,
        "is_practice": True,
        "assessor_id": None,
        "assessor_username": None,
        "taker_user_id": current_user["id"],
        "taker_username": current_user["username"],
        "taker_name": current_user.get("full_name", current_user["username"]),
        "taker_email": current_user.get("email", ""),
        "username": current_user["username"],
        "session_secret": session_secret,
        "state": "claimed",
        "role_title": role_title,
        "track": track,
        "language": language,
        "jd_text": jd_text,
        "keywords": keywords,
        "share_with_taker": True,
        "created_at": now_iso,
    }
    result = await db.interview_sessions.insert_one(doc)

    return {
        "success": True,
        "session_id": str(result.inserted_id),
        "session_secret": session_secret,
        "role_title": role_title,
        "track": track,
        "language": language,
        "keywords": keywords,
    }


@router.get("/sessions/{session_id}")
async def get_session_details(
    session_id: str,
    session_secret: str = Query("", description="Session secret for guest takers"),
    current_user: Optional[dict] = Depends(get_optional_user),
):
    """Retrieve session configuration only for the rightful session owner/claimer."""
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status_code=404, detail="Session not found")

    doc = await db.interview_sessions.find_one({"_id": ObjectId(session_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")

    # Verify ownership or session_secret
    is_owner = bool(
        current_user
        and (
            doc.get("taker_user_id") == current_user["id"]
            or doc.get("assessor_id") == current_user["id"]
        )
    )
    has_valid_secret = bool(session_secret and doc.get("session_secret") == session_secret)

    if not (is_owner or has_valid_secret):
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": str(doc["_id"]),
        "role_title": doc.get("role_title", "Interview Session"),
        "track": doc.get("track", "tech"),
        "language": doc.get("language", "hinglish"),
        "is_practice": doc.get("is_practice", True),
        "state": doc.get("state", "claimed"),
        "keywords_count": len(doc.get("keywords", [])),
    }


# ── 4. LiveKit Token Issuance (Strict Session Ownership Validation) ──────────

@router.get("/token")
async def get_token(
    session_id: str = Query(..., description="Verified MongoDB interview session ID"),
    session_secret: str = Query("", description="Session secret returned at claim/creation"),
    room: str = Query("", description="Optional legacy room param (ignored in favor of server-generated room)"),
    identity: str = Query("", description="Optional legacy identity"),
    language: str = Query("hinglish"),
    track: str = Query("tech"),
    current_user: Optional[dict] = Depends(get_optional_user),
):
    """Issue a short-lived LiveKit token ONLY after validating session ownership,
    state, and expiry (Acceptance Test #1 & #6).
    """
    if not session_id or not ObjectId.is_valid(session_id):
        raise HTTPException(status_code=404, detail="Valid session_id is required to join an interview room.")

    session_doc = await db.interview_sessions.find_one({"_id": ObjectId(session_id)})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    # Reject completed or expired sessions
    if session_doc.get("state") in {"completed", "expired"}:
        raise HTTPException(status_code=400, detail="This interview session has already been completed or expired.")

    expires_at = _parse_iso(session_doc.get("expires_at"))
    if expires_at and datetime.datetime.utcnow() > expires_at:
        raise HTTPException(status_code=400, detail="This interview session has expired.")

    # Strict Authorization Check (Acceptance Test #1 & #6)
    is_practice = session_doc.get("is_practice", True)
    taker_user_id = session_doc.get("taker_user_id")
    stored_secret = session_doc.get("session_secret")

    if is_practice:
        # Practice ALWAYS requires a logged-in user who owns the practice session
        if not current_user or taker_user_id != current_user["id"]:
            raise HTTPException(status_code=404, detail="Practice session not found.")
    else:
        # Assigned assessment session: must match either the logged-in taker who claimed it OR the session_secret
        matches_user = bool(current_user and taker_user_id and current_user["id"] == taker_user_id)
        matches_secret = bool(stored_secret and session_secret and stored_secret == session_secret)
        if taker_user_id and current_user and current_user["id"] != taker_user_id:
            # A different logged-in user (Taker B) is trying to open Taker A's claimed session!
            raise HTTPException(status_code=403, detail="This session is locked to another participant.")
        if not (matches_user or matches_secret):
            raise HTTPException(status_code=403, detail="Unauthorized to access this interview session.")

    resolved_track = session_doc.get("track", track)
    resolved_lang = session_doc.get("language", language)
    keywords = session_doc.get("keywords", [])
    taker_username = session_doc.get("taker_username") or (current_user["username"] if current_user else "guest")

    # Server-generated unguessable room name and identity
    server_room = session_doc.get("livekit_room") or f"intervai-{session_id}-{secrets.token_hex(4)}"
    server_identity = f"taker_{session_id[-6:]}"

    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    await db.interview_sessions.update_one(
        {"_id": session_doc["_id"]},
        {"$set": {"state": "in_progress", "started_at": now_iso, "livekit_room": server_room}},
    )

    dispatch_metadata = json.dumps({
        "session_id": session_id,
        "assessment_id": session_doc.get("assessment_id"),
        "is_practice": is_practice,
        "assessor_id": session_doc.get("assessor_id"),
        "assessor_username": session_doc.get("assessor_username"),
        "taker_user_id": taker_user_id,
        "taker_username": taker_username,
        "taker_name": session_doc.get("taker_name", taker_username),
        "taker_email": session_doc.get("taker_email", ""),
        "share_with_taker": session_doc.get("share_with_taker", True),
        "role_title": session_doc.get("role_title", "Assessment"),
        "username": taker_username,
        "language": resolved_lang,
        "track": resolved_track,
        "keywords": keywords,
    })

    token = (
        api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        .with_identity(server_identity)
        .with_name(session_doc.get("taker_name", taker_username))
        .with_ttl(datetime.timedelta(minutes=30))
        .with_grants(
            api.VideoGrants(
                room_join=True,
                room=server_room,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )
        .with_room_config(
            api.RoomConfiguration(
                agents=[
                    api.RoomAgentDispatch(
                        agent_name=AGENT_NAME,
                        metadata=dispatch_metadata,
                    )
                ]
            )
        )
        .to_jwt()
    )
    return {
        "token": token,
        "url": LIVEKIT_URL,
        "room": server_room,
        "agent_name": AGENT_NAME,
        "language": resolved_lang,
        "track": resolved_track,
        "role_title": session_doc.get("role_title", "Assessment"),
        "keywords_count": len(keywords),
    }


# ── 5. Reports & Evaluations (Strict Role & Ownership Filtering) ─────────────

def _can_user_view_report(ev: dict, current_user: dict) -> bool:
    """Object-level authorization check for viewing a single evaluation report."""
    user_id = current_user["id"]
    username = current_user["username"]
    is_practice = ev.get("is_practice", ev.get("assessment_id") is None)

    if is_practice:
        # Practice report is visible ONLY to the practitioner who took it
        if ev.get("taker_user_id"):
            return ev.get("taker_user_id") == user_id
        return ev.get("username") == username

    # Assigned assessment report:
    # 1. The Recruiter/Teacher who created the assessment ALWAYS sees it
    if ev.get("assessor_id") == user_id:
        return True
    # 2. The Student/Candidate who took it sees it ONLY if share_with_taker is True
    if ev.get("taker_user_id") == user_id and ev.get("share_with_taker") is True:
        return True

    return False


@router.get("/evaluations")
async def get_evaluations(
    scope: str = Query("all", description="'assigned', 'practice', or 'all'"),
    assessment_id: str = Query("", description="Optional filter by assessment_id"),
    current_user: dict = Depends(get_current_user),
):
    """Return reports filtered strictly by ownership and role."""
    user_id = current_user["id"]
    username = current_user["username"]
    role = current_user.get("role")

    practice_query = {
        "$and": [
            {"$or": [{"is_practice": True}, {"assessment_id": None}]},
            {"$or": [{"taker_user_id": user_id}, {"taker_user_id": None, "username": username}]},
        ]
    }

    if role in ASSESSOR_ROLES:
        assigned_query = {"is_practice": False, "assessor_id": user_id}
        if assessment_id:
            assigned_query["assessment_id"] = assessment_id
    else:
        assigned_query = {
            "is_practice": False,
            "taker_user_id": user_id,
            "share_with_taker": True,
        }

    if scope == "assigned":
        mongo_query = assigned_query
    elif scope == "practice":
        mongo_query = practice_query
    else:
        mongo_query = {"$or": [assigned_query, practice_query]}

    cursor = db.evaluations.find(mongo_query).sort("timestamp", -1)
    evaluations = await cursor.to_list(length=100)
    for ev in evaluations:
        ev["_id"] = str(ev["_id"])
        if ev.get("jd_id"):
            ev["jd_id"] = str(ev["jd_id"])
    return evaluations


@router.get("/evaluations/{eval_id}")
async def get_single_evaluation(
    eval_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Fetch a single report with strict object-level ownership (returns 404 if unauthorized)."""
    if not ObjectId.is_valid(eval_id):
        raise HTTPException(status_code=404, detail="Evaluation not found")

    ev = await db.evaluations.find_one({"_id": ObjectId(eval_id)})
    if not ev or not _can_user_view_report(ev, current_user):
        raise HTTPException(status_code=404, detail="Evaluation not found")

    ev["_id"] = str(ev["_id"])
    if ev.get("jd_id"):
        ev["jd_id"] = str(ev["jd_id"])
    return ev


@router.delete("/evaluations/{eval_id}")
async def delete_practice_evaluation(
    eval_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Allow a user to delete their own practice report ('delete my data' requirement)."""
    if not ObjectId.is_valid(eval_id):
        raise HTTPException(status_code=404, detail="Evaluation not found")

    ev = await db.evaluations.find_one({"_id": ObjectId(eval_id)})
    if not ev:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    is_practice = ev.get("is_practice", ev.get("assessment_id") is None)
    owns_practice = (ev.get("taker_user_id") == current_user["id"]) or (
        not ev.get("taker_user_id") and ev.get("username") == current_user["username"]
    )
    if not (is_practice and owns_practice):
        raise HTTPException(status_code=404, detail="Evaluation not found")

    await db.evaluations.delete_one({"_id": ev["_id"]})
    return {"success": True, "deleted_id": eval_id}


@router.get("/evaluations/{eval_id}/pdf")
async def get_evaluation_pdf(
    eval_id: str,
    token: str = Query(..., description="JWT auth token"),
):
    """Generate and return a PDF report after verifying report ownership."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    db_user = await db.users.find_one({"username": username})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid user")

    current_user = {
        "id": str(db_user["_id"]),
        "username": db_user["username"],
        "role": db_user.get("role"),
    }

    if not ObjectId.is_valid(eval_id):
        raise HTTPException(status_code=404, detail="Evaluation not found")

    ev = await db.evaluations.find_one({"_id": ObjectId(eval_id)})
    if not ev or not _can_user_view_report(ev, current_user):
        raise HTTPException(status_code=404, detail="Evaluation not found")

    buffer = generate_evaluation_pdf(ev)
    report_subject = ev.get("taker_name") or ev.get("username") or "Candidate"

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="IntervAI_Report_{report_subject}.pdf"'
        },
    )
