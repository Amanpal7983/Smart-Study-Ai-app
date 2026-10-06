import json
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.item import Item
from app.models.user import User
from app.schemas.generation import SaveRequest
from app.utils.dates import parse_created_at

router=APIRouter(prefix="/api/items",tags=["Items"])

def summarize(type_, output):
    if type_=="assessment":
        hrs=sum(t["hours"] for t in output["topics"])
        return f"{hrs:g} hrs study plan recommended"
    if type_=="plan":
        hrs=sum(s["hours"] for d in output["week"] for s in d["slots"])
        return f"Weekly timetable · {hrs:g} hrs/week"
    return f"{len(output['notes'])} sections · {len(output['questions'])} questions · {len(output['flashcards'])} flashcards"

def item_row(r):
    return {"id":r.id,"type":r.type,"subject":r.subject,"title":r.title,"saved":bool(r.saved),"source":r.source,"createdAt":parse_created_at(r.created_at),"result":summarize(r.type,json.loads(r.output)) if r.output else None}

def own_item(db,user,id_):
    row=db.scalar(select(Item).where(Item.id==int(id_),Item.user_id==user.id))
    if not row: raise HTTPException(status_code=404,detail="Item not found")
    return row

@router.get("")
def items(type: str|None=None,saved: str|None=None,limit:int=Query(100),db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    stmt=select(Item).where(Item.user_id==user.id)
    if type in ["assessment","plan","material"]: stmt=stmt.where(Item.type==type)
    if saved=="1": stmt=stmt.where(Item.saved.is_(True))
    limit=min(200, max(1, int(limit or 100)))
    stmt=stmt.order_by(desc(Item.created_at),desc(Item.id)).limit(limit)
    return {"items":[item_row(r) for r in db.scalars(stmt).all()]}

@router.get("/{id}")
def item(id:int,db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    r=own_item(db,user,id); result=item_row(r); result["input"]=json.loads(r.input); result["output"]=json.loads(r.output); return result

@router.patch("/{id}")
def set_saved(id:int,payload:SaveRequest,db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    r=own_item(db,user,id); r.saved=payload.saved; db.commit(); return {"id":id,"saved":payload.saved}

@router.delete("/{id}",status_code=204)
def remove(id:int,db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    r=own_item(db,user,id); db.delete(r); db.commit(); return Response(status_code=204)
