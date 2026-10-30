from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.models.staff import Staff
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.staff import StaffCreate, StaffUpdate, StaffResponse
from app.core.dependencies import get_current_user, require_role

router = APIRouter(prefix="/staff", tags=["Staff Management"])

# ============================================================================
# Real-Time WebSocket Connection Manager
# Broadcasts live roster & attendance updates across all connected browser tabs
# ============================================================================
class StaffConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        disconnected: List[WebSocket] = []
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

staff_ws_manager = StaffConnectionManager()

@router.websocket("/ws")
async def staff_websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time staff roster sync.
    Broadcasts attendance toggles and workload shifts across all active sessions.
    """
    await staff_ws_manager.connect(websocket)
    try:
        while True:
            # Keep-alive heartbeat / ping-pong
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        staff_ws_manager.disconnect(websocket)
    except Exception:
        staff_ws_manager.disconnect(websocket)

# ============================================================================
# REST Endpoints with Role-Based Salary Visibility
# ============================================================================

@router.get("", response_model=List[StaffResponse])
def get_staff_members(
    department: Optional[str] = None,
    role: Optional[str] = None,
    attendance: Optional[str] = None,
    availability: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Staff)
    
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Staff.name.ilike(search_fmt)) |
            (Staff.staff_id.ilike(search_fmt)) |
            (Staff.qualification.ilike(search_fmt))
        )
    if department and department != "All":
        query = query.filter(Staff.department == department)
    if role and role != "All":
        query = query.filter(Staff.role == role)
    if attendance and attendance != "All":
        query = query.filter(Staff.attendance == attendance)
    if availability and availability != "All":
        query = query.filter(Staff.availability == availability)

    staff_list = query.order_by(Staff.id.asc()).offset(skip).limit(limit).all()

    # Role-based visibility: hide salary from non-admin users
    is_admin = current_user.role.lower() == "admin"
    results: List[StaffResponse] = []
    for s in staff_list:
        data = StaffResponse.model_validate(s)
        if not is_admin:
            data.salary = None
        results.append(data)

    return results

@router.get("/{staff_id}", response_model=StaffResponse)
def get_staff(
    staff_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    staff = db.query(Staff).filter(
        (Staff.staff_id == staff_id) | (Staff.id == int(staff_id) if staff_id.isdigit() else False)
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail=f"Staff member '{staff_id}' not found")

    data = StaffResponse.model_validate(staff)
    if current_user.role.lower() != "admin":
        data.salary = None
    return data

@router.post("", response_model=StaffResponse)
async def create_staff(
    staff_in: StaffCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    sid = staff_in.staff_id
    if not sid:
        count = db.query(Staff).count()
        sid = f"ST-{200 + count + 1}"

    staff = Staff(
        staff_id=sid,
        name=staff_in.name,
        department=staff_in.department,
        role=staff_in.role,
        salary=staff_in.salary or 75000.0,
        attendance=staff_in.attendance,
        attendance_percentage=staff_in.attendance_percentage,
        availability=staff_in.availability,
        shift=staff_in.shift,
        current_patient_load=staff_in.current_patient_load,
        email=staff_in.email,
        phone=staff_in.phone,
        qualification=staff_in.qualification
    )
    db.add(staff)
    
    audit = AuditLog(
        actor_email=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="STAFF_REGISTERED",
        entity_type="Staff",
        entity_id=sid,
        details={"name": staff.name, "role": staff.role, "department": staff.department}
    )
    db.add(audit)

    db.commit()
    db.refresh(staff)

    # Real-time WebSocket broadcast
    await staff_ws_manager.broadcast({
        "event": "STAFF_CREATED",
        "staff_id": staff.staff_id,
        "staff": StaffResponse.model_validate(staff).model_dump()
    })

    return StaffResponse.model_validate(staff)

@router.put("/{staff_id}", response_model=StaffResponse)
async def update_staff(
    staff_id: str,
    staff_update: StaffUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    staff = db.query(Staff).filter(
        (Staff.staff_id == staff_id) | (Staff.id == int(staff_id) if staff_id.isdigit() else False)
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail=f"Staff member '{staff_id}' not found")

    update_data = staff_update.model_dump(exclude_unset=True)

    # Prevent non-admin from modifying salary
    if "salary" in update_data and current_user.role.lower() != "admin":
        del update_data["salary"]

    for field, value in update_data.items():
        setattr(staff, field, value)

    audit = AuditLog(
        actor_email=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="STAFF_UPDATED",
        entity_type="Staff",
        entity_id=staff.staff_id,
        details=update_data
    )
    db.add(audit)

    db.commit()
    db.refresh(staff)

    # Real-time WebSocket broadcast
    staff_payload = StaffResponse.model_validate(staff).model_dump()
    if current_user.role.lower() != "admin":
        staff_payload["salary"] = None

    await staff_ws_manager.broadcast({
        "event": "STAFF_UPDATED",
        "staff_id": staff.staff_id,
        "staff": staff_payload
    })

    data = StaffResponse.model_validate(staff)
    if current_user.role.lower() != "admin":
        data.salary = None
    return data

@router.post("/{staff_id}/toggle-attendance", response_model=StaffResponse)
async def toggle_staff_attendance(
    staff_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Toggles staff attendance between 'Present' and 'Off Duty',
    adjusting availability and broadcasting in real time to all connected tabs.
    """
    staff = db.query(Staff).filter(
        (Staff.staff_id == staff_id) | (Staff.id == int(staff_id) if staff_id.isdigit() else False)
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail=f"Staff member '{staff_id}' not found")

    if staff.attendance == "Present":
        staff.attendance = "Off Duty"
        staff.availability = "Busy"
    else:
        staff.attendance = "Present"
        staff.availability = "Available"

    audit = AuditLog(
        actor_email=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="STAFF_ATTENDANCE_TOGGLED",
        entity_type="Staff",
        entity_id=staff.staff_id,
        details={
            "name": staff.name,
            "attendance": staff.attendance,
            "availability": staff.availability,
            "attendance_percentage": staff.attendance_percentage
        }
    )
    db.add(audit)

    db.commit()
    db.refresh(staff)

    # Real-time WebSocket broadcast across open tabs
    staff_payload = StaffResponse.model_validate(staff).model_dump()
    if current_user.role.lower() != "admin":
        staff_payload["salary"] = None

    await staff_ws_manager.broadcast({
        "event": "STAFF_ATTENDANCE_UPDATED",
        "staff_id": staff.staff_id,
        "attendance": staff.attendance,
        "availability": staff.availability,
        "attendance_percentage": staff.attendance_percentage,
        "staff": staff_payload
    })

    data = StaffResponse.model_validate(staff)
    if current_user.role.lower() != "admin":
        data.salary = None
    return data

@router.delete("/{staff_id}")
async def delete_staff(
    staff_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    staff = db.query(Staff).filter(
        (Staff.staff_id == staff_id) | (Staff.id == int(staff_id) if staff_id.isdigit() else False)
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail=f"Staff member '{staff_id}' not found")

    audit = AuditLog(
        actor_email=current_user.email,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="STAFF_DELETED",
        entity_type="Staff",
        entity_id=staff.staff_id,
        details={"name": staff.name, "role": staff.role, "department": staff.department}
    )
    db.add(audit)

    db.delete(staff)
    db.commit()

    # Real-time WebSocket broadcast
    await staff_ws_manager.broadcast({
        "event": "STAFF_DELETED",
        "staff_id": staff_id
    })

    return {"message": f"Staff member '{staff_id}' successfully removed", "deleted": True}
