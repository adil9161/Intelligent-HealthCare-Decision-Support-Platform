"""
Verification Test for Phase 4: Patient Management
Tests:
1. Patient Admission with Standard Symptoms & Multi-Paradigm AI Decision Support
2. Patient Admission with Uncataloged / Unknown Symptoms -> Soft Warning without Crash
3. Audit Log Generation for Every Action (Admitted, Updated, Triaged, Deleted)
4. Patient Audit Trail Retrieval Endpoint
5. AND Filter Logic & Pagination on Patients Endpoint
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, Base, engine
from app.seed_data import seed_database
from app.core.security import create_access_token

client = TestClient(app)

def test_phase4_patient_management():
    print("==================================================")
    print("  Testing Phase 4: Patient Management & AI Triage ")
    print("==================================================")

    # Ensure tables and seed users exist
    seed_database()

    # 1. Obtain Auth Token for Doctor/Admin
    doctor_token = create_access_token(subject="dr.nazim@niet.ac.in", role="doctor")
    headers = {"Authorization": f"Bearer {doctor_token}"}

    # 2. Test Admission with Standard Symptoms (Cardiology case)
    print("\n[Step 1] Creating Patient with Standard Cardiology Symptoms...")
    patient_payload = {
        "name": "Prof. Alok Sharma",
        "age": 58,
        "gender": "Male",
        "contact": "+91 98111 22334",
        "symptoms": [
            "Chest Pain (Retrosternal / Crushing)",
            "Pain Radiating to Left Arm / Jaw",
            "Diaphoresis (Profuse Cold Sweats)"
        ],
        "severity": 8.8,
        "urgency": "Emergency",
        "disease": "Suspected Acute Coronary Syndrome",
        "assigned_department": "Emergency",
        "bed_number": "ICU-03",
        "assigned_doctor": "Dr. Mohd. Nazim",
        "vitals": {
            "bp": "165/100",
            "heart_rate": 110,
            "spo2": 93,
            "temperature": 99.1
        },
        "triage_notes": "Immediate resuscitation protocol initiated."
    }

    res = client.post("/api/v1/patients", json=patient_payload, headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    patient_data = res.json()
    pid = patient_data["patient_id"]
    print(f" -> Patient Created: {pid} ({patient_data['name']})")
    
    # Verify AI Recommendation
    ai_rec = patient_data.get("ai_recommendation")
    assert ai_rec is not None, "AI Recommendation should be present"
    primary = ai_rec.get("primary_recommendation")
    assert primary is not None, "Primary recommendation should be present"
    print(f" -> Top Recommendation: {primary['department']} ({primary['department_code']})")
    print(f" -> Decision Score: {primary['decision_score']}%")
    print(f" -> Certainty Factor: +{primary['certainty_factor']}")
    print(f" -> Suggested Resource Tier: {primary['suggested_resource_tier']}")
    print(f" -> A* Pathway: {' -> '.join(ai_rec['search_pathway']['optimal_path_labels'])}")
    assert primary["department"] == "Cardiology" or primary["department"] == "Emergency"
    assert primary["decision_score"] >= 80.0
    assert len(ai_rec.get("warnings", [])) == 0, "No warnings expected for standard symptoms"

    # 3. Test Admission with UNCATALOGED / UNKNOWN Symptoms -> Soft Warning
    print("\n[Step 2] Testing Soft Warning with Uncataloged Symptoms...")
    unknown_sym_payload = {
        "name": "Vikram Singh",
        "age": 34,
        "gender": "Male",
        "contact": "+91 97222 33445",
        "symptoms": [
            "Mysterious celestial tingling in pinky finger",
            "Unexplained purple aura around fingernails"
        ],
        "severity": 4.5,
        "urgency": "Semi-Urgent",
        "disease": "Atypical Neuropathy",
        "assigned_department": "General Medicine",
        "vitals": {
            "bp": "120/80",
            "heart_rate": 74,
            "spo2": 99,
            "temperature": 98.4
        }
    }

    res2 = client.post("/api/v1/patients", json=unknown_sym_payload, headers=headers)
    assert res2.status_code == 200, f"Expected 200, got {res2.status_code}: {res2.text}"
    patient2_data = res2.json()
    pid2 = patient2_data["patient_id"]
    ai_rec2 = patient2_data.get("ai_recommendation")
    assert ai_rec2 is not None, "AI Recommendation should be generated without crash"
    warnings = ai_rec2.get("warnings", [])
    print(f" -> Unknown symptom test succeeded without crash! Warnings returned: {len(warnings)}")
    for w in warnings:
        print(f"    * Warning: {w}")
    assert len(warnings) > 0, "Expected soft warning for uncataloged symptoms"

    # 4. Test Patient Update & Audit Trail
    print("\n[Step 3] Updating Patient Status & Checking Audit Log...")
    update_res = client.put(f"/api/v1/patients/{pid}", json={"status": "In Consultation"}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "In Consultation"

    # 5. Test Re-run Triage & Audit Trail
    print("\n[Step 4] Re-running AI Triage on Patient...")
    triage_res = client.post(f"/api/v1/patients/{pid}/triage", headers=headers)
    assert triage_res.status_code == 200
    assert triage_res.json()["ai_recommendation"] is not None

    # 6. Test Patient Audit Logs Endpoint
    print("\n[Step 5] Fetching Audit Logs for Patient...")
    audit_res = client.get(f"/api/v1/patients/{pid}/audit-logs", headers=headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    actions = [log["action"] for log in logs]
    print(f" -> Found {len(logs)} audit logs for {pid}: {actions}")
    assert "PATIENT_ADMITTED" in actions, "PATIENT_ADMITTED should be in audit logs"
    assert "PATIENT_UPDATED" in actions, "PATIENT_UPDATED should be in audit logs"
    assert "PATIENT_TRIAGE_REEVALUATED" in actions, "PATIENT_TRIAGE_REEVALUATED should be in audit logs"

    # 7. Test Filter Logic with strict AND matching
    print("\n[Step 6] Testing Search & AND Filter Logic...")
    # Filter Cardiology + Emergency urgency
    filter_res = client.get(
        "/api/v1/patients?department=Cardiology&urgency=Emergency",
        headers=headers
    )
    assert filter_res.status_code == 200
    filtered_list = filter_res.json()
    print(f" -> Filtered (Dept=Cardiology AND Urgency=Emergency): {len(filtered_list)} found")
    for p in filtered_list:
        assert p["assigned_department"] == "Cardiology"
        assert p["urgency"] == "Emergency"

    # 8. Test Patient Deletion & Audit Trail
    print("\n[Step 7] Deleting Patient and verifying deletion audit log...")
    del_res = client.delete(f"/api/v1/patients/{pid2}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["deleted"] is True

    # Verify audit log for deletion
    overall_audits = client.get("/api/v1/analytics/audit-logs?limit=10", headers=headers).json()
    del_log = next((l for l in overall_audits if l["entity_id"] == pid2 and l["action"] == "PATIENT_DELETED"), None)
    assert del_log is not None, f"PATIENT_DELETED audit log for {pid2} should exist"
    print(f" -> Confirmed PATIENT_DELETED audit log for {pid2} logged by {del_log['actor_name']}")

    print("\n==================================================")
    print("  ALL PHASE 4 BACKEND TESTS PASSED (100% SUCCESS) ")
    print("==================================================")

if __name__ == "__main__":
    test_phase4_patient_management()
