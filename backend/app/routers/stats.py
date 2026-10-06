import json
from datetime import date, datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Header
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.item import Item
from app.models.user import User
from app.utils.dates import today_str, parse_created_at

router=APIRouter(prefix="/api",tags=["Stats"])

@router.get("/stats")
def stats(db:Session=Depends(get_db),user:User=Depends(get_current_user),x_tz_offset:int=Header(default=0,alias="X-TZ-Offset")):
    rows=db.scalars(select(Item).where(Item.user_id==user.id)).all()
    counts={"assessment":0,"plan":0,"material":0}; planned_hours=0; days=set(); subjects={}
    for r in rows:
        counts[r.type]=counts.get(r.type,0)+1
        subjects[r.subject]=subjects.get(r.subject,0)+1
        try:
            d=(r.created_at - timedelta(minutes=x_tz_offset or 0)).date().isoformat()
        except Exception:
            d=parse_created_at(r.created_at)[:10]
        days.add(d)
        if r.type=="assessment": planned_hours += sum(t["hours"] for t in json.loads(r.output)["topics"])
    streak=0; cursor=date.fromisoformat(today_str(x_tz_offset or 0))
    if cursor.isoformat() not in days: cursor-=timedelta(days=1)
    while cursor.isoformat() in days:
        streak+=1; cursor-=timedelta(days=1)
    top_subject=max(subjects.items(),key=lambda x:x[1])[0] if subjects else None
    return {"streak":streak,"plannedHours":planned_hours,"counts":counts,"total":len(rows),"topSubject":top_subject,"subjects":list(subjects.keys()),"memberSince":parse_created_at(user.created_at)}
