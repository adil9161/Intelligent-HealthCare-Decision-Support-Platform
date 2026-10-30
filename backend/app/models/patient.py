from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text
from datetime import datetime, timezone
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True, nullable=False) # e.g. "PT-1001"
    name = Column(String, nullable=False, index=True)
    age = Column(Integer, nullable=False)
    gender = Column(String, default="Other")
    contact = Column(String, nullable=True)
    
    # Core Clinical Fields
    symptoms = Column(JSON, nullable=False, default=list) # List of symptom strings
    severity = Column(Float, nullable=False, default=5.0) # Scale 1.0 to 10.0
    urgency = Column(String, nullable=False, default="Urgent") # "Emergency", "Urgent", "Semi-Urgent", "Non-Urgent"
    disease = Column(String, nullable=True, default="Under Evaluation") # Provisional condition
    assigned_department = Column(String, nullable=False, default="Emergency")
    status = Column(String, nullable=False, default="Waiting") # "Waiting", "Triage Evaluated", "In Consultation", "Admitted", "Transferred", "Discharged"
    
    # Operational Allocation
    bed_number = Column(String, nullable=True)
    assigned_doctor = Column(String, nullable=True)
    vitals = Column(JSON, default=dict) # {"bp": "120/80", "heart_rate": 82, "spo2": 98, "temperature": 98.6}
    
    # AI Decision Support Record
    ai_recommendation = Column(JSON, nullable=True) # Full decision passport output
    triage_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

