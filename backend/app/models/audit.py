from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime, timezone
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    actor_email = Column(String, nullable=False)
    actor_name = Column(String, nullable=False)
    actor_role = Column(String, nullable=False)
    action = Column(String, nullable=False) # e.g. "PATIENT_TRIAGED", "BED_ALLOCATED", "RESOURCE_RESTOCKED"
    entity_type = Column(String, nullable=False) # "Patient", "Staff", "Resource", "AI_Inference"
    entity_id = Column(String, nullable=True)
    details = Column(JSON, default=dict)

