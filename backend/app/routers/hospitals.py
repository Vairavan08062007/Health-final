from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import Hospital
from app.schemas import HospitalOut
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])


@router.get("/me", response_model=HospitalOut)
async def get_my_hospital(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Hospital).where(Hospital.id == current_user.hospital_id))
    hospital = result.scalar_one_or_none()
    return hospital
