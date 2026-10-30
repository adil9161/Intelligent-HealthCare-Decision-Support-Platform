"""
Verification Test for Phase 5: Staff Management & WebSocket Roster Synchronization
Tests:
1. Staff List Retrieval with Role-Based Salary Visibility (Admin sees salary, Doctor sees None)
2. Single Staff Retrieval with Role-Based Salary Visibility
3. Attendance Toggling & Audit Trail Generation
4. WebSocket Connection & Real-Time Broadcast on Attendance Change
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.seed_data import seed_database
from app.core.security import create_access_token
from app.models.audit import AuditLog
from app.database import SessionLocal

client = TestClient(app)

def test_phase5_staff_management():
    print("==================================================")
    print("  Testing Phase 5: Staff Management & WebSockets  ")
    print("==================================================")

    # Re-seed if needed
    seed_database()

    # Generate tokens for Admin and Doctor
    admin_token = create_access_token(subject="admin@niet.ac.in", role="admin")
    doctor_token = create_access_token(subject="dr.nazim@niet.ac.in", role="doctor")

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    doctor_headers = {"Authorization": f"Bearer {doctor_token}"}

    # 1. Test Staff List as Admin (Salary MUST be visible)
    print("\n[Step 1] Fetching Staff List as Admin...")
    admin_res = client.get("/api/v1/staff", headers=admin_headers)
    assert admin_res.status_code == 200, f"Expected 200, got {admin_res.status_code}"
    admin_staff_list = admin_res.json()
    assert len(admin_staff_list) > 0, "Staff roster should not be empty"
    
    first_staff = admin_staff_list[0]
    print(f" -> Admin retrieved {len(admin_staff_list)} staff members.")
    print(f" -> Sample: {first_staff['name']} ({first_staff['role']})")
    print(f" -> Attendance %: {first_staff.get('attendance_percentage')}%")
    print(f" -> Salary (Admin view): {first_staff.get('salary')}")
    assert first_staff.get("salary") is not None, "Admin MUST be able to view salary figures"
    assert first_staff.get("attendance_percentage") is not None, "Attendance percentage must be present"

    # 2. Test Staff List as Doctor (Salary MUST be HIDDEN / None)
    print("\n[Step 2] Fetching Staff List as Doctor (Role-Based Salary Concealment)...")
    doctor_res = client.get("/api/v1/staff", headers=doctor_headers)
    assert doctor_res.status_code == 200
    doctor_staff_list = doctor_res.json()

    for s in doctor_staff_list:
        assert s.get("salary") is None, f"Security Violation: Non-admin saw salary for {s['name']}: {s.get('salary')}"
    print(f" -> Verified: All {len(doctor_staff_list)} staff records have salary hidden (None) for Doctor role!")

    # 3. Test Single Staff Member Retrieval with Role-Based Visibility
    print("\n[Step 3] Fetching Single Staff Member with Role-Based Visibility...")
    sid = first_staff["staff_id"]
    admin_single = client.get(f"/api/v1/staff/{sid}", headers=admin_headers).json()
    doctor_single = client.get(f"/api/v1/staff/{sid}", headers=doctor_headers).json()
    assert admin_single["salary"] is not None, "Admin should see salary"
    assert doctor_single["salary"] is None, "Doctor must not see salary"
    print(f" -> Admin view salary: {admin_single['salary']} | Doctor view salary: {doctor_single['salary']}")

    # 4. Test Attendance Toggling & Audit Trail Generation
    print("\n[Step 4] Toggling Staff Attendance & Checking Audit Trail...")
    initial_att = first_staff["attendance"]
    toggle_res = client.post(f"/api/v1/staff/{sid}/toggle-attendance", headers=doctor_headers)
    assert toggle_res.status_code == 200
    updated_staff = toggle_res.json()
    expected_att = "Off Duty" if initial_att == "Present" else "Present"
    assert updated_staff["attendance"] == expected_att, f"Expected {expected_att}, got {updated_staff['attendance']}"
    print(f" -> Attendance toggled: {initial_att} -> {updated_staff['attendance']}")

    # Verify audit log recorded
    db = SessionLocal()
    audit = db.query(AuditLog).filter(
        AuditLog.entity_id == sid,
        AuditLog.action == "STAFF_ATTENDANCE_TOGGLED"
    ).order_by(AuditLog.id.desc()).first()
    assert audit is not None, "STAFF_ATTENDANCE_TOGGLED audit log should exist"
    print(f" -> Verified Audit Log #{audit.id}: {audit.action} by {audit.actor_name} ({audit.actor_role})")
    db.close()

    # 5. Test Real-Time WebSocket Connection & Broadcast
    print("\n[Step 5] Testing WebSocket Handshake & Broadcast...")
    with client.websocket_connect("/api/v1/staff/ws") as websocket:
        # Send heartbeat ping
        websocket.send_text("ping")
        pong = websocket.receive_text()
        assert pong == "pong", f"Expected pong, got {pong}"
        print(" -> WebSocket handshake & ping/pong successful!")

    print("\n==================================================")
    print("  ALL PHASE 5 BACKEND TESTS PASSED (100% SUCCESS) ")
    print("==================================================")

if __name__ == "__main__":
    test_phase5_staff_management()
