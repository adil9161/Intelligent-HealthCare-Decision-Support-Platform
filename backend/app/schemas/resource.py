from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ResourceBase(BaseModel):
    name: str
    category: str # Beds, Oxygen, Medicines, Equipment
    department: str
    total_capacity: float = Field(..., gt=0)
    available_units: float = Field(..., ge=0)
    occupied_units: float = Field(0.0, ge=0)
    unit_measure: str = "units"
    burn_rate_per_hour: float = Field(0.0, ge=0)
    min_safety_threshold: float = Field(10.0, ge=0)
    status: str = "Normal" # Normal, Warning, Critical
    notes: Optional[str] = None

class ResourceCreate(ResourceBase):
    resource_id: Optional[str] = None

class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None
    total_capacity: Optional[float] = None
    available_units: Optional[float] = None
    occupied_units: Optional[float] = None
    unit_measure: Optional[str] = None
    burn_rate_per_hour: Optional[float] = None
    min_safety_threshold: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class ThresholdUpdateRequest(BaseModel):
    min_safety_threshold: Optional[float] = None
    reorder_threshold: Optional[float] = None
    notes: Optional[str] = "Threshold updated by Hospital Administrator"

class RestockRequest(BaseModel):
    units_to_add: Optional[float] = None
    units: Optional[float] = None
    notes: Optional[str] = "Emergency / Scheduled restock"

class SurgeSimulationRequest(BaseModel):
    scenario_type: str = "MASS_CASUALTY_INCIDENT" # "MASS_CASUALTY_INCIDENT", "PANDEMIC_SURGE", "POWER_OUTAGE_OXYGEN_RUN"
    additional_trauma_patients: int = Field(15, ge=1, le=100)
    additional_icu_need: int = Field(5, ge=1, le=50)

class ResourceResponse(ResourceBase):
    id: int
    resource_id: str
    daily_usage_rate: float = 0.0
    reorder_threshold: float = 10.0
    predicted_exhaustion_hours: Optional[float] = None
    occupancy_percentage: float = 0.0
    availability_percentage: float = 0.0
    is_critical_shortage: bool = False
    predictive_alerts: Optional[list] = None
    historical_usage: Optional[list] = None
    last_restocked: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

