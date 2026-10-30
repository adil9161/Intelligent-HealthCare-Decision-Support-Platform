from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class PatientBase(BaseModel):
    name: str = Field(..., min_length=2)
    age: int = Field(..., ge=0, le=120)
    gender: str = "Other"
    contact: Optional[str] = None
    symptoms: List[str] = Field(default_factory=list)
    severity: float = Field(5.0, ge=1.0, le=10.0)
    urgency: str = "Urgent" # Emergency, Urgent, Semi-Urgent, Non-Urgent
    disease: Optional[str] = "Under Evaluation"
    assigned_department: str = "Emergency"
    status: str = "Waiting" # Waiting, Triage Evaluated, In Consultation, Admitted, Transferred, Discharged
    bed_number: Optional[str] = None
    assigned_doctor: Optional[str] = None
    vitals: Dict[str, Any] = Field(default_factory=dict)
    triage_notes: Optional[str] = None

class PatientCreate(PatientBase):
    patient_id: Optional[str] = None # Generated automatically if omitted

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    contact: Optional[str] = None
    symptoms: Optional[List[str]] = None
    severity: Optional[float] = None
    urgency: Optional[str] = None
    disease: Optional[str] = None
    assigned_department: Optional[str] = None
    status: Optional[str] = None
    bed_number: Optional[str] = None
    assigned_doctor: Optional[str] = None
    vitals: Optional[Dict[str, Any]] = None
    triage_notes: Optional[str] = None
    ai_recommendation: Optional[Dict[str, Any]] = None

class PatientResponse(PatientBase):
    id: int
    patient_id: str
    ai_recommendation: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

