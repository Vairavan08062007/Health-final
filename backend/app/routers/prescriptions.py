from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Prescription
from app.schemas import PrescriptionCreate, PrescriptionOut
from app.dependencies import require_doctor

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.post("/", response_model=PrescriptionOut, status_code=201)
async def add_prescription(
    payload: PrescriptionCreate,
    current_user=Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    rx = Prescription(
        doctor_id=current_user.id,
        patient_id=payload.patient_id,
        medicine_name=payload.medicine_name,
        dosage=payload.dosage,
        frequency=payload.frequency,
        duration=payload.duration,
    )
    db.add(rx)
    await db.commit()
    await db.refresh(rx)
    return rx


@router.get("/{patient_id}", response_model=List[PrescriptionOut])
async def get_prescriptions(
    patient_id: int,
    current_user=Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Prescription)
        .where(Prescription.patient_id == patient_id)
        .order_by(Prescription.created_at.desc())
    )
    return result.scalars().all()
