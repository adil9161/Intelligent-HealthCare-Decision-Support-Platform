from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class StaffBase(BaseModel):
    name: str = Field(..., min_length=2)
    department: str
    role: str = "Doctor" # Doctor, Nurse, Surgeon, Radiologist, Technician, Administrator
    salary: Optional[float] = Field(75000.0, ge=0)
    attendance: str = "Present" # Present, On Leave, In Surgery, On Call, Off Duty
    attendance_percentage: float = Field(95.0, ge=0.0, le=100.0)
    availability: str = "Available" # Available, Busy, On Break
    shift: str = "Morning" # Morning, Evening, Night
    current_patient_load: int = Field(0, ge=0)
    email: Optional[str] = None
    phone: Optional[str] = None
    qualification: Optional[str] = None

class StaffCreate(StaffBase):
    staff_id: Optional[str] = None

class StaffUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    salary: Optional[float] = None
    attendance: Optional[str] = None
    attendance_percentage: Optional[float] = None
    availability: Optional[str] = None
    shift: Optional[str] = None
    current_patient_load: Optional[int] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    qualification: Optional[str] = None

class StaffResponse(BaseModel):
    id: int
    staff_id: str
    name: str
    department: str
    role: str
    salary: Optional[float] = None # Masked/hidden for non-admin users
    attendance: str
    attendance_percentage: float
    availability: str
    shift: str
    current_patient_load: int
    email: Optional[str] = None
    phone: Optional[str] = None
    qualification: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

