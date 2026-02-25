from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
import os

from app.config import settings
from app.database import engine, Base
from app.routers import auth, hospitals, users, patients, suggestions, prescriptions, reports, staff, vitals

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="VitaSage AI",
    description="Hospital Management SaaS — Auth + Doctor Portal + Staff Portal",
    version="3.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# All routers
app.include_router(auth.router)
app.include_router(hospitals.router)
app.include_router(users.router)
app.include_router(patients.router)
app.include_router(suggestions.router)
app.include_router(prescriptions.router)
app.include_router(reports.router)
app.include_router(staff.router)
app.include_router(vitals.router)


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "VitaSage AI", "version": "3.0.0"}


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response
