"""Copy the existing StudyAI SQLite data into the new MySQL schema.
Run AFTER `alembic upgrade head` and while the Node backend is stopped.
Usage: python scripts/migrate_sqlite_to_mysql.py --sqlite ../server/data/studyai.db
"""
import argparse, json, sqlite3
from datetime import datetime
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.models import User, Item

def parse_ts(value):
    if not value: return datetime.utcnow()
    text=str(value).replace("Z", "+00:00")
    dt=datetime.fromisoformat(text)
    return dt.replace(tzinfo=None)

def main():
    parser=argparse.ArgumentParser(); parser.add_argument("--sqlite", default="../server/data/studyai.db"); args=parser.parse_args()
    src=sqlite3.connect(args.sqlite); src.row_factory=sqlite3.Row
    engine=create_engine(get_settings().database_url, pool_pre_ping=True)
    with Session(engine) as db:
        users=src.execute("SELECT id,name,email,password_hash,created_at FROM users ORDER BY id").fetchall()
        items=src.execute("SELECT id,user_id,type,subject,title,input,output,source,saved,created_at FROM items ORDER BY id").fetchall()
        for r in users:
            existing=db.scalar(select(User).where(User.id==r["id"]))
            if not existing:
                db.add(User(id=r["id"],name=r["name"],email=r["email"],password_hash=r["password_hash"],created_at=parse_ts(r["created_at"])))
        db.flush()
        for r in items:
            existing=db.scalar(select(Item).where(Item.id==r["id"]))
            if not existing:
                db.add(Item(id=r["id"],user_id=r["user_id"],type=r["type"],subject=r["subject"],title=r["title"],input=r["input"],output=r["output"],source=r["source"],saved=bool(r["saved"]),created_at=parse_ts(r["created_at"])))
        db.commit()
        print(f"Migrated/verified {len(users)} users and {len(items)} items.")
        print("Important: existing scrypt password hashes were copied unchanged.")
    src.close()

if __name__ == "__main__": main()
