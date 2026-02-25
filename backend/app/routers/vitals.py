from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.dependencies import require_staff
from app.models import PatientVitals

router = APIRouter(prefix="/vitals", tags=["Vitals"])


class VitalsCreate(BaseModel):
    patient_id: int
    systolic: Optional[int] = None
    diastolic: Optional[int] = None
    sugar_fasting: Optional[float] = None
    sugar_random: Optional[float] = None
    temperature: Optional[float] = None


class VitalsOut(BaseModel):
    id: int
    patient_id: int
    systolic: Optional[int]
    diastolic: Optional[int]
    sugar_fasting: Optional[float]
    sugar_random: Optional[float]
    temperature: Optional[float]
    recorded_by: Optional[int]
    created_at: datetime
    class Config: from_attributes = True


@router.post("/", response_model=VitalsOut, status_code=201)
async def add_vitals(
    payload: VitalsCreate,
    current_user=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    vitals = PatientVitals(
        patient_id=payload.patient_id,
        systolic=payload.systolic,
        diastolic=payload.diastolic,
        sugar_fasting=payload.sugar_fasting,
        sugar_random=payload.sugar_random,
        temperature=payload.temperature,
        recorded_by=current_user.id,
    )
    db.add(vitals)
    await db.commit()
    await db.refresh(vitals)
    return vitals


@router.get("/{patient_id}", response_model=List[VitalsOut])
async def get_vitals(
    patient_id: int,
    current_user=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PatientVitals)
        .where(PatientVitals.patient_id == patient_id)
        .order_by(PatientVitals.created_at.desc())
    )
    return result.scalars().all()
