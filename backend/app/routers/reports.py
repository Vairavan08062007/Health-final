import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import PatientReport
from app.schemas import ReportOut
from app.dependencies import require_doctor

router = APIRouter(prefix="/reports", tags=["Reports"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_CATEGORIES = ["Lab Report", "Radiology", "Prescription", "Emergency"]


@router.post("/upload", response_model=ReportOut, status_code=201)
async def upload_report(
    patient_id: int = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    current_user=Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Category must be one of: {ALLOWED_CATEGORIES}")

    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    report = PatientReport(
        patient_id=patient_id,
        category=category,
        file_name=file.filename,
        file_path=unique_name,
        uploaded_by=current_user.id,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("/patient/{patient_id}", response_model=List[ReportOut])
async def list_reports(
    patient_id: int,
    current_user=Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PatientReport)
        .where(PatientReport.patient_id == patient_id)
        .order_by(PatientReport.upload_date.desc())
    )
    return result.scalars().all()


@router.get("/download/{report_id}")
async def download_report(
    report_id: int,
    current_user=Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PatientReport).where(PatientReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    full_path = os.path.join(UPLOAD_DIR, report.file_path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(full_path, filename=report.file_name, media_type="application/octet-stream")
