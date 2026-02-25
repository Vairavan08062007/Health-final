from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.database import get_db
from app.models import PatientMaster
from app.schemas import PatientOut
from app.dependencies import require_doctor

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("/search")
async def search_patient(
    query: str,
    current_user=Depends(require_doctor),
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
        raise HTTPException(status_code=404, detail="Patient not found for given ABHA ID or Aadhaar")
    return patient


@router.get("/{abha_id}/full-profile")
async def get_full_profile(
    abha_id: str,
    current_user=Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    from app.models import DoctorSuggestion, Prescription, PatientReport

    result = await db.execute(
        select(PatientMaster).where(PatientMaster.abha_id == abha_id)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    suggestions = await db.execute(
        select(DoctorSuggestion).where(DoctorSuggestion.patient_id == patient.id)
        .order_by(DoctorSuggestion.created_at.desc())
    )
    prescriptions = await db.execute(
        select(Prescription).where(Prescription.patient_id == patient.id)
        .order_by(Prescription.created_at.desc())
    )
    reports = await db.execute(
        select(PatientReport).where(PatientReport.patient_id == patient.id)
        .order_by(PatientReport.upload_date.desc())
    )

    return {
        "patient": patient,
        "suggestions": suggestions.scalars().all(),
        "prescriptions": prescriptions.scalars().all(),
        "reports": reports.scalars().all(),
    }
