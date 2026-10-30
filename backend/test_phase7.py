"""
Verification Test for Phase 7: The AI Decision Core
Academic Mapping: B.Tech CSE AI Course (Dr. Mohd. Nazim, NIET Greater Noida) | SDG 3

Quality Bar & Test Requirements:
1. Decision engine exposed as FastAPI service (`POST /api/v1/ai/pipeline` & `POST /api/v1/ai/triage-evaluate`).
2. Complete pipeline verified:
   - Patient input matches knowledge base.
   - Rule-based forward-chaining identifies candidate departments.
   - Decision graph explored by BFS, DFS, Greedy Best-First, and A* search.
   - Inference engine scores each path.
   - Top result returns with:
     * matching symptoms
     * severity compatibility
     * urgency compatibility
     * score
     * plain-language explanation without jargon
3. Unit 4 Certainty Factor layer with graceful degradation under incomplete data.
4. Latency Quality Bar: Every search algorithm (BFS, DFS, Greedy, A*) completes in under 200 milliseconds.
5. Explanation Quality Bar: Jargon-free, human-readable narrative.
6. Minimax and Alpha-Beta Pruning: Evaluated and excluded with documented academic rationale.
7. Unit-tested against the FOUR Month 2 clinical benchmark scenarios:
   - Scenario 1: Acute Coronary Syndrome (STEMI) -> Cardiology Care Center
   - Scenario 2: Acute Cerebrovascular Event (Stroke - FAST) -> Neurology & Stroke Unit
   - Scenario 3: Hypoxemic Respiratory Failure -> Pulmonology Critical Care
   - Scenario 4: High-Velocity Polytrauma / Shock -> Emergency Trauma Bay
"""

import sys
import os
import time
import pytest

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.ai_engine.search_graph import SearchGraphEngine

client = TestClient(app)

