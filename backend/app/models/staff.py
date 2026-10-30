from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime, timezone
from app.database import Base

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(String, unique=True, index=True, nullable=False) # e.g. "ST-201"
    name = Column(String, nullable=False, index=True)
    department = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False) # "Doctor", "Nurse", "Surgeon", "Radiologist", "Technician", "Administrator"
    salary = Column(Float, nullable=False, default=75000.0) # in standard units (INR)
    attendance = Column(String, nullable=False, default="Present") # "Present", "On Leave", "In Surgery", "On Call", "Off Duty"
    attendance_percentage = Column(Float, nullable=False, default=95.0) # 0.0 to 100.0
    availability = Column(String, nullable=False, default="Available") # "Available", "Busy", "On Break"
    
    # Scheduling & Operations
    shift = Column(String, default="Morning") # "Morning", "Evening", "Night"
    current_patient_load = Column(Integer, default=0)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    qualification = Column(String, nullable=True) # e.g. "MD Cardiology, DM"
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

