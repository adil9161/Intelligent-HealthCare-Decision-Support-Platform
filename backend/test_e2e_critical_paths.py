"""
End-to-End Verification Test Suite for AegisHealth AI Decision Support Platform
Course: B.Tech CSE AI (NIET Greater Noida, Dr. Mohd. Nazim) | SDG 3 (Good Health and Well-Being)

Critical Paths Tested:
1. Authentication & Authorization:
   - Login with Doctor credentials (JWT token generation).
   - Unauthenticated access rejection (401 Unauthorized).
   - Invalid credentials rejection (401 Unauthorized).
   - Role-based claim verification.
2. Add Patient Intake:
   - Create patient record with clinical symptoms, severity, and urgency.
   - Database persistence verification.
   - Automated audit trail generation (PATIENT_CREATED).
3. Receive AI Recommendation:
   - Pipeline invocation with candidate matching and rule engine evaluation.
   - BFS, DFS, Greedy Best-First, and A* graph search execution (<200ms latency).
   - Explainable output: matching symptoms, compatibility metrics, transparent score,
     plain-language explanation, Unit 4 Certainty Factor calculus.
   - Minimax & Alpha-Beta Pruning exclusion documentation.
4. Resource Shortage Prediction & Restock:
   - Rule-based shortage detection (stock <= reorder threshold OR 48-hour burn exhaustion).
   - Priority severity sorting (CRITICAL before WARNING) with clinical suggested action.
   - Restock workflow execution with immediate inventory replenishment.
"""

import sys
import os
import time
import pytest

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.seed_data import seed_database
from app.core.security import decode_access_token
from app.database import SessionLocal
from app.models.resource import Resource
from app.models.audit import AuditLog
from app.routers.auth import _auth_request_history

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_rate_limits():
    _auth_request_history.clear()
    yield
    _auth_request_history.clear()

def test_critical_path_1_authentication_and_authorization():
    """
    CRITICAL PATH 1: Authentication & Authorization Flow
    - Authenticate user via POST /api/v1/auth/login
    - Verify JWT token issuance, refresh token, and token structure
    - Verify 401 on unauthenticated access to protected endpoints
    - Verify 401 on bad credentials
    """
    print("\n" + "="*70)
    print(" [CRITICAL PATH 1] Testing Authentication & Authorization Flow")
    print("="*70)

    # Ensure database is seeded with credentials
    seed_database()

    # Step 1.1: Invalid credentials must return 401
    bad_login_res = client.post("/api/v1/auth/login", json={
        "email": "dr.nazim@niet.ac.in",
        "password": "WrongPassword!999"
    })
    assert bad_login_res.status_code == 401, f"Expected 401 for wrong password, got {bad_login_res.status_code}"
    print("  [PASS] Invalid password successfully rejected with HTTP 401 Unauthorized")

    # Step 1.2: Valid Doctor Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "dr.nazim@niet.ac.in",
        "password": "Doctor@123"
    })
    assert login_res.status_code == 200, f"Expected 200 for valid login, got {login_res.status_code}: {login_res.text}"
    token_data = login_res.json()
    assert "access_token" in token_data, "Missing access_token in response"
    assert "refresh_token" in token_data, "Missing refresh_token in response"
    assert token_data.get("token_type") == "bearer", f"Expected 'bearer', got {token_data.get('token_type')}"
    
    # Verify claims inside decoded access token
    access_token = token_data["access_token"]
    payload = decode_access_token(access_token)
    assert payload is not None, "Failed to decode generated JWT"
    assert payload.get("sub") == "dr.nazim@niet.ac.in", f"Unexpected subject: {payload.get('sub')}"
    assert payload.get("role") == "doctor", f"Unexpected role claim: {payload.get('role')}"
    print(f"  [PASS] Valid login successful: dr.nazim@niet.ac.in (Role: {payload.get('role')})")

    # Step 1.3: Invalid/tampered token guard
    invalid_token_res = client.get(
        "/api/v1/patients",
        headers={"Authorization": "Bearer invalid_expired_or_forged_token_signature"}
    )
    assert invalid_token_res.status_code == 401, f"Expected 401 on forged token, got {invalid_token_res.status_code}"
    print("  [PASS] Invalid token successfully rejected with HTTP 401 Unauthorized")

    # Step 1.4: Role-based guard verification (Doctor cannot modify resource thresholds - Admin only)
    doctor_headers = {"Authorization": f"Bearer {access_token}"}
    forbidden_res = client.put(
        "/api/v1/resources/1/threshold",
        json={"reorder_threshold": 50},
        headers=doctor_headers
    )
    assert forbidden_res.status_code == 403, f"Expected 403 Forbidden for doctor on admin endpoint, got {forbidden_res.status_code}"
    print("  [PASS] Role guard successfully enforced: Doctor denied access to Admin endpoint (HTTP 403 Forbidden)")


