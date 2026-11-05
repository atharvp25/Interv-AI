from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from server.core.security import (
    get_password_hash, verify_password, create_access_token, get_current_user
)
from server.database import users_collection

router = APIRouter(prefix="/api", tags=["auth"])


class UserCreate(BaseModel):
    username: str
    password: str
    email: str = ""

class UserLogin(BaseModel):
    username: str
    password: str


@router.post("/register")
async def register(user: UserCreate):
    existing_user = await users_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = get_password_hash(user.password)
    new_user = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password
    }
    await users_collection.insert_one(new_user)
    return {"message": "User created successfully"}

@router.post("/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = create_access_token(data={"sub": db_user["username"]})
    return {"access_token": access_token, "token_type": "bearer", "username": db_user["username"]}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