def test_phase7_ai_decision_core():
    print("================================================================")
    print("  Testing Phase 7: The AI Decision Core & Search Engine         ")
    print("================================================================")

    doctor_token = create_access_token(subject="dr.nazim@niet.ac.in", role="doctor")
    headers = {"Authorization": f"Bearer {doctor_token}"}

    # =========================================================================
    # PART 1: The Four Month 2 Report Clinical Benchmark Scenarios
    # =========================================================================
    print("\n[Step 1] Unit-Testing Four Month 2 Report Benchmark Scenarios...")

    # Scenario 1: Acute Coronary Syndrome (STEMI)
    print("\n -> Running Scenario 1: Acute Coronary Syndrome (STEMI)...")
    scen1_input = {
        "name": "Prof. Alok Sharma",
        "age": 58,
        "gender": "Male",
        "symptoms": [
            "Chest Pain (Retrosternal / Crushing)",
            "Pain Radiating to Left Arm / Jaw",
            "Diaphoresis (Profuse Cold Sweats)"
        ],
        "severity": 9.2,
        "urgency": "Emergency",
        "vitals": {"bp": "165/100", "heart_rate": 112, "spo2": 94}
    }
    res1 = client.post("/api/v1/ai/pipeline", json=scen1_input, headers=headers)
    assert res1.status_code == 200, f"Expected 200, got {res1.status_code}"
    data1 = res1.json()
    top1 = data1.get("top_result")
    assert top1 is not None, "Missing top_result in response"
    print(f"    Top Department: {top1['department']} ({top1['department_code']})")
    print(f"    Decision Score: {top1['score']}% | Certainty Factor: +{top1['certainty_factor']}")
    print(f"    Severity Match: {top1['severity_compatibility']}% | Urgency Match: {top1['urgency_compatibility']}%")
    print(f"    Explanation: {top1['plain_language_explanation'][:90]}...")
    assert top1["department"] == "Cardiology", f"Scenario 1 must route to Cardiology, got {top1['department']}"
    assert top1["score"] >= 88.0, f"Score should be >= 88.0%, got {top1['score']}"
    assert top1["certainty_factor"] >= 0.85, f"Certainty factor should be >= 0.85, got {top1['certainty_factor']}"
    assert len(top1["matching_symptoms"]) >= 2, "Matching symptoms must be identified"

    # Scenario 2: Acute Cerebrovascular Event (Stroke - FAST Protocol)
    print("\n -> Running Scenario 2: Acute Cerebrovascular Event (FAST Protocol)...")
    scen2_input = {
        "name": "Mrs. Savitri Devi",
        "age": 67,
        "gender": "Female",
        "symptoms": [
            "Sudden Unilateral Facial Droop",
            "Unilateral Arm or Leg Weakness (Hemiparesis)",
            "Slurred Speech / Dysphasia"
        ],
        "severity": 9.5,
        "urgency": "Emergency",
        "vitals": {"bp": "190/105", "heart_rate": 88, "spo2": 97}
    }
    res2 = client.post("/api/v1/ai/pipeline", json=scen2_input, headers=headers)
    assert res2.status_code == 200
    data2 = res2.json()
    top2 = data2["top_result"]
    print(f"    Top Department: {top2['department']} ({top2['department_code']})")
    print(f"    Decision Score: {top2['score']}% | Certainty Factor: +{top2['certainty_factor']}")
    print(f"    Severity Match: {top2['severity_compatibility']}% | Urgency Match: {top2['urgency_compatibility']}%")
    print(f"    Explanation: {top2['plain_language_explanation'][:90]}...")
    assert top2["department"] == "Neurology", f"Scenario 2 must route to Neurology, got {top2['department']}"
    assert top2["score"] >= 88.0
    assert top2["certainty_factor"] >= 0.85

    # Scenario 3: Hypoxemic Respiratory Failure
    print("\n -> Running Scenario 3: Hypoxemic Respiratory Distress...")
    scen3_input = {
        "name": "Rajiv Mehra",
        "age": 45,
        "gender": "Male",
        "symptoms": [
            "Severe Shortness of Breath / Dyspnea at Rest",
            "Low SpO2 Saturation (<92%)",
            "Central Cyanosis (Bluish Lips/Nails)"
        ],
        "severity": 8.8,
        "urgency": "Emergency",
        "vitals": {"bp": "135/85", "heart_rate": 128, "spo2": 86}
    }
    res3 = client.post("/api/v1/ai/pipeline", json=scen3_input, headers=headers)
    assert res3.status_code == 200
    data3 = res3.json()
    top3 = data3["top_result"]
    print(f"    Top Department: {top3['department']} ({top3['department_code']})")
    print(f"    Decision Score: {top3['score']}% | Certainty Factor: +{top3['certainty_factor']}")
    print(f"    Severity Match: {top3['severity_compatibility']}% | Urgency Match: {top3['urgency_compatibility']}%")
    print(f"    Explanation: {top3['plain_language_explanation'][:90]}...")
    assert top3["department"] == "Pulmonology", f"Scenario 3 must route to Pulmonology, got {top3['department']}"
    assert top3["score"] >= 85.0

    # Scenario 4: High-Velocity Polytrauma & Exsanguination
    print("\n -> Running Scenario 4: High-Velocity Road Traffic Polytrauma...")
    scen4_input = {
        "name": "Karan Singhal",
        "age": 29,
        "gender": "Male",
        "symptoms": [
            "Massive External Hemorrhage / Arterial Bleed",
            "Loss of Consciousness / Unresponsive (GCS < 8)",
            "Compound Open Fracture with Exposed Bone"
        ],
        "severity": 9.9,
        "urgency": "Emergency",
        "vitals": {"bp": "75/40", "heart_rate": 145, "spo2": 90}
    }
    res4 = client.post("/api/v1/ai/pipeline", json=scen4_input, headers=headers)
    assert res4.status_code == 200
    data4 = res4.json()
    top4 = data4["top_result"]
    print(f"    Top Department: {top4['department']} ({top4['department_code']})")
    print(f"    Decision Score: {top4['score']}% | Certainty Factor: +{top4['certainty_factor']}")
    print(f"    Severity Match: {top4['severity_compatibility']}% | Urgency Match: {top4['urgency_compatibility']}%")
    print(f"    Explanation: {top4['plain_language_explanation'][:90]}...")
    assert top4["department"] == "Emergency", f"Scenario 4 must route to Emergency, got {top4['department']}"
    assert top4["score"] >= 90.0

    # =========================================================================
    # PART 2: Unit 4 Certainty Factor Layer & Graceful Degradation
    # =========================================================================
    print("\n[Step 2] Verifying Unit 4 Certainty Factor Graceful Degradation...")
    incomplete_input = {
        "name": "Sparse Presentation Patient",
        "age": 35,
        "gender": "Female",
        "symptoms": ["Generalized Chronic Fatigue and Body Aches"], # Only 1 mild vague symptom
        "severity": 3.0,
        "urgency": "Non-Urgent",
        "vitals": {} # Completely missing vitals
    }
    res_inc = client.post("/api/v1/ai/pipeline", json=incomplete_input, headers=headers)
    assert res_inc.status_code == 200
    data_inc = res_inc.json()
    top_inc = data_inc["top_result"]
    
    print(f" -> Top Department for Sparse Input: {top_inc['department']}")
    print(f" -> Degraded Certainty Factor: +{top_inc['certainty_factor']}")
    print(f" -> Graceful Degradation Applied: {data_inc.get('graceful_degradation_applied')}")
    print(f" -> Notice: {data_inc.get('graceful_degradation_notice')}")

    assert data_inc.get("graceful_degradation_applied") is True, "Graceful degradation should activate for incomplete data"
    assert data_inc.get("graceful_degradation_notice") is not None, "Notice must explain degradation"
    assert top_inc["certainty_factor"] <= 0.45, f"Certainty factor must degrade gracefully under sparse evidence, got {top_inc['certainty_factor']}"

    # =========================================================================
    # PART 3: Healthcare Decision Graph Search & Path Scoring (BFS, DFS, Greedy, A*)
    # =========================================================================
    print("\n[Step 3] Verifying Search Graph Exploration across 4 Algorithms...")
    search_comp = data1.get("search_comparison")
    assert search_comp is not None, "Search comparison must be present in response"
    algos = search_comp.get("algorithms", {})
    
    assert "BFS" in algos, "Missing BFS search algorithm"
    assert "DFS" in algos, "Missing DFS search algorithm"
    assert "GREEDY" in algos, "Missing Greedy Best-First search algorithm"
    assert "ASTAR" in algos, "Missing A* search algorithm"

    print(" -> Search Exploration Results:")
    for algo_key, algo_info in algos.items():
        print(f"    [{algo_key}] Path: {' -> '.join(algo_info['path'])}")
        print(f"          Cost: {algo_info['total_path_cost_min']}m | Score: {algo_info['path_score']}/100 | Latency: {algo_info['execution_time_ms']}ms | Optimal: {algo_info['is_optimal']}")
        assert algo_info["execution_time_ms"] < 200.0, f"{algo_key} latency exceeded 200ms: {algo_info['execution_time_ms']}ms"
        assert algo_info["path_score"] > 0, f"{algo_key} path score must be evaluated"
        assert len(algo_info["path"]) >= 2, f"{algo_key} path must have at least 2 nodes"

    assert algos["ASTAR"]["is_optimal"] is True, "A* must be flagged as optimal pathway"
    assert algos["ASTAR"]["path_score"] >= algos["DFS"]["path_score"], "A* path score must be superior or equal to DFS"

    # =========================================================================
    # PART 4: Real-Time Latency Benchmark Quality Bar (< 200 ms)
    # =========================================================================
    print("\n[Step 4] Benchmarking Algorithm Latency (< 200 ms Quality Bar)...")
    bench_res = client.get("/api/v1/ai/benchmark-algorithms", headers=headers)
    assert bench_res.status_code == 200
    bench_data = bench_res.json()
    assert bench_data["status"] == "PASS"
    for algo, metrics in bench_data["results"].items():
        print(f" -> {algo}: Avg = {metrics['average_ms']}ms | Max = {metrics['max_ms']}ms (<200ms: {metrics['under_200ms']})")
        assert metrics["under_200ms"] is True, f"{algo} failed 200ms latency requirement"

    # =========================================================================
    # PART 5: Plain-Language Explanation Quality Bar (Zero Jargon)
    # =========================================================================
    print("\n[Step 5] Verifying Plain-Language Explanation Quality Bar...")
    explanation = top1["plain_language_explanation"]
    print(f" -> Sample Explanation:\n    \"{explanation}\"")
    assert len(explanation) > 50, "Explanation must provide substantial reasoning"
    assert "Cardiology" in explanation
    # Verify no cryptic raw acronyms without context
    jargon_blacklist = ["NSTEMI_GRADE_4", "ESI_STRAT_ORDINAL", "CALC_HEURISTIC_FN"]
    for j in jargon_blacklist:
        assert j not in explanation, f"Forbidden internal jargon '{j}' found in plain-language explanation"

    # =========================================================================
    # PART 6: Minimax & Alpha-Beta Exclusion Academic Documentation
    # =========================================================================
    print("\n[Step 6] Verifying Minimax & Alpha-Beta Pruning Exclusion Rationale...")
    minimax_res = client.get("/api/v1/ai/minimax-exclusion-rationale", headers=headers)
    assert minimax_res.status_code == 200
    mm_data = minimax_res.json()
    print(f" -> Title: {mm_data['title']}")
    print(f" -> Verdict: {mm_data['verdict']}")
    print(f" -> Core Arguments: {len(mm_data['core_arguments'])} principles documented")
    assert "EXCLUDED" in mm_data["verdict"]
    assert len(mm_data["core_arguments"]) >= 3
    principles = [arg["principle"] for arg in mm_data["core_arguments"]]
    assert any("Adversary" in p for p in principles), "Must explain absence of zero-sum adversary"

    print("\n================================================================")
    print("  ALL PHASE 7 AI DECISION CORE TESTS PASSED (100% SUCCESS)      ")
    print("================================================================")

if __name__ == "__main__":
    test_phase7_ai_decision_core()

