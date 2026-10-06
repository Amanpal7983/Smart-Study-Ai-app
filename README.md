# StudyAI — Smart Study Platform

A full-stack smart study platform with a React frontend and a Python/FastAPI + MySQL backend.

## Architecture

```text
React + Vite + Tailwind
        |
        | /api/*
        v
FastAPI
        |
        +-- SQLAlchemy 2.0
        |
        +-- JWT Authentication
        |
        +-- Gemini AI
        |
        v
MySQL
```

## Project Structure

```text
smart-study-platform/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── dependencies/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── alembic/
│   │   └── versions/
│   ├── scripts/
│   ├── tests/
│   ├── .env.example
│   ├── alembic.ini
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server forwards `/api/*` requests to FastAPI at `http://localhost:8000`.

## Backend

```bash
cd backend
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
```

Configure the MySQL connection and Gemini/JWT settings in `.env`.

Then:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

FastAPI runs at `http://localhost:8000`.

Swagger documentation:
`http://localhost:8000/docs`

## API Modules

- Authentication
- Assessment generation
- Study planner generation
- Learning material generation
- Generated item history
- Saved/unsaved items
- Item deletion
- Study statistics

## Database

The application uses MySQL. The database schema is managed with Alembic migrations.

The original SQLite/Node.js backend is intentionally not included in this final clean structure because the migration has been completed and verified.
