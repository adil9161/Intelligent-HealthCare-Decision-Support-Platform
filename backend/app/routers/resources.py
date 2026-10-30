from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from app.database import get_db
from app.models.resource import Resource
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.resource import (
    ResourceCreate,
    ResourceUpdate,
    ResourceResponse,
    RestockRequest,
    SurgeSimulationRequest,
    ThresholdUpdateRequest,
)
from app.core.dependencies import get_current_user, require_role
from app.ai_engine.predictive_resources import PredictiveResourceEngine

router = APIRouter(prefix="/resources", tags=["Resource Management"])

def _enrich_resource_response(res: Resource) -> Dict[str, Any]:
    """Helper to evaluate real-time shortage rules and return response dict."""
    res_dict = {
        "id": res.id,
        "resource_id": res.resource_id,
        "name": res.name,
        "category": res.category,
        "department": res.department,
        "total_capacity": res.total_capacity,
        "available_units": res.available_units,
        "occupied_units": res.occupied_units,
        "unit_measure": res.unit_measure,
        "burn_rate_per_hour": res.burn_rate_per_hour,
        "min_safety_threshold": res.min_safety_threshold,
        "last_restocked": res.last_restocked,
        "notes": res.notes,
        "created_at": res.created_at,
        "updated_at": res.updated_at,
    }
    
    predictive = PredictiveResourceEngine.evaluate_resource_status(res_dict)
    res_dict["status"] = predictive["status"]
    res_dict["occupancy_percentage"] = predictive["occupancy_percentage"]
    res_dict["availability_percentage"] = predictive["availability_percentage"]
    res_dict["predicted_exhaustion_hours"] = predictive["predicted_exhaustion_hours"]
    res_dict["daily_usage_rate"] = predictive["daily_usage_rate"]
    res_dict["reorder_threshold"] = predictive["reorder_threshold"]
    res_dict["is_critical_shortage"] = predictive["is_critical_shortage"]
    res_dict["predictive_alerts"] = predictive["alerts"]
    res_dict["historical_usage"] = predictive["historical_usage"]
    return res_dict

@router.get("", response_model=List[ResourceResponse])
def get_resources(
    category: Optional[str] = None,
    department: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Resource)
    if category and category != "All":
        query = query.filter(Resource.category == category)
    if department and department != "All":
        query = query.filter(Resource.department == department)

    raw_resources = query.order_by(Resource.category.asc(), Resource.id.asc()).all()
    results = [_enrich_resource_response(r) for r in raw_resources]

    if status_filter and status_filter != "All":
        results = [r for r in results if r["status"].lower() == status_filter.lower()]

    return results

@router.get("/summary")
def get_resource_summary(db: Session = Depends(get_db)):
    """High-level KPI dashboard metrics for hospital resources."""
    resources = db.query(Resource).all()
    enriched = [_enrich_resource_response(r) for r in resources]

    # Beds KPI
    bed_items = [r for r in enriched if r["category"] == "Beds"]
    total_beds = sum(b["total_capacity"] for b in bed_items)
    avail_beds = sum(b["available_units"] for b in bed_items)
    bed_avail_pct = round((avail_beds / total_beds) * 100.0, 1) if total_beds > 0 else 0.0
    bed_shortage_critical = bed_avail_pct < 10.0 # Rule: < 10% capacity alert!

    # Oxygen KPI
    o2_items = [r for r in enriched if r["category"] == "Oxygen"]
    total_o2 = sum(o["available_units"] for o in o2_items)
    total_burn = sum(o["burn_rate_per_hour"] for o in o2_items)
    o2_hours_remaining = round(total_o2 / total_burn, 1) if total_burn > 0 else None

    # Critical Alerts Collection sorted by severity
    all_alerts = []
    for r in enriched:
        for alert in r.get("predictive_alerts", []):
            all_alerts.append({
                "resource_name": r["name"],
                "resource_id": r["resource_id"],
                "category": r["category"],
                **alert
            })

    # Strict sorting: CRITICAL first, then WARNING
    severity_order = {"CRITICAL": 0, "WARNING": 1, "NORMAL": 2}
    all_alerts.sort(key=lambda a: severity_order.get(a.get("severity", "WARNING"), 9))

    # Medicine shortage count
    med_alerts = [r for r in enriched if r["category"] == "Medicines" and r["status"] == "Critical"]
    
    # Equipment saturation count
    eq_alerts = [r for r in enriched if r["category"] == "Equipment" and r["status"] == "Critical"]

    return {
        "beds": {
            "total_capacity": total_beds,
            "available_units": avail_beds,
            "occupied_units": total_beds - avail_beds,
            "availability_percentage": bed_avail_pct,
            "is_critical_shortage": bed_shortage_critical,
            "status": "Critical" if bed_shortage_critical else ("Warning" if bed_avail_pct < 20.0 else "Normal")
        },
        "oxygen": {
            "available_liters": total_o2,
            "total_burn_rate_lph": total_burn,
            "hours_remaining": o2_hours_remaining,
            "status": "Critical" if (o2_hours_remaining and o2_hours_remaining <= 12.0) else "Normal"
        },
        "critical_alerts_count": len(all_alerts),
        "critical_medicines_count": len(med_alerts),
        "saturated_equipment_count": len(eq_alerts),
        "alerts": all_alerts
    }

