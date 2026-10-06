from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.rate_limit import SlidingWindowLimiter
from app.utils.security import create_token, hash_password, verify_password
from app.utils.dates import parse_created_at

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
login_limiter = SlidingWindowLimiter(10, 15 * 60)
_dummy_hash = hash_password("dummy-password")

def public_user(user: User):
    return {"id": user.id, "name": user.name, "email": user.email, "createdAt": parse_created_at(user.created_at)}

def client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"

@router.post("/register", status_code=201)
def register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    if not login_limiter.allow(f"reg:{client_ip(request)}"):
        raise HTTPException(status_code=429, detail="Too many attempts, try later")
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    from datetime import datetime, timezone
    user = User(name=payload.name.strip(), email=payload.email.lower(), password_hash=hash_password(payload.password), created_at=datetime.now(timezone.utc).replace(tzinfo=None))
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    settings = get_settings()
    return {"token": create_token(user.id, settings.effective_jwt_secret), "user": public_user(user)}

@router.post("/login")
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    key = f"login:{client_ip(request)}:{payload.email.lower()}"
    if not login_limiter.allow(key):
        raise HTTPException(status_code=429, detail="Too many attempts, try again in 15 minutes")
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    ok = verify_password(payload.password, user.password_hash if user else _dummy_hash)
    if not user or not ok:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    settings = get_settings()
    return {"token": create_token(user.id, settings.effective_jwt_secret), "user": public_user(user)}

@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {"user": public_user(user)}
