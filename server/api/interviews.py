import jwt
from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import StreamingResponse
from livekit import api
from bson import ObjectId

from server.config import LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, JWT_SECRET, JWT_ALGORITHM
from server.core.security import get_current_user
from server.database import db
from server.services.report_generator import generate_evaluation_pdf

router = APIRouter(prefix="/api", tags=["interviews"])


@router.get("/token")
def get_token(
    room: str = Query(..., description="The name of the room to join"),
    identity: str = Query(..., description="Unique identity for the participant"),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Create token with appropriate grants
        token = (
            api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            .with_identity(identity)
            .with_name(identity)
            .with_grants(
                api.VideoGrants(
                    room_join=True,
                    room=room,
                    can_publish=True,
                    can_subscribe=True,
                    can_publish_data=True
                )
            )
            .to_jwt()
        )
        return {"token": token, "url": LIVEKIT_URL}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/evaluations")
async def get_evaluations(current_user: dict = Depends(get_current_user)):
    cursor = db.evaluations.find({"username": current_user["username"]}).sort("timestamp", -1)
    evaluations = await cursor.to_list(length=100)
    # Convert ObjectIds to strings for JSON serialization
    for ev in evaluations:
        ev["_id"] = str(ev["_id"])
        if "jd_id" in ev:
            ev["jd_id"] = str(ev["jd_id"])
    return evaluations


@router.get("/evaluations/{eval_id}/pdf")
async def get_evaluation_pdf(eval_id: str, token: str = Query(..., description="JWT auth token")):
    """Generate and return a PDF report for a specific evaluation."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        ev = await db.evaluations.find_one({"_id": ObjectId(eval_id), "username": username})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Evaluation ID")

    if not ev:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    buffer = generate_evaluation_pdf(ev)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="IntervAI_Report_{ev.get("username")}.pdf"'
        }
    )

