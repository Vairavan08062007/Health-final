from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Date,
    ForeignKey, func, CheckConstraint
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class Hospital(Base):
    __tablename__ = "hospitals"
    id          = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(String(50), unique=True, nullable=False)
    name        = Column(String(255), nullable=False)
    email       = Column(String(255), unique=True, nullable=False)
    address     = Column(Text)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, server_default=func.now())
    users = relationship("User", back_populates="hospital", cascade="all, delete")


class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    hospital_id   = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"))
    username      = Column(String(100), unique=True, nullable=False)
    email         = Column(String(255), unique=True)
    password_hash = Column(Text, nullable=False)
    role          = Column(String(20), CheckConstraint("role IN ('admin','doctor','staff')"), nullable=False)
    full_name     = Column(String(255))
    status        = Column(Boolean, default=True)
    last_login    = Column(DateTime)
    created_at    = Column(DateTime, server_default=func.now())
    hospital      = relationship("Hospital", back_populates="users")
    audit_logs    = relationship("AuditLog", back_populates="user")
    suggestions      = relationship("DoctorSuggestion", back_populates="doctor")
    prescriptions    = relationship("Prescription", back_populates="doctor")
    reports          = relationship("PatientReport", back_populates="uploader")
    vitals_recorded  = relationship("PatientVitals", back_populates="recorder")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action     = Column(Text, nullable=False)
    details    = Column(JSONB)
    ip_address = Column(String(45))
    timestamp  = Column(DateTime, server_default=func.now())
    user       = relationship("User", back_populates="audit_logs")


class PatientMaster(Base):
    __tablename__ = "patient_master"
    id                 = Column(Integer, primary_key=True, index=True)
    abha_id            = Column(String(12), unique=True, nullable=False)
    aadhaar            = Column(String(12), unique=True)
    name               = Column(String(255), nullable=False)
    age                = Column(Integer)
    gender             = Column(String(10))
    blood_group        = Column(String(5))
    allergies          = Column(Text)
    chronic_conditions = Column(Text)
    emergency_contact  = Column(String(255))
    emergency_phone    = Column(String(15))
    current_medicines  = Column(Text)
    risk_level         = Column(String(10), CheckConstraint("risk_level IN ('Low','Medium','High')"), default="Low")
    created_at         = Column(DateTime, server_default=func.now())
    suggestions        = relationship("DoctorSuggestion", back_populates="patient", cascade="all, delete")
    prescriptions      = relationship("Prescription", back_populates="patient", cascade="all, delete")
    reports            = relationship("PatientReport", back_populates="patient", cascade="all, delete")
    vitals             = relationship("PatientVitals", back_populates="patient", cascade="all, delete")


class DoctorSuggestion(Base):
    __tablename__ = "doctor_suggestions"
    id            = Column(Integer, primary_key=True, index=True)
    doctor_id     = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    patient_id    = Column(Integer, ForeignKey("patient_master.id", ondelete="CASCADE"))
    notes         = Column(Text, nullable=False)
    risk_level    = Column(String(10), CheckConstraint("risk_level IN ('Low','Medium','High')"), default="Low")
    followup_date = Column(Date)
    created_at    = Column(DateTime, server_default=func.now())
    doctor  = relationship("User", back_populates="suggestions")
    patient = relationship("PatientMaster", back_populates="suggestions")


class Prescription(Base):
    __tablename__ = "prescriptions"
    id            = Column(Integer, primary_key=True, index=True)
    doctor_id     = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    patient_id    = Column(Integer, ForeignKey("patient_master.id", ondelete="CASCADE"))
    medicine_name = Column(String(255), nullable=False)
    dosage        = Column(String(100))
    frequency     = Column(String(100))
    duration      = Column(String(100))
    created_at    = Column(DateTime, server_default=func.now())
    doctor  = relationship("User", back_populates="prescriptions")
    patient = relationship("PatientMaster", back_populates="prescriptions")


class PatientReport(Base):
    __tablename__ = "patient_reports"
    id          = Column(Integer, primary_key=True, index=True)
    patient_id  = Column(Integer, ForeignKey("patient_master.id", ondelete="CASCADE"))
    category    = Column(String(50), CheckConstraint("category IN ('Lab Report','Radiology','Prescription','Emergency','Nursing Report','Daily Monitoring','Emergency Observation')"), nullable=False)
    file_name   = Column(String(255), nullable=False)
    file_path   = Column(Text, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    upload_date = Column(DateTime, server_default=func.now())
    patient  = relationship("PatientMaster", back_populates="reports")
    uploader = relationship("User", back_populates="reports")


class PatientVitals(Base):
    __tablename__ = "patient_vitals"
    id            = Column(Integer, primary_key=True, index=True)
    patient_id    = Column(Integer, ForeignKey("patient_master.id", ondelete="CASCADE"))
    systolic      = Column(Integer)
    diastolic     = Column(Integer)
    sugar_fasting = Column(Integer)
    sugar_random  = Column(Integer)
    temperature   = Column(Integer)
    recorded_by   = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at    = Column(DateTime, server_default=func.now())
    patient  = relationship("PatientMaster", back_populates="vitals")
    recorder = relationship("User", back_populates="vitals_recorded")
