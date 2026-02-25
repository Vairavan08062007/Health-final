from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class PatientVitals(Base):
    __tablename__ = "patient_vitals"
    id            = Column(Integer, primary_key=True, index=True)
    patient_id    = Column(Integer, ForeignKey("patient_master.id", ondelete="CASCADE"))
    systolic      = Column(Integer)
    diastolic     = Column(Integer)
    sugar_fasting = Column(Float)
    sugar_random  = Column(Float)
    temperature   = Column(Float)
    recorded_by   = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at    = Column(DateTime, server_default=func.now())

    patient  = relationship("PatientMaster", back_populates="vitals")
    recorder = relationship("User", back_populates="vitals_recorded")
