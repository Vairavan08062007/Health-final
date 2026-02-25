from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import DoctorSuggestion
from app.schemas import SuggestionCreate, SuggestionOut
from app.dependencies import require_doctor

router = APIRouter(prefix="/suggestions", tags=["Suggestions"])


@router.post("/", response_model=SuggestionOut, status_code=201)
async def add_suggestion(
    payload: SuggestionCreate,
    current_user=Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    suggestion = DoctorSuggestion(
        doctor_id=current_user.id,
        patient_id=payload.patient_id,
        notes=payload.notes,
        risk_level=payload.risk_level,
        followup_date=payload.followup_date,
    )
    db.add(suggestion)
    await db.commit()
    await db.refresh(suggestion)
    return suggestion


@router.get("/{patient_id}", response_model=List[SuggestionOut])
async def get_suggestions(
    patient_id: int,
    current_user=Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DoctorSuggestion)
        .where(DoctorSuggestion.patient_id == patient_id)
        .order_by(DoctorSuggestion.created_at.desc())
    )
    return result.scalars().all()
