# StudyAI FastAPI Backend

Python/FastAPI backend for the Smart Study Platform.

## Stack

- FastAPI
- SQLAlchemy 2.0
- MySQL + PyMySQL
- Alembic
- Pydantic v2
- JWT authentication
- Gemini AI

## Setup

```bash
cd backend
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
```

Create the MySQL database `studyai`, configure `.env`, then run:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

API: http://localhost:8000
Swagger: http://localhost:8000/docs
Health: http://localhost:8000/api/health

The API paths intentionally match the existing React client.
