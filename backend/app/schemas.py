from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────
class LoginRequest(BaseModel):
    hospital_id: str
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: Optional[str] = None
    hospital_id: str

class TokenPayload(BaseModel):
    sub: int
    role: str
    hospital_id: str
    exp: Optional[int] = None

# ── Hospital ──────────────────────────────────────────────
class HospitalCreate(BaseModel):
    hospital_id: str
    name: str
    email: EmailStr
    address: Optional[str] = None
    admin_username: str
    admin_password: str
    admin_full_name: Optional[str] = None
    register_secret: str

class HospitalOut(BaseModel):
    id: int; hospital_id: str; name: str; email: str
    address: Optional[str]; is_active: bool; created_at: datetime
    class Config: from_attributes = True

# ── User ──────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    password: str
    role: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: int; username: str; email: Optional[str]
    role: str; full_name: Optional[str]; status: bool
    last_login: Optional[datetime]; created_at: datetime
    class Config: from_attributes = True

# ── Patient ───────────────────────────────────────────────
class PatientOut(BaseModel):
    id: int; abha_id: str; aadhaar: Optional[str]
    name: str; age: Optional[int]; gender: Optional[str]
    blood_group: Optional[str]; allergies: Optional[str]
    chronic_conditions: Optional[str]; emergency_contact: Optional[str]
    emergency_phone: Optional[str]; current_medicines: Optional[str]
    risk_level: str; created_at: datetime
    class Config: from_attributes = True

# ── Suggestion ────────────────────────────────────────────
class SuggestionCreate(BaseModel):
    patient_id: int
    notes: str
    risk_level: str = "Low"
    followup_date: Optional[date] = None

class SuggestionOut(BaseModel):
    id: int; doctor_id: Optional[int]; patient_id: int
    notes: str; risk_level: str; followup_date: Optional[date]
    created_at: datetime
    class Config: from_attributes = True

# ── Prescription ──────────────────────────────────────────
class PrescriptionCreate(BaseModel):
    patient_id: int
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None

class PrescriptionOut(BaseModel):
    id: int; doctor_id: Optional[int]; patient_id: int
    medicine_name: str; dosage: Optional[str]
    frequency: Optional[str]; duration: Optional[str]; created_at: datetime
    class Config: from_attributes = True

# ── Report ────────────────────────────────────────────────
class ReportOut(BaseModel):
    id: int; patient_id: int; category: str
    file_name: str; file_path: str
    uploaded_by: Optional[int]; upload_date: datetime
    class Config: from_attributes = True

# ── Audit ─────────────────────────────────────────────────
class AuditLogOut(BaseModel):
    id: int; user_id: Optional[int]; action: str
    ip_address: Optional[str]; timestamp: datetime
    class Config: from_attributes = True
