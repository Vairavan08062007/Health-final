from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.database import get_db
from app.models import Hospital, User, AuditLog
from app.schemas import LoginRequest, TokenResponse, HospitalCreate
from app.dependencies import create_access_token, require_admin
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    # 1. Verify hospital exists
    hosp_result = await db.execute(
        select(Hospital).where(Hospital.hospital_id == payload.hospital_id, Hospital.is_active == True)
    )
    hospital = hosp_result.scalar_one_or_none()
    if not hospital:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # 2. Find user within this hospital
    user_result = await db.execute(
        select(User).where(
            User.username == payload.username,
            User.hospital_id == hospital.id,
            User.status == True,
        )
    )
    user = user_result.scalar_one_or_none()
    if not user or not pwd_ctx.verify(payload.password, user.password_hash):
        # Audit failed attempt
        db.add(AuditLog(action="LOGIN_FAILED", details={"username": payload.username, "hospital_id": payload.hospital_id}, ip_address=request.client.host))
        await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # 3. Update last_login
    await db.execute(update(User).where(User.id == user.id).values(last_login=datetime.utcnow()))

    # 4. Audit success
    db.add(AuditLog(user_id=user.id, action="LOGIN_SUCCESS", ip_address=request.client.host))
    await db.commit()

    # 5. Issue JWT
    token = create_access_token(user.id, user.role, payload.hospital_id)

    return TokenResponse(
        access_token=token,
        role=user.role,
        full_name=user.full_name,
        hospital_id=payload.hospital_id,
    )


@router.post("/register-hospital", status_code=status.HTTP_201_CREATED)
async def register_hospital(payload: HospitalCreate, db: AsyncSession = Depends(get_db)):
    # Guard with bootstrap secret
    if payload.register_secret != settings.register_secret:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid register secret")

    # Check duplicate hospital_id
    existing = await db.execute(select(Hospital).where(Hospital.hospital_id == payload.hospital_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Hospital ID already exists")

    # Create hospital
    hospital = Hospital(
        hospital_id=payload.hospital_id,
        name=payload.name,
        email=payload.email,
        address=payload.address,
    )
    db.add(hospital)
    await db.flush()

    # Create admin user
    admin = User(
        hospital_id=hospital.id,
        username=payload.admin_username,
        email=payload.email,
        password_hash=pwd_ctx.hash(payload.admin_password),
        role="admin",
        full_name=payload.admin_full_name or "Administrator",
    )
    db.add(admin)
    await db.commit()

    return {"message": f"Hospital {payload.hospital_id} registered successfully", "hospital_id": payload.hospital_id}
