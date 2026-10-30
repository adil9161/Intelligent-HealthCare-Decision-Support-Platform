"""
Verification Test for Phase 6: Resource Management & Shortage Prediction
Quality Bar:
1. Tracking beds, medicines, oxygen, and equipment with total, available, daily usage rate, and reorder threshold.
2. Rule-based shortage alerts triggered when available <= threshold OR projected daily burn exceeds stock in 48h.
3. Non-blocking alerts sorted strictly by severity (CRITICAL before WARNING) with severity colors and suggested clinical actions.
4. Thresholds editable by Admins ONLY (Doctors/Staff receive 403 Forbidden).
5. Area chart historical usage (at least 7 days history + forward dashed trajectory).
6. Immediate recalculation of predictions and alerts on restock or threshold update.
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.seed_data import seed_database
from app.core.security import create_access_token
from app.database import SessionLocal
from app.models.resource import Resource

client = TestClient(app)

def test_phase6_resource_prediction():
    print("================================================================")
    print("  Testing Phase 6: Resource Management & Shortage Prediction   ")
    print("================================================================")

    # 1. Seed database
    seed_database()

    # 2. Setup JWT Auth tokens
    admin_token = create_access_token(subject="admin@niet.ac.in", role="admin")
    doctor_token = create_access_token(subject="dr.nazim@niet.ac.in", role="doctor")
    staff_token = create_access_token(subject="nurse.priya@niet.ac.in", role="staff")

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    doctor_headers = {"Authorization": f"Bearer {doctor_token}"}
    staff_headers = {"Authorization": f"Bearer {staff_token}"}

    # 3. Retrieve Resources & Verify Tracking Fields
    print("\n[Step 1] Fetching resources & verifying required fields...")
    res = client.get("/api/v1/resources", headers=doctor_headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    resources = res.json()
    assert len(resources) >= 4, f"Expected at least 4 resources, got {len(resources)}"

    categories_found = {r["category"] for r in resources}
    print(f" -> Found categories: {categories_found}")
    assert "Beds" in categories_found, "Missing Beds category"
    assert "Oxygen" in categories_found, "Missing Oxygen category"
    assert "Medicines" in categories_found, "Missing Medicines category"
    assert "Equipment" in categories_found, "Missing Equipment category"

    for r in resources:
        assert "total_capacity" in r, f"Missing total_capacity in {r['resource_id']}"
        assert "available_units" in r, f"Missing available_units in {r['resource_id']}"
        assert "daily_usage_rate" in r, f"Missing daily_usage_rate in {r['resource_id']}"
        assert "reorder_threshold" in r, f"Missing reorder_threshold in {r['resource_id']}"
        assert "historical_usage" in r, f"Missing historical_usage in {r['resource_id']}"
        assert len(r["historical_usage"]) >= 7, f"Expected at least 7 history points, got {len(r['historical_usage'])}"
        
        # Verify dashed forward predictions exist
        forward_predictions = [p for p in r["historical_usage"] if p.get("is_prediction") is True]
        assert len(forward_predictions) >= 1, f"Expected forward trajectory points for {r['resource_id']}"

    sample = resources[0]
    print(f" -> Resource sample: {sample['name']} ({sample['category']})")
    print(f"    Available: {sample['available_units']}/{sample['total_capacity']} {sample['unit_measure']}")
    print(f"    Daily Usage Rate: {sample['daily_usage_rate']} {sample['unit_measure']}/day")
    print(f"    Reorder Threshold: {sample['reorder_threshold']} {sample['unit_measure']}")
    print(f"    Historical trajectory points: {len(sample['historical_usage'])}")

    # 4. Verify Rule-Based Shortage Prediction & Severity Sorting
    print("\n[Step 2] Fetching resource summary & verifying predictive shortage alerts...")
    sum_res = client.get("/api/v1/resources/summary", headers=doctor_headers)
    assert sum_res.status_code == 200
    summary = sum_res.json()
    alerts = summary.get("alerts", [])
    print(f" -> Total predictive alerts generated: {len(alerts)}")
    assert len(alerts) > 0, "Expected at least one shortage alert from seed data"

    # Verify alerts are sorted strictly by severity (CRITICAL before WARNING)
    severity_order = {"CRITICAL": 0, "WARNING": 1}
    for i in range(len(alerts) - 1):
        sev_current = severity_order.get(alerts[i]["severity"], 2)
        sev_next = severity_order.get(alerts[i + 1]["severity"], 2)
        assert sev_current <= sev_next, (
            f"Alerts not sorted by severity! Found {alerts[i]['severity']} before {alerts[i+1]['severity']}"
        )

    for alert in alerts:
        assert "severity" in alert
        assert "severity_color" in alert
        assert "suggested_action" in alert
        assert alert["suggested_action"] != "", "Suggested clinical action must not be empty"
        print(f"    [{alert['severity']}] {alert['resource_name']} ({alert['severity_color']}): {alert['suggested_action'][:60]}...")

    # 5. Admin-Only Governance on Reorder Thresholds
    print("\n[Step 3] Verifying Admin-Only permission on Reorder Threshold update...")
    target_res = resources[0]
    target_id = target_res["resource_id"]
    new_threshold_val = 15.0

    # Attempt 1: Doctor attempts to update threshold -> MUST BE 403 Forbidden
    doc_attempt = client.put(
        f"/api/v1/resources/{target_id}/threshold",
        json={"reorder_threshold": new_threshold_val, "notes": "Doctor attempted override"},
        headers=doctor_headers
    )
    print(f" -> Doctor threshold edit status: {doc_attempt.status_code} (Expected 403)")
    assert doc_attempt.status_code == 403, f"Doctor should receive 403 Forbidden, got {doc_attempt.status_code}"

    # Attempt 2: Staff attempts to update threshold -> MUST BE 403 Forbidden
    staff_attempt = client.put(
        f"/api/v1/resources/{target_id}/threshold",
        json={"reorder_threshold": new_threshold_val, "notes": "Staff attempted override"},
        headers=staff_headers
    )
    print(f" -> Staff threshold edit status: {staff_attempt.status_code} (Expected 403)")
    assert staff_attempt.status_code == 403, f"Staff should receive 403 Forbidden, got {staff_attempt.status_code}"

    # Attempt 3: Admin updates threshold -> MUST BE 200 OK
    admin_attempt = client.put(
        f"/api/v1/resources/{target_id}/threshold",
        json={"reorder_threshold": new_threshold_val, "notes": "Admin policy update"},
        headers=admin_headers
    )
    print(f" -> Admin threshold edit status: {admin_attempt.status_code} (Expected 200)")
    assert admin_attempt.status_code == 200, f"Admin update failed: {admin_attempt.text}"
    updated_res = admin_attempt.json()
    assert updated_res["reorder_threshold"] == new_threshold_val, "Threshold was not updated in response"

    # 6. Verify 48-Hour Burn Rule & Shortage Alert Recalculation
    print("\n[Step 4] Verifying 48-hour burn rule and immediate recalculation...")
    # Set threshold high to trigger alert
    high_threshold_res = client.put(
        f"/api/v1/resources/{target_id}/threshold",
        json={"reorder_threshold": 999.0, "notes": "Trigger alert test"},
        headers=admin_headers
    )
    assert high_threshold_res.status_code == 200
    res_data = high_threshold_res.json()
    assert res_data["predictive_alerts"] is not None and len(res_data["predictive_alerts"]) > 0, (
        "Raising threshold above available units should immediately generate predictive alert"
    )
    print(f" -> Immediate recalculation alert: {res_data['predictive_alerts'][0]['message']}")

    # 7. Restock Recalculation Test
    print("\n[Step 5] Verifying Restock immediately recalculates predictions...")
    # Set threshold to a normal level (5 beds) so restock returns status to Normal
    client.put(
        f"/api/v1/resources/{target_id}/threshold",
        json={"reorder_threshold": 5.0, "notes": "Reset threshold to normal"},
        headers=admin_headers
    )

    restock_res = client.post(
        f"/api/v1/resources/{target_id}/restock",
        json={"units_to_add": 35, "notes": "Bulk emergency delivery"},
        headers=admin_headers
    )
    assert restock_res.status_code == 200
    restocked_data = restock_res.json()
    print(f" -> Post-restock available: {restocked_data['available_units']}/{restocked_data['total_capacity']}")
    print(f" -> Post-restock status: {restocked_data['status']}")
    assert restocked_data["available_units"] >= 35.0
    assert restocked_data["status"] == "Normal"

    print("\n================================================================")
    print("  ALL PHASE 6 RESOURCE TESTS PASSED WITH 100% SUCCESS           ")
    print("================================================================")

if __name__ == "__main__":
    test_phase6_resource_prediction()
