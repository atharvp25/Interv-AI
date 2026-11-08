import jwt
import bcrypt
from typing import Optional
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from server.config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from server.database import users_collection

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)

VALID_ROLES = {"recruiter", "teacher", "candidate", "student"}
ASSESSOR_ROLES = {"recruiter", "teacher"}
TAKER_ROLES = {"candidate", "student"}


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    # bcrypt has a 72-byte limit. We truncate to prevent crashes.
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def _serialize_user(user: dict) -> dict:
    role = user.get("role")
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user.get("email", ""),
        "full_name": user.get("full_name", user["username"]),
        "role": role or "candidate",
        "organization": user.get("organization", ""),
        "needs_onboarding": role is None,
    }


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = await users_collection.find_one({"username": username})
    if user is None:
        raise credentials_exception

    return _serialize_user(user)


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
) -> Optional[dict]:
    """Return the logged-in user if a valid Bearer token is present, otherwise None (for guest takers)."""
    if not credentials or not credentials.credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            return None
        user = await users_collection.find_one({"username": username})
        if not user:
            return None
        return _serialize_user(user)
    except Exception:
        return None


async def require_assessor(current_user: dict = Depends(get_current_user)) -> dict:
    """Enforce that the caller is an Assessor (Recruiter or Teacher)."""
    if current_user.get("role") not in ASSESSOR_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Only Recruiters and Teachers can perform this action.",
        )
    return current_user
