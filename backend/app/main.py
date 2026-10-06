from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.config import get_settings
from app.routers import health, auth, generation, items, stats

settings=get_settings()
app=FastAPI(title="StudyAI API",version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://smart-study-ai-app.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_handler(request:Request,exc:RequestValidationError):
    # Keep the legacy frontend contract: errors are exposed as {error: message}.
    first=exc.errors()[0] if exc.errors() else {}
    msg=first.get("msg","Invalid request")
    field=first.get("loc",["body"])[-1]
    return JSONResponse(status_code=400,content={"error":f"{field}: {msg}"})

@app.exception_handler(Exception)
async def unhandled_handler(request:Request,exc:Exception):
    import logging
    logging.getLogger(__name__).exception("Unhandled error",exc_info=exc)
    return JSONResponse(status_code=500,content={"error":"Internal server error"})

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(generation.router)
app.include_router(items.router)
app.include_router(stats.router)