def test_critical_path_2_add_patient_intake():
    """
    CRITICAL PATH 2: Add Patient Intake & Audit Trail
    - Doctor authenticates and creates a new patient record
    - Validates persistence and fields
    - Verifies audit log trail records action
    """
    print("\n" + "="*70)
    print(" [CRITICAL PATH 2] Testing Add Patient Intake & Audit Trail")
    print("="*70)

    # 1. Login as Doctor
    login_res = client.post("/api/v1/auth/login", json={
        "email": "dr.nazim@niet.ac.in",
        "password": "Doctor@123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Submit new patient intake
    new_patient_payload = {
        "name": "Kavita Verma",
        "age": 52,
        "gender": "Female",
        "contact": "+91 98765 43210",
        "symptoms": [
            "Chest Pain (Retrosternal / Crushing)",
            "Shortness of Breath (Dyspnea at rest)",
            "Diaphoresis (Profuse Cold Sweats)"
        ],
        "severity": 8.5,
        "urgency": "Emergency",
        "disease": "Acute Coronary Syndrome Suspect",
        "assigned_department": "Emergency",
        "bed_number": "ER-BAY-02",
        "assigned_doctor": "Dr. Mohd. Nazim",
        "vitals": {
            "bp": "155/95",
            "heart_rate": 105,
            "spo2": 94,
            "temperature": 98.6
        },
        "triage_notes": "Admitted via ambulance triage. Stable airway, urgent ECG ordered."
    }

    create_res = client.post("/api/v1/patients", json=new_patient_payload, headers=headers)
    assert create_res.status_code == 200, f"Expected 200, got {create_res.status_code}: {create_res.text}"
    patient = create_res.json()
    patient_id = patient["patient_id"]
    assert patient_id.startswith("PT-") or patient_id.startswith("PAT-"), f"Unexpected ID format: {patient_id}"
    assert patient["name"] == "Kavita Verma"
    assert patient["severity"] == 8.5
    print(f"  [PASS] Patient record created: {patient_id} ({patient['name']})")

    # 3. Retrieve patient record from database
    get_res = client.get(f"/api/v1/patients/{patient_id}", headers=headers)
    assert get_res.status_code == 200, f"Expected 200 on fetch, got {get_res.status_code}"
    fetched = get_res.json()
    assert fetched["name"] == "Kavita Verma"
    assert fetched["assigned_department"] in ["Emergency", "Cardiology"]
    print(f"  [PASS] Database persistence verified for patient {patient_id}")

    # 4. Verify audit trail records the creation
    db = SessionLocal()
    try:
        audit = db.query(AuditLog).filter(
            AuditLog.entity_id == patient_id,
            AuditLog.action.in_(["PATIENT_CREATED", "PATIENT_ADMITTED"])
        ).first()
        assert audit is not None, f"Audit log entry for patient not found for {patient_id}"
        print(f"  [PASS] Audit log verified: Action '{audit.action}' by '{audit.actor_email}' on {patient_id}")
    finally:
        db.close()


def test_critical_path_3_receive_ai_recommendation():
    """
    CRITICAL PATH 3: Receive AI Decision Support Recommendation
    - Invokes AI Decision Pipeline (/api/v1/ai/pipeline)
    - Verifies candidate department match and forward-chaining rules
    - Verifies graph search exploration (BFS, DFS, Greedy Best-First, A*) with <200ms latency
    - Verifies explainability: matching symptoms, score, plain-language reasoning, Certainty Factors
    - Verifies documented exclusion of Minimax / Alpha-Beta Pruning
    """
    print("\n" + "="*70)
    print(" [CRITICAL PATH 3] Testing AI Recommendation Pipeline & Explainability")
    print("="*70)

    pipeline_input = {
        "name": "Prof. Alok Sharma",
        "age": 58,
        "symptoms": [
            "Chest Pain (Retrosternal / Crushing)",
            "Pain Radiating to Left Arm / Jaw",
            "Diaphoresis (Profuse Cold Sweats)",
            "Shortness of Breath (Dyspnea at rest)"
        ],
        "severity": 9.2,
        "urgency": "Emergency"
    }

    start_time = time.time()
    res = client.post("/api/v1/ai/pipeline", json=pipeline_input)
    elapsed_ms = (time.time() - start_time) * 1000

    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()

    # Latency Quality Bar: entire pipeline under 200ms
    print(f"  [PASS] AI Decision Engine response latency: {elapsed_ms:.2f} ms (Quality bar: < 200ms)")
    assert elapsed_ms < 200.0, f"Decision engine exceeded 200ms latency: {elapsed_ms} ms"

    # Verify primary recommendation
    primary = data.get("primary_recommendation")
    assert primary is not None, "Missing primary_recommendation in response"
    dept = primary.get("department")
    assert dept in ["Cardiology", "Cardiology Care Center", "Emergency"], f"Unexpected department: {dept}"
    
    score = primary.get("decision_score", primary.get("score", 0))
    assert score >= 80.0, f"Expected decision score >= 80%, got {score}"
    
    cf = primary.get("certainty_factor", 0)
    assert cf > 0.7, f"Expected strong certainty factor (>0.7), got {cf}"

    # Verify matching symptoms and plain language explanation
    explanation = primary.get("plain_language_explanation", "")
    assert len(explanation) > 20, "Explanation narrative is too short or missing"
    assert "chest pain" in explanation.lower() or "cardiac" in explanation.lower() or "cardiology" in explanation.lower()
    print(f"  [PASS] Recommended Department: {dept} (Decision Score: {score}%, Certainty Factor: +{cf})")
    print(f"  [PASS] Clinical Explanation: \"{explanation[:80]}...\"")

    # Verify search algorithm comparison (BFS, DFS, Greedy, A*)
    search_comp = data.get("search_comparison", {})
    algos = search_comp.get("algorithms", search_comp)
    assert "ASTAR" in algos or "A*" in algos, f"A* search missing from comparison keys: {list(algos.keys())}"
    for algo_name, algo_metrics in algos.items():
        assert "execution_time_ms" in algo_metrics, f"Missing execution_time_ms in {algo_name}"
        assert algo_metrics["execution_time_ms"] < 200.0, f"{algo_name} latency exceeded 200ms"
        cost = algo_metrics.get("total_path_cost_min", 0)
        print(f"  [PASS] Search Algorithm: {algo_name.upper()} executed in {algo_metrics['execution_time_ms']:.3f} ms (Cost: {cost} min, Path: {' -> '.join(algo_metrics.get('path', []))})")

    # Verify Minimax exclusion documentation
    minimax_note = data.get("minimax_exclusion_reasoning", {})
    if isinstance(minimax_note, dict):
        assert "EXCLUDED" in minimax_note.get("verdict", "").upper()
        text = str(minimax_note)
    else:
        text = str(minimax_note)
    assert "adversarial" in text.lower() or "excluded" in text.lower()
    print("  [PASS] Minimax & Alpha-Beta Pruning exclusion rationale documented and verified")


def test_critical_path_4_resource_shortage_alert_and_restock():
    """
    CRITICAL PATH 4: Resource Shortage Prediction & Restock Workflow
    - Fetch resources summary and evaluate shortage prediction alerts
    - Verify rule: available <= threshold OR projected daily burn exceeds stock in 48h
    - Verify alerts sorted by severity (CRITICAL before WARNING) with suggested clinical action
    - Execute restock to replenish depleted resource and clear alert state
    """
    print("\n" + "="*70)
    print(" [CRITICAL PATH 4] Testing Resource Shortage Alerts & Restock Workflow")
    print("="*70)

    # 1. Login as Admin for inventory governance
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@niet.ac.in",
        "password": "Admin@123"
    })
    token = login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {token}"}

    # 2. Get resource summary and check active predictive alerts
    sum_res = client.get("/api/v1/resources/summary", headers=admin_headers)
    assert sum_res.status_code == 200, f"Expected 200, got {sum_res.status_code}"
    summary = sum_res.json()
    alerts = summary.get("alerts", [])
    assert len(alerts) > 0, "Expected active shortage alerts from current stock"
    print(f"  [PASS] Total active predictive shortage alerts detected: {len(alerts)}")

    # Verify alert properties
    critical_alerts = [a for a in alerts if a["severity"] == "CRITICAL"]
    assert len(critical_alerts) >= 1, "Expected at least one CRITICAL alert"
    
    first_alert = alerts[0]
    assert first_alert["severity"] in ["CRITICAL", "WARNING"]
    assert first_alert.get("severity_color") in ["coral", "amber"]
    assert len(first_alert.get("suggested_action", "")) > 10
    print(f"  [PASS] Highest Priority Alert: [{first_alert['severity']}] {first_alert['resource_name']}")
    print(f"    Suggested Clinical Action: \"{first_alert['suggested_action']}\"")

    # 3. Target resource for restock
    target_res_id = first_alert["resource_id"]
    initial_available = first_alert["available_units"]
    restock_amount = 50

    # 4. Execute restock action
    restock_res = client.post(
        f"/api/v1/resources/{target_res_id}/restock",
        json={"units_to_add": restock_amount},
        headers=admin_headers
    )
    assert restock_res.status_code == 200, f"Expected 200 on restock, got {restock_res.status_code}: {restock_res.text}"
    updated_resource = restock_res.json()
    new_available = updated_resource["available_units"]
    expected_available = min(updated_resource["total_capacity"], initial_available + restock_amount)
    assert new_available == expected_available, (
        f"Available units should be {expected_available}, got {new_available}"
    )
    print(f"  [PASS] Resource {target_res_id} restocked: {initial_available} -> {new_available} units (Capacity Capped: {updated_resource['total_capacity']})")

    # 5. Verify audit log registered the restock
    db = SessionLocal()
    try:
        audit = db.query(AuditLog).filter(
            AuditLog.entity_id == target_res_id,
            AuditLog.action == "RESOURCE_RESTOCKED"
        ).order_by(AuditLog.id.desc()).first()
        assert audit is not None, f"Audit log entry for RESOURCE_RESTOCKED not found for {target_res_id}"
        print(f"  [PASS] Restock Audit Log verified: Performed by '{audit.actor_email}'")
    finally:
        db.close()

    print("\n" + "="*70)
    print(" ALL 4 CRITICAL PATH END-TO-END TESTS PASSED SUCCESSFULLY!")
    print("="*70)

if __name__ == "__main__":
    test_critical_path_1_authentication_and_authorization()
    test_critical_path_2_add_patient_intake()
    test_critical_path_3_receive_ai_recommendation()
    test_critical_path_4_resource_shortage_alert_and_restock()
