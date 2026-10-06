from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.database import get_db
from app.models.user import User
from app.utils.security import verify_token

def get_current_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    settings = get_settings()
    token = authorization[7:] if authorization and authorization.startswith("Bearer ") else None
    payload = verify_token(token, settings.effective_jwt_secret) if token else None
    if not payload:
        raise HTTPException(status_code=401, detail="Please sign in again")
    try:
        user_id = int(payload.get("sub", 0))
    except (TypeError, ValueError):
        user_id = 0
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=401, detail="Please sign in again")
    return user
