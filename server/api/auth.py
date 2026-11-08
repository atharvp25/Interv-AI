import datetime
import re
from typing import Optional
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel

from server.config import GOOGLE_CLIENT_ID
from server.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    VALID_ROLES,
    _serialize_user,
)
from server.database import users_collection

router = APIRouter(prefix="/api", tags=["auth"])


class UserCreate(BaseModel):
    username: str
    password: str
    email: str = ""
    role: str = "candidate"
    full_name: str = ""
    organization: str = ""


class UserLogin(BaseModel):
    username: str
    password: str


@router.get("/auth/config")
async def get_auth_config():
    """Return public OAuth client configuration for the frontend."""
    is_configured = bool(
        GOOGLE_CLIENT_ID
        and "paste_your" not in GOOGLE_CLIENT_ID
        and "your_google" not in GOOGLE_CLIENT_ID
    )
    return {
        "google_client_id": GOOGLE_CLIENT_ID if is_configured else "",
        "google_enabled": is_configured,
    }


@router.post("/register")
async def register(user: UserCreate):
    clean_username = user.username.strip()
    if not clean_username:
        raise HTTPException(status_code=400, detail="Username is required")

    role = user.role.strip().lower() if user.role else "candidate"
    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role '{role}'. Must be one of: {', '.join(sorted(VALID_ROLES))}",
        )

    existing_user = await users_collection.find_one({"username": clean_username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    if user.email.strip():
        existing_email = await users_collection.find_one({"email": user.email.strip().lower()})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email is already registered")

    hashed_password = get_password_hash(user.password)
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    new_user = {
        "username": clean_username,
        "email": user.email.strip().lower(),
        "full_name": user.full_name.strip() or clean_username,
        "role": role,
        "organization": user.organization.strip(),
        "hashed_password": hashed_password,
        "auth_provider": "local",
        "created_at": now_iso,
    }
    res = await users_collection.insert_one(new_user)
    new_user["_id"] = res.inserted_id

    access_token = create_access_token(data={"sub": clean_username, "role": role})
    return {
        "message": "User created successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": _serialize_user(new_user),
    }


@router.post("/login")
async def login(user: UserLogin):
    identifier = user.username.strip()
    db_user = await users_collection.find_one(
        {"$or": [{"username": identifier}, {"email": identifier.lower()}]}
    )
    if not db_user or not db_user.get("hashed_password") or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    serialized = _serialize_user(db_user)
    access_token = create_access_token(
        data={"sub": db_user["username"], "role": serialized["role"]}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": db_user["username"],
        "role": serialized["role"],
        "needs_onboarding": serialized["needs_onboarding"],
        "user": serialized,
    }


@router.post("/auth/google")
async def google_auth(payload: dict = Body(...)):
    """Verify a Google OAuth 2.0 ID token and sign in or create the user."""
    credential = payload.get("credential") or payload.get("token")
    if not credential:
        raise HTTPException(status_code=400, detail="Missing Google credential token")

    if not GOOGLE_CLIENT_ID or "paste_your" in GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=503,
            detail="Google Sign-In is not configured on the server yet (missing GOOGLE_CLIENT_ID in .env)",
        )

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        id_info = id_token.verify_oauth2_token(
            credential, google_requests.Request(), GOOGLE_CLIENT_ID
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

    email = (id_info.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Google account did not provide an email")

    full_name = id_info.get("name") or email.split("@")[0]
    google_sub = id_info.get("sub", "")

    # Check if user already exists by email or google_id
    db_user = await users_collection.find_one(
        {"$or": [{"email": email}, {"google_id": google_sub}]}
    )

    if not db_user:
        # Generate a clean unique username from email prefix
        base_username = re.sub(r"[^a-zA-Z0-9_]", "_", email.split("@")[0]).lower()[:20] or "user"
        candidate_username = base_username
        suffix = 1
        while await users_collection.find_one({"username": candidate_username}):
            suffix += 1
            candidate_username = f"{base_username}_{suffix}"

        # Optional role if selected before clicking Google button
        requested_role = (payload.get("role") or "").strip().lower()
        assigned_role = requested_role if requested_role in VALID_ROLES else None

        now_iso = datetime.datetime.utcnow().isoformat() + "Z"
        db_user = {
            "username": candidate_username,
            "email": email,
            "full_name": full_name,
            "role": assigned_role,  # None triggers the 1-time role onboarding modal
            "organization": (payload.get("organization") or "").strip(),
            "google_id": google_sub,
            "auth_provider": "google",
            "created_at": now_iso,
        }
        res = await users_collection.insert_one(db_user)
        db_user["_id"] = res.inserted_id

    serialized = _serialize_user(db_user)
    access_token = create_access_token(
        data={"sub": db_user["username"], "role": serialized["role"]}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": db_user["username"],
        "role": serialized["role"],
        "needs_onboarding": serialized["needs_onboarding"],
        "user": serialized,
    }


@router.post("/onboarding")
async def complete_onboarding(
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """Complete one-time role & organization onboarding for a newly signed-up user.
    IMPORTANT: Once a user's role is set in DB, it is immutable and cannot be changed here.
    """
    db_user = await users_collection.find_one({"_id": ObjectId(current_user["id"])})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = {}
    if "full_name" in payload and isinstance(payload["full_name"], str) and payload["full_name"].strip():
        updates["full_name"] = payload["full_name"].strip()
    if "organization" in payload and isinstance(payload["organization"], str):
        updates["organization"] = payload["organization"].strip()

    # Role can ONLY be set if it was never set before (db_user.get("role") is None)
    if db_user.get("role") is None:
        new_role = (payload.get("role") or "").strip().lower()
        if new_role not in VALID_ROLES:
            raise HTTPException(
                status_code=400,
                detail=f"Please select a valid role: {', '.join(sorted(VALID_ROLES))}",
            )
        updates["role"] = new_role

    if updates:
        await users_collection.update_one(
            {"_id": db_user["_id"]},
            {"$set": updates},
        )
        db_user.update(updates)

    serialized = _serialize_user(db_user)
    return {"user": serialized, "role": serialized["role"]}


@router.patch("/me")
@router.put("/me")
async def update_profile(
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """Update basic profile fields (full_name, organization).
    Security requirement: Any 'role' field in payload is strictly ignored.
    """
    updates = {}
    if "full_name" in payload and isinstance(payload["full_name"], str) and payload["full_name"].strip():
        updates["full_name"] = payload["full_name"].strip()
    if "organization" in payload and isinstance(payload["organization"], str):
        updates["organization"] = payload["organization"].strip()

    if updates:
        await users_collection.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": updates},
        )

    db_user = await users_collection.find_one({"_id": ObjectId(current_user["id"])})
    return _serialize_user(db_user)


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
