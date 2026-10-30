from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime, timezone
from app.database import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String, unique=True, index=True, nullable=False) # e.g. "RES-BED-ICU"
    name = Column(String, nullable=False, index=True) # e.g. "ICU Advanced Life-Support Beds"
    category = Column(String, nullable=False, index=True) # "Beds", "Oxygen", "Medicines", "Equipment"
    department = Column(String, nullable=False) # e.g. "Critical Care / ICU"
    
    # Quantities
    total_capacity = Column(Float, nullable=False) # e.g. 100 beds or 5000 Liters
    available_units = Column(Float, nullable=False) # e.g. 8 beds (8% -> Alert!)
    occupied_units = Column(Float, nullable=False, default=0.0)
    unit_measure = Column(String, nullable=False, default="units") # "beds", "liters", "vials", "tablets", "units"
    
    # Predictive & Rule Metrics
    burn_rate_per_hour = Column(Float, default=0.0) # rate of consumption per hour
    min_safety_threshold = Column(Float, default=10.0) # in absolute units or percentage depending on category
    status = Column(String, default="Normal") # "Normal", "Warning", "Critical"
    predicted_exhaustion_hours = Column(Float, nullable=True) # forecasted hours remaining
    
    last_restocked = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

