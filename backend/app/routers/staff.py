from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from datetime import datetime

from app.database import get_db
from app.dependencies import require_staff
from app.models import PatientMaster, User

router = APIRouter(prefix="/staff", tags=["Staff"])


# ── Restricted patient search ─────────────────────────────
@router.get("/patients/search")
async def staff_search_patient(
    query: str,
    current_user=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    if len(query) != 12 or not query.isdigit():
        raise HTTPException(status_code=400, detail="Must be a 12-digit ABHA ID or Aadhaar number")

    result = await db.execute(
        select(PatientMaster).where(
            or_(PatientMaster.abha_id == query, PatientMaster.aadhaar == query)
        )
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Return ONLY non-sensitive fields (no doctor notes, no diagnosis)
    return {
        "id": patient.id,
        "abha_id": patient.abha_id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "current_medicines": patient.current_medicines,
        "emergency_contact": patient.emergency_contact,
        "emergency_phone": patient.emergency_phone,
    }
