import random
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models.patient import Patient
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.core.dependencies import get_current_user, require_role
from app.ai_engine.inference import ClinicalInferenceEngine

router = APIRouter(prefix="/patients", tags=["Patient Management"])

@router.get("", response_model=List[PatientResponse])
def get_patients(
    search: Optional[str] = None,
    department: Optional[str] = None,
    urgency: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Patient)
    
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Patient.name.ilike(search_fmt)) |
            (Patient.patient_id.ilike(search_fmt)) |
            (Patient.disease.ilike(search_fmt))
        )
    if department and department != "All":
        query = query.filter(Patient.assigned_department == department)
    if urgency and urgency != "All":
        query = query.filter(Patient.urgency == urgency)
    if status and status != "All":
        query = query.filter(Patient.status == status)

    return query.order_by(Patient.id.desc()).offset(skip).limit(limit).all()

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(
        (Patient.patient_id == patient_id) | (Patient.id == int(patient_id) if patient_id.isdigit() else False)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found")
    return patient

@router.post("", response_model=PatientResponse)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Auto-generate patient ID if omitted
    pid = patient_in.patient_id
    if not pid:
        count = db.query(Patient).count()
        pid = f"PT-{1000 + count + 1}"

    # Automated decision support evaluation
    ai_result = None
    assigned_dept = patient_in.assigned_department
    if patient_in.symptoms:
        ai_result = ClinicalInferenceEngine.evaluate_triage({
            "name": patient_in.name,
            "age": patient_in.age,
            "gender": patient_in.gender,
            "symptoms": patient_in.symptoms,
            "severity": patient_in.severity,
            "urgency": patient_in.urgency,
            "vitals": patient_in.vitals
        })
        # If user left department as default, suggest AI's top department
        if assigned_dept in ["Emergency", "General Medicine"] and ai_result.get("primary_recommendation"):
            assigned_dept = ai_result["primary_recommendation"]["department"]

    patient = Patient(
        patient_id=pid,
        name=patient_in.name,
        age=patient_in.age,
        gender=patient_in.gender,
        contact=patient_in.contact,
        symptoms=patient_in.symptoms,
        severity=patient_in.severity,
        urgency=patient_in.urgency,
        disease=patient_in.disease or "Under Evaluation",
        assigned_department=assigned_dept,
        status=patient_in.status,
        bed_number=patient_in.bed_number,
        assigned_doctor=patient_in.assigned_doctor,
        vitals=patient_in.vitals,
        triage_notes=patient_in.triage_notes,
        ai_recommendation=ai_result
    )

    db.add(patient)
    
    # Audit log
    audit = AuditLog(
        actor_email=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="PATIENT_ADMITTED",
        entity_type="Patient",
        entity_id=pid,
        details={
            "name": patient.name,
            "assigned_department": assigned_dept,
            "urgency": patient.urgency,
            "severity": patient.severity,
            "warnings_count": len(ai_result.get("warnings", [])) if ai_result else 0
        }
    )
    db.add(audit)

    db.commit()
    db.refresh(patient)
    return patient

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: str,
    patient_update: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(
        (Patient.patient_id == patient_id) | (Patient.id == int(patient_id) if patient_id.isdigit() else False)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found")

    update_data = patient_update.model_dump(exclude_unset=True)
    
    # If symptoms or severity changed and no explicit AI recommendation provided, re-evaluate AI inference
    if ("symptoms" in update_data or "severity" in update_data) and "ai_recommendation" not in update_data:
        syms = update_data.get("symptoms", patient.symptoms)
        sev = update_data.get("severity", patient.severity)
        urg = update_data.get("urgency", patient.urgency)
        vits = update_data.get("vitals", patient.vitals)
        ai_res = ClinicalInferenceEngine.evaluate_triage({
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
            "symptoms": syms,
            "severity": sev,
            "urgency": urg,
            "vitals": vits
        })
        patient.ai_recommendation = ai_res

    for field, value in update_data.items():
        setattr(patient, field, value)

    # Audit log
    audit = AuditLog(
        actor_email=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="PATIENT_UPDATED",
        entity_type="Patient",
        entity_id=patient.patient_id,
        details={"status": patient.status, "department": patient.assigned_department}
    )
    db.add(audit)

    db.commit()
    db.refresh(patient)
    return patient

@router.delete("/{patient_id}")
def delete_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "doctor"]))
):
    patient = db.query(Patient).filter(
        (Patient.patient_id == patient_id) | (Patient.id == int(patient_id) if patient_id.isdigit() else False)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found")

    # Audit log
    audit = AuditLog(
        actor_email=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="PATIENT_DELETED",
        entity_type="Patient",
        entity_id=patient.patient_id,
        details={"name": patient.name, "assigned_department": patient.assigned_department}
    )
    db.add(audit)

    db.delete(patient)
    db.commit()
    return {"message": f"Patient '{patient_id}' successfully removed", "deleted": True}

@router.post("/{patient_id}/triage", response_model=PatientResponse)
def rerun_patient_triage(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Explicitly triggers fresh AI decision support evaluation and attaches passport to patient."""
    patient = db.query(Patient).filter(
        (Patient.patient_id == patient_id) | (Patient.id == int(patient_id) if patient_id.isdigit() else False)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found")

    ai_result = ClinicalInferenceEngine.evaluate_triage({
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "symptoms": patient.symptoms,
        "severity": patient.severity,
        "urgency": patient.urgency,
        "vitals": patient.vitals
    })
    
    patient.ai_recommendation = ai_result
    if ai_result.get("primary_recommendation"):
        patient.assigned_department = ai_result["primary_recommendation"]["department"]

    # Audit log
    audit = AuditLog(
        actor_email=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="PATIENT_TRIAGE_REEVALUATED",
        entity_type="Patient",
        entity_id=patient.patient_id,
        details={
            "assigned_department": patient.assigned_department,
            "decision_score": ai_result.get("primary_recommendation", {}).get("decision_score"),
            "urgency": patient.urgency,
            "warnings_count": len(ai_result.get("warnings", []))
        }
    )
    db.add(audit)
    
    db.commit()
    db.refresh(patient)
    return patient

@router.get("/{patient_id}/audit-logs")
def get_patient_audit_logs(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetches chronological audit trail events specifically associated with this patient."""
    logs = db.query(AuditLog).filter(
        AuditLog.entity_id == patient_id
    ).order_by(AuditLog.id.desc()).limit(25).all()
    return logs