@router.post("", response_model=ResourceResponse)
def create_resource(
    res_in: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    rid = res_in.resource_id
    if not rid:
        prefix = res_in.category[:3].upper()
        count = db.query(Resource).filter(Resource.category == res_in.category).count()
        rid = f"RES-{prefix}-{100 + count + 1}"

    occupied = max(0.0, res_in.total_capacity - res_in.available_units)
    res = Resource(
        resource_id=rid,
        name=res_in.name,
        category=res_in.category,
        department=res_in.department,
        total_capacity=res_in.total_capacity,
        available_units=res_in.available_units,
        occupied_units=occupied,
        unit_measure=res_in.unit_measure,
        burn_rate_per_hour=res_in.burn_rate_per_hour,
        min_safety_threshold=res_in.min_safety_threshold,
        status=res_in.status,
        notes=res_in.notes
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    return _enrich_resource_response(res)

@router.put("/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: str,
    res_update: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = db.query(Resource).filter(
        (Resource.resource_id == resource_id) | (Resource.id == int(resource_id) if resource_id.isdigit() else False)
    ).first()
    if not res:
        raise HTTPException(status_code=404, detail=f"Resource '{resource_id}' not found")

    update_data = res_update.model_dump(exclude_unset=True)

    # Thresholds are strictly editable by admins only
    if "min_safety_threshold" in update_data:
        if current_user.role.lower() != "admin":
            raise HTTPException(
                status_code=403,
                detail="Security Governance: Reorder thresholds are strictly editable by Hospital Administrators (Admin Role) only."
            )

    for k, v in update_data.items():
        setattr(res, k, v)

    # Recalculate occupied units if available_units or total_capacity changed
    if "available_units" in update_data or "total_capacity" in update_data:
        res.occupied_units = max(0.0, res.total_capacity - res.available_units)

    db.commit()
    db.refresh(res)
    return _enrich_resource_response(res)

@router.put("/{resource_id}/threshold", response_model=ResourceResponse)
def update_resource_threshold(
    resource_id: str,
    threshold_in: ThresholdUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Admin-only endpoint to modify safety reorder thresholds and immediately recalculate prediction."""
    res = db.query(Resource).filter(
        (Resource.resource_id == resource_id) | (Resource.id == int(resource_id) if resource_id.isdigit() else False)
    ).first()
    if not res:
        raise HTTPException(status_code=404, detail=f"Resource '{resource_id}' not found")

    old_threshold = res.min_safety_threshold
    new_val = threshold_in.reorder_threshold if threshold_in.reorder_threshold is not None else threshold_in.min_safety_threshold
    if new_val is None:
        raise HTTPException(status_code=400, detail="Must provide min_safety_threshold or reorder_threshold")
    res.min_safety_threshold = new_val
    if threshold_in.notes:
        res.notes = f"{res.notes or ''}\n[Threshold {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}] Modified from {old_threshold} to {new_val} by {current_user.full_name}".strip()

    audit = AuditLog(
        actor_email=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="RESOURCE_THRESHOLD_MODIFIED",
        entity_type="Resource",
        entity_id=res.resource_id,
        details={
            "old_threshold": old_threshold,
            "new_threshold": res.min_safety_threshold,
            "resource_name": res.name
        }
    )
    db.add(audit)

    db.commit()
    db.refresh(res)
    return _enrich_resource_response(res)

@router.post("/{resource_id}/restock", response_model=ResourceResponse)
def restock_resource(
    resource_id: str,
    restock: RestockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = db.query(Resource).filter(
        (Resource.resource_id == resource_id) | (Resource.id == int(resource_id) if resource_id.isdigit() else False)
    ).first()
    if not res:
        raise HTTPException(status_code=404, detail=f"Resource '{resource_id}' not found")

    units_delta = restock.units_to_add if restock.units_to_add is not None else restock.units
    if units_delta is None or units_delta <= 0:
        raise HTTPException(status_code=400, detail="Must provide units_to_add or units greater than 0")

    res.available_units = min(res.total_capacity, res.available_units + units_delta)
    res.occupied_units = max(0.0, res.total_capacity - res.available_units)
    res.last_restocked = datetime.now(timezone.utc)
    if restock.notes:
        res.notes = f"{res.notes or ''}\n[Restock {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}] Added {units_delta} {res.unit_measure}: {restock.notes}".strip()

    audit = AuditLog(
        actor_email=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="RESOURCE_RESTOCKED",
        entity_type="Resource",
        entity_id=res.resource_id,
        details={"units_added": units_delta, "new_available": res.available_units}
    )
    db.add(audit)

    db.commit()
    db.refresh(res)
    return _enrich_resource_response(res)

@router.post("/simulate-surge")
def simulate_surge_scenario(
    req: SurgeSimulationRequest,
    db: Session = Depends(get_db)
):
    """
    Simulates a Mass Casualty Incident (MCI) or Pandemic Influx on hospital resources.
    Evaluates stress-test response and displays shortage forecasting.
    """
    resources = db.query(Resource).all()
    simulated_impact = []
    triggered_shortages = []

    for r in resources:
        orig_avail = r.available_units
        sim_avail = orig_avail

        if r.category == "Beds":
            if "Trauma" in r.name or "Emergency" in r.name:
                sim_avail = max(0.0, orig_avail - req.additional_trauma_patients)
            elif "ICU" in r.name:
                sim_avail = max(0.0, orig_avail - req.additional_icu_need)
            else:
                sim_avail = max(0.0, orig_avail - (req.additional_trauma_patients // 3))
        elif r.category == "Oxygen":
            # Higher oxygen burn rate during surge (+40%)
            extra_burn = req.additional_icu_need * 15.0 # 15 L/hr per ICU patient
            sim_burn = r.burn_rate_per_hour + extra_burn
            sim_hours = round(sim_avail / sim_burn, 1) if sim_burn > 0 else 0
            if sim_hours < 12.0:
                triggered_shortages.append(f"Oxygen supply critically drops to {sim_hours} hours remaining under surge load!")

        sim_avail_pct = round((sim_avail / r.total_capacity) * 100.0, 1) if r.total_capacity > 0 else 0.0

        if r.category == "Beds" and sim_avail_pct < 10.0:
            triggered_shortages.append(f"CRITICAL SHORTAGE: {r.name} capacity plunges to {sim_avail:.0f} beds ({sim_avail_pct}%). Breaches <10% minimum safety reserve!")

        simulated_impact.append({
            "resource_id": r.resource_id,
            "name": r.name,
            "category": r.category,
            "original_available": orig_avail,
            "simulated_available": sim_avail,
            "simulated_availability_percentage": sim_avail_pct,
            "will_breach_threshold": sim_avail_pct < 10.0 if r.category == "Beds" else (sim_avail <= r.min_safety_threshold)
        })

    return {
        "scenario": req.scenario_type,
        "parameters": {
            "additional_trauma_patients": req.additional_trauma_patients,
            "additional_icu_need": req.additional_icu_need
        },
        "critical_shortages_forecasted": len(triggered_shortages),
        "triggered_shortages": triggered_shortages,
        "resource_impacts": simulated_impact,
        "ai_recommendations": [
            "Activate Level 2 Code Amber Surge Diversion protocol for non-emergency walk-ins.",
            "Expedite discharge or step-down transfer for 6 stable ward patients to open beds.",
            "Request urgent bulk liquid medical oxygen delivery tanker within 6 hours.",
            "Recall on-call surgical trauma team and 4 night-shift nurses."
        ]
    }

