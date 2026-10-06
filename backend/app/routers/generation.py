from datetime import date
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.config import get_settings
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.item import Item
from app.models.user import User
from app.schemas.generation import AssessmentRequest, MaterialsRequest, PlannerRequest
from app.services.ai_service import generate
from app.services.rate_limit import SlidingWindowLimiter
from app.utils.dates import days_between, today_str

router = APIRouter(prefix="/api", tags=["Generation"])
ai_limiter = SlidingWindowLimiter(get_settings().ai_rate_limit_per_hour, 60 * 60)

def text(value, field, max_len=100, required=True):
    s = value.strip() if isinstance(value, str) else ""
    if not s:
        if required: raise HTTPException(status_code=400, detail=f"{field} is required")
        return ""
    if len(s) > max_len: raise HTTPException(status_code=400, detail=f"{field} is too long (max {max_len} characters)")
    return s

def iso_date(value, field, required=True):
    if not value:
        if required: raise HTTPException(status_code=400, detail=f"{field} is required")
        return ""
    try: date.fromisoformat(value)
    except ValueError: raise HTTPException(status_code=400, detail=f"{field} must be YYYY-MM-DD")
    return value

def guard_ai(user):
    if not ai_limiter.allow(f"ai:{user.id}"):
        raise HTTPException(status_code=429, detail="Hourly AI limit reached, please try again later")

def save(db, user, type_, subject, title, input_data, result):
    from datetime import datetime, timezone
    item = Item(user_id=user.id, type=type_, subject=subject, title=title, input=__import__('json').dumps(input_data, separators=(",", ":")), output=__import__('json').dumps(result["output"], separators=(",", ":")), source=result["source"], saved=False, created_at=datetime.now(timezone.utc).replace(tzinfo=None))
    db.add(item); db.commit(); db.refresh(item)
    return {"id": item.id, "type": type_, "subject": subject, "title": title, "source": result["source"], "saved": False, "output": result["output"], "input": input_data}

@router.post("/assessment")
async def assessment(payload: AssessmentRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user), x_tz_offset: int = Header(default=0, alias="X-TZ-Offset")):
    subject = text(payload.subject, "Subject")
    level = text(payload.level, "Level", 30)
    exam_date = iso_date(payload.examDate, "Exam date")
    goals = text(payload.goals, "Goals", 500, False)
    today = today_str(x_tz_offset or 0)
    days_left = days_between(today, exam_date)
    if days_left < 0: raise HTTPException(status_code=400, detail="Exam date is in the past")
    guard_ai(user)
    result = await generate("assessment", {"subject": subject, "level": level, "examDate": exam_date, "goals": goals, "today": today, "daysLeft": days_left})
    return save(db, user, "assessment", subject, f"{subject} Assessment", {"subject": subject, "level": level, "examDate": exam_date, "goals": goals}, result)

@router.post("/planner")
async def planner(payload: PlannerRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user), x_tz_offset: int = Header(default=0, alias="X-TZ-Offset")):
    if not payload.subjects: raise HTTPException(status_code=400, detail="Add at least one subject")
    if len(payload.subjects) > 8: raise HTTPException(status_code=400, detail="Max 8 subjects")
    subjects=[]
    for s in payload.subjects:
        v=text(s,"Subject",60)
        if v not in subjects: subjects.append(v)
    try: hours_per_day = int(float(payload.hoursPerDay))
    except (TypeError, ValueError): hours_per_day = 3
    hours_per_day=min(12,max(1,hours_per_day))
    intensity=payload.intensity if payload.intensity in ["Easy","Medium","Intensive"] else "Medium"
    start_date=iso_date(payload.startDate,"Start date",False)
    exam_date=iso_date(payload.examDate,"Exam date",False)
    today=today_str(x_tz_offset or 0)
    if exam_date and days_between(start_date or today, exam_date)<0: raise HTTPException(status_code=400,detail="Exam date must be after the start date")
    weeks=max(1, -(-days_between(start_date or today, exam_date)//7)) if exam_date else None
    guard_ai(user)
    input_data={"subjects":subjects,"hoursPerDay":hours_per_day,"intensity":intensity,"startDate":start_date,"examDate":exam_date}
    result=await generate("plan", {**input_data,"today":today,"weeks":weeks})
    subject_text=", ".join(subjects)[:100]
    title=(" + ".join(subjects)+" Study Plan")[:120]
    return save(db,user,"plan",subject_text,title,{**input_data,"weeks":weeks},result)

@router.post("/materials")
async def materials(payload: MaterialsRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    subject=text(payload.subject,"Subject")
    topic=text(payload.topic,"Topic")
    types=["Study Notes","Chapter Summary","Practice Questions","Full PDF Guide","Flashcards"]
    type_=payload.type if payload.type in types else "Study Notes"
    guard_ai(user)
    result=await generate("material", {"subject":subject,"topic":topic,"type":type_})
    title=result["output"].get("title") or topic
    return save(db,user,"material",subject,title,{"subject":subject,"topic":topic,"type":type_},result)
