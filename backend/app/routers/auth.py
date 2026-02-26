from datetime import datetime
from sqlalchemy import func
from fastapi import APIRouter, Depends, HTTPException, Request, status
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Hospital, User, AuditLog
from app.schemas import LoginRequest, TokenResponse, HospitalCreate
from app.dependencies import create_access_token, require_admin
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    # 1. Normalize frontend JSON inputs rigorously
    norm_hosp_id = str(payload.hospital_id).strip()
    norm_username = str(payload.username).strip().lower()
    
    # Secure byte length validation for passlib bcrypt
    raw_password = payload.password
    if not isinstance(raw_password, str) or len(raw_password.encode("utf-8")) > 72:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # 2. Verify hospital exists (using safe scalar matching and case insensitivity)
    hosp_result = await db.execute(
        select(Hospital).where(func.lower(Hospital.hospital_id) == norm_hosp_id.lower())
    )
    hospital = hosp_result.scalars().first()
    
    # Robust boolean check
    if not hospital or hospital.is_active is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # 3. Find user within this hospital
    # - User.hospital_id is strictly casted to the integer hospital.id
    # - Username is checked via func.lower() to bypass case-sensitivity mismatches
    user_result = await db.execute(
        select(User).where(
            func.lower(User.username) == norm_username,
            User.hospital_id == hospital.id
        )
    )
    user = user_result.scalars().first()
    
    # 4. Safely verify user exists, is active, and password matches
    if not user or user.status is False or not pwd_ctx.verify(raw_password, user.password_hash):
        # Audit failed attempt
        db.add(AuditLog(action="LOGIN_FAILED", details={"username": norm_username, "hospital_id": norm_hosp_id}, ip_address=request.client.host))
        await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # 5. Safely update last_login sequentially
    user.last_login = datetime.utcnow()

    # 6. Audit success
    db.add(AuditLog(user_id=user.id, action="LOGIN_SUCCESS", ip_address=request.client.host))
    await db.commit()

    # 7. Issue JWT scoped explicitly to string hospital ID mapping
    token = create_access_token(user.id, user.role, norm_hosp_id)

    return TokenResponse(
        access_token=token,
        role=user.role,
        full_name=user.full_name,
        hospital_id=norm_hosp_id,
    )


@router.post("/register-hospital", status_code=status.HTTP_201_CREATED)
async def register_hospital(payload: HospitalCreate, db: AsyncSession = Depends(get_db)):
    # Guard with bootstrap secret
    if payload.register_secret != settings.register_secret:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid register secret")

    # Normalize inputs for storing to perfectly align with login retrieval
    norm_hosp_id = str(payload.hospital_id).strip()
    norm_username = str(payload.admin_username).strip().lower()

    # Explicitly extract the raw password to prevent accidental object hashing
    raw_password = payload.admin_password

    # Validate type to ensure we are strictly hashing a string, not None or a dict
    if raw_password is None or not isinstance(raw_password, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password type. Ensure 'admin_password' is included as a string."
        )

    # Validate length manually (bcrypt 72-byte limit)
    if len(raw_password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password too long. Maximum length is 72 bytes."
        )

    # Check duplicate hospital_id
    existing = await db.execute(select(Hospital).where(func.lower(Hospital.hospital_id) == norm_hosp_id.lower()))
    if existing.scalars().first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Hospital ID already exists")

    try:
        # Hash ONLY the raw password explicitly and securely
        hashed_password = pwd_ctx.hash(raw_password)

        # Create hospital (saving normalized values)
        hospital = Hospital(
            hospital_id=norm_hosp_id,
            name=payload.name.strip(),
            email=str(payload.email).strip().lower(),
            address=str(payload.address).strip() if payload.address else None,
        )
        db.add(hospital)
        await db.flush()

        # Create admin user
        # Note: hospital_id=hospital.id inserts the INTEGER foreign key accurately
        admin = User(
            hospital_id=hospital.id,
            username=norm_username,
            email=str(payload.email).strip().lower(),
            password_hash=hashed_password,
            role="admin",
            full_name=str(payload.admin_full_name).strip() if payload.admin_full_name else "Administrator",
        )
        db.add(admin)
        await db.commit()
        
        # Ensure instances are refreshed to be stored successfully and fully updated with DB defaults
        await db.refresh(hospital)
        await db.refresh(admin)

    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A record with these details already exists (check email or username)."
        )
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected server error occurred during registration. Please verify field formatting."
        )

    return {"message": f"Hospital {norm_hosp_id} registered successfully", "hospital_id": norm_hosp_id}
