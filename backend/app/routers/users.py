from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserOut
from app.dependencies import require_admin, get_current_user
from app.routers.auth import pwd_ctx

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserOut])
async def list_users(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.hospital_id == current_user.hospital_id)
    )
    return result.scalars().all()


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if payload.role not in ("admin", "doctor", "staff"):
        raise HTTPException(status_code=400, detail="Invalid role")

    # Secure byte length validation and type safety exclusively enforced identical to admin registration
    raw_password = payload.password
    if not isinstance(raw_password, str) or len(raw_password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password too long. Maximum length is 72 bytes."
        )

    # Hash ONLY the securely validated raw password
    hashed_password = pwd_ctx.hash(raw_password)

    user = User(
        hospital_id=current_user.hospital_id,
        username=str(payload.username).strip().lower(),
        email=str(payload.email).strip().lower() if payload.email else None,
        password_hash=hashed_password,
        role=payload.role,
        full_name=str(payload.full_name).strip() if payload.full_name else None,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.patch("/{user_id}/toggle", response_model=UserOut)
async def toggle_user_status(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.id == user_id, User.hospital_id == current_user.hospital_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = not user.status
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
