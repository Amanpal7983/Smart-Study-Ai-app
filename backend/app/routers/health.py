from fastapi import APIRouter
from app.services.ai_service import ai_enabled
router = APIRouter(tags=["Health"])

@router.get("/api/health")
def health():
    return {"ok": True, "ai": ai_enabled()}
