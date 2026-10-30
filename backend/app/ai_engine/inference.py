"""
Comprehensive AI Clinical Inference & Triage Engine
Course: Artificial Intelligence (NIET Greater Noida, B.Tech CSE, Dr. Mohd. Nazim)
Mapped to UN SDG 3: Good Health and Well-Being

Combines:
- Clinical Knowledge Base (symptom ontology, red-flag triggers)
- Forward-Chaining Rule Engine
- Unit 4 Buchanan & Shortliffe Certainty Factors (CF) with graceful degradation under incomplete data
- Unit 4 Fuzzy Membership & Defuzzification (severity & urgency compatibility)
- Search Algorithms (BFS, DFS, Greedy Best-First, A*) over Healthcare Decision Graph
- Transparent Path Scoring & Jargon-Free Plain Language Explanations
- Academic documentation on Minimax & Alpha-Beta Pruning evaluation and exclusion
"""

import time
from datetime import datetime, timezone
from typing import Dict, List, Any
from app.ai_engine.knowledge_base import DEPARTMENTS, ALL_SYMPTOMS
from app.ai_engine.certainty_factors import CertaintyFactorEngine
from app.ai_engine.fuzzy_scoring import FuzzyScoringEngine
from app.ai_engine.rule_engine import RuleEngine
from app.ai_engine.search_graph import SearchGraphEngine, DEPT_TO_GOAL_MAP

class ClinicalInferenceEngine:
    @classmethod
    def evaluate_triage(
        cls,
        patient_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executes complete multi-paradigm AI decision pipeline:
        1. Patient input matched against clinical knowledge base.
        2. Rule-based forward chaining identifies candidate departments.
        3. Unit 4 Certainty Factor calculus with graceful degradation for incomplete data.
        4. Fuzzy inference calculates continuous severity and urgency compatibility.
        5. Graph search algorithms (BFS, DFS, Greedy Best-First, A*) explore decision graph.
        6. Inference engine scores each path and selects optimal route.
        7. Top result returned with matching symptoms, compatibility degrees, score, and plain explanation.
        """
        symptoms = patient_data.get("symptoms", [])
        age = int(patient_data.get("age", 40))
        severity = float(patient_data.get("severity", 5.0))
        urgency = str(patient_data.get("urgency", "Urgent"))
        vitals = patient_data.get("vitals", {})

        # Step 1: Forward-chaining rule engine
        activated_rules = RuleEngine.evaluate_rules(symptoms, age, severity, vitals)
        has_red_flag = any(r.get("is_red_flag", False) for r in activated_rules)
        
        # If red-flag triggered, escalate urgency if lower
        effective_urgency = urgency
        if has_red_flag and urgency in ["Non-Urgent", "Semi-Urgent"]:
            effective_urgency = "Emergency"

        # Step 2: Incomplete Data & Graceful Degradation Analysis (Unit 4)
        sym_count = len([s for s in symptoms if s.strip()])
        vitals_count = sum(1 for k in ["bp", "heart_rate", "spo2"] if vitals and vitals.get(k))
        sym_completeness = min(1.0, sym_count / 3.0)
        vit_completeness = vitals_count / 3.0
        data_completeness_ratio = round((sym_completeness * 0.7) + (vit_completeness * 0.3), 3)

        graceful_degradation_applied = data_completeness_ratio < 0.60
        graceful_degradation_notice = None
        if graceful_degradation_applied:
            graceful_degradation_notice = (
                f"Graceful degradation applied: Certainty factor adjusted to reflect incomplete "
                f"presentation ({sym_count} symptom(s) and {vitals_count}/3 vitals recorded). "
                "System safely routes without crash while advising secondary clinical validation."
            )

        # Step 3: Department Candidates Evaluation
        candidates: List[Dict[str, Any]] = []

        # Normalized symptom lookup & unknown symptom detection
        user_symptoms_lower = [s.strip().lower() for s in symptoms if s.strip()]
        
        all_known_symptoms_lower = set(s.strip().lower() for s in ALL_SYMPTOMS)
        for dept in DEPARTMENTS.values():
            for ps in dept.get("primary_symptoms", []):
                all_known_symptoms_lower.add(ps["symptom"].strip().lower())

        unknown_symptoms: List[str] = []
        for raw_sym in symptoms:
            raw_clean = raw_sym.strip()
            raw_lower = raw_clean.lower()
            if not raw_clean:
                continue
            matched = any(
                raw_lower in known or known in raw_lower or any(t in known for t in raw_lower.split() if len(t) > 3)
                for known in all_known_symptoms_lower
            )
            if not matched:
                unknown_symptoms.append(raw_clean)

        warnings: List[str] = []
        if unknown_symptoms:
            for unk in unknown_symptoms:
                warnings.append(
                    f"Presenting symptom '{unk}' is uncataloged in standard clinical ontology. "
                    "AegisHealth AI evaluated using heuristic baseline rules and remaining clinical markers without system interruption."
                )

        # Target severity benchmarks by department for compatibility calculation
        DEPT_SEVERITY_BENCHMARKS = {
            "Emergency": 95.0,
            "Cardiology": 90.0,
            "Neurology": 88.0,
            "Pulmonology": 85.0,
            "Orthopedics": 65.0,
            "Gastroenterology": 68.0,
            "Nephrology": 70.0,
            "Pediatrics": 60.0,
            "General Medicine": 35.0,
        }

        for dept_name, dept_info in DEPARTMENTS.items():
            matched_symptoms_list = []
            symptom_cfs = []

            for ps in dept_info.get("primary_symptoms", []):
                sym_text = ps["symptom"]
                sym_weight = ps["weight"]
                sym_base_cf = ps["cf"]

                # Check match against user symptoms
                is_matched = False
                for u_sym in user_symptoms_lower:
                    if u_sym in sym_text.lower() or any(term in sym_text.lower() for term in u_sym.split() if len(term) > 3):
                        is_matched = True
                        break

                if is_matched:
                    matched_symptoms_list.append(sym_text)
                    evidence_cf = CertaintyFactorEngine.calculate_evidence_cf(
                        base_cf=sym_base_cf,
                        patient_severity=severity,
                        symptom_prominence=sym_weight
                    )
                    symptom_cfs.append(evidence_cf)

            # Aggregate Certainty Factors for this department
            combined_cf = CertaintyFactorEngine.aggregate_cfs(symptom_cfs)

            # Check rule activations for this department
            dept_rules = [r for r in activated_rules if dept_name in r.get("departments", [])]
            rule_cf_boost = sum(r.get("cf_boost", 0.0) for r in dept_rules)
            
            # Combine rule boost into CF
            if rule_cf_boost > 0:
                combined_cf = CertaintyFactorEngine.combine_two_cfs(combined_cf, min(0.95, rule_cf_boost))

            # Apply graceful degradation if data is sparse/incomplete
            if graceful_degradation_applied and combined_cf > 0:
                degrade_multiplier = 0.50 + (data_completeness_ratio * 0.50)
                combined_cf = round(combined_cf * degrade_multiplier, 3)

            # Step 4: Fuzzy Scoring
            fuzzy_result = FuzzyScoringEngine.compute_composite_clinical_score(
                severity=severity,
                urgency_label=effective_urgency,
                base_match_cf=combined_cf
            )

            # Compute Severity Compatibility (0-100%)
            target_sev = DEPT_SEVERITY_BENCHMARKS.get(dept_name, 60.0)
            patient_sev_pct = severity * 10.0
            sev_diff = abs(patient_sev_pct - target_sev)
            severity_compatibility = round(max(25.0, min(100.0, 100.0 - (sev_diff * 0.65))), 1)

            # Compute Urgency Compatibility (0-100%)
            if effective_urgency == "Emergency":
                urg_compat = 98.0 if dept_name in ["Emergency", "Cardiology", "Neurology", "Pulmonology"] else 45.0
            elif effective_urgency == "Urgent":
                urg_compat = 92.0 if dept_name in ["Emergency", "Cardiology", "Neurology", "Pulmonology", "Orthopedics", "Gastroenterology", "Nephrology"] else 70.0
            elif effective_urgency == "Semi-Urgent":
                urg_compat = 85.0 if dept_name in ["Orthopedics", "General Medicine", "Pediatrics"] else 60.0
            else: # Non-Urgent
                urg_compat = 98.0 if dept_name == "General Medicine" else 40.0
            urgency_compatibility = round(urg_compat, 1)

            # Determine resource tier recommendation
            if fuzzy_result["decision_score"] >= 85 or has_red_flag:
                tier = "Tier 1: Stat Resuscitation & Critical Care"
            elif fuzzy_result["decision_score"] >= 65:
                tier = "Tier 2: Priority Specialist Consultation & Inpatient Telemetry"
            elif fuzzy_result["decision_score"] >= 45:
                tier = "Tier 3: Standard Acute Evaluation & Observation Ward"
            else:
                tier = "Tier 4: Ambulatory Day Care / OPD Follow-up"

            # Clinical rationale text
            if dept_rules:
                rationale = f"Priority candidate driven by active clinical alert ({dept_rules[0]['name']}) and {len(matched_symptoms_list)} presenting symptom(s)."
            elif matched_symptoms_list:
                rationale = f"Evaluated based on clinical symptom correlation ({', '.join(matched_symptoms_list[:2])}) with Certainty Factor CF = {combined_cf:.2f}."
            else:
                rationale = "Secondary general medical evaluation alternative."

            candidate_obj = {
                "rank": 0, # Will assign after sort
                "department": dept_name,
                "department_code": dept_info["code"],
                "decision_score": fuzzy_result["decision_score"],
                "score": fuzzy_result["decision_score"], # Alias
                "certainty_factor": round(combined_cf, 3),
                "fuzzy_severity_degree": round(fuzzy_result["defuzzified_severity"] / 100.0, 3),
                "fuzzy_urgency_degree": round(fuzzy_result["urgency_weight"], 3),
                "severity_compatibility": severity_compatibility,
                "urgency_compatibility": urgency_compatibility,
                "is_red_flag_alert": any(r.get("is_red_flag", False) for r in dept_rules),
                "matched_symptoms": matched_symptoms_list,
                "matching_symptoms": matched_symptoms_list, # Alias
                "activated_rules": [r["name"] for r in dept_rules],
                "suggested_resource_tier": tier,
                "clinical_rationale": rationale,
                "floor": dept_info["floor"],
                "critical_resources": dept_info["critical_resources"]
            }
            candidates.append(candidate_obj)

        # If no department symptoms matched at all and no rules fired, give General Medicine and Emergency a sensible baseline
        if all(len(c["matched_symptoms"]) == 0 for c in candidates) and not activated_rules:
            for c in candidates:
                if c["department"] == "General Medicine":
                    c["decision_score"] = max(c["decision_score"], 58.0)
                    c["score"] = c["decision_score"]
                    c["clinical_rationale"] = "Primary ambulatory routing for uncataloged clinical presentation."
                elif c["department"] == "Emergency" and severity >= 7.0:
                    c["decision_score"] = max(c["decision_score"], 68.0)
                    c["score"] = c["decision_score"]
                    c["clinical_rationale"] = "Elevated clinical severity presentation requiring emergency triage review."

        # Sort descending by decision score
        candidates.sort(key=lambda c: c["decision_score"], reverse=True)

        # Assign ranks
        for idx, cand in enumerate(candidates, start=1):
            cand["rank"] = idx

        primary = candidates[0]
        alternatives = candidates[1:4]

        # Step 5: Multi-Algorithm Decision Graph Exploration (BFS, DFS, Greedy Best-First, A*)
        goal_node = DEPT_TO_GOAL_MAP.get(primary["department"], "dest_inpatient_ward")
        search_comparison = SearchGraphEngine.compare_all_algorithms(
            start_node="triage_intake",
            goal_node=goal_node,
            patient_severity=severity,
            target_department=primary["department"]
        )
        astar_result = search_comparison["optimal_pathway"]

        # Step 6: Generate Human-Readable Plain Language Explanation (No Jargon)
        matched_str = ", ".join(primary["matched_symptoms"]) if primary["matched_symptoms"] else "general clinical symptoms"
        optimal_dest = astar_result.get("optimal_path_labels", ["Specialist Care Unit"])[-1]
        plain_language_explanation = (
            f"We recommend {primary['department']} because your observed symptoms ({matched_str}) "
            f"closely match this department's care specialty. Based on your severity level of {severity:.1f} out of 10 "
            f"and {effective_urgency.lower()} urgency, rapid medical attention is indicated. "
            f"Our AI search evaluated pathways and determined the fastest, safest route leads from intake "
            f"through diagnostic evaluation directly to {optimal_dest} in an estimated {astar_result.get('total_path_cost', 0):.0f} minutes."
        )

        primary["plain_language_explanation"] = plain_language_explanation
        primary["explanation"] = plain_language_explanation

        top_result_payload = {
            "department": primary["department"],
            "department_code": primary["department_code"],
            "score": primary["decision_score"],
            "matching_symptoms": primary["matched_symptoms"],
            "severity_compatibility": primary["severity_compatibility"],
            "urgency_compatibility": primary["urgency_compatibility"],
            "plain_language_explanation": plain_language_explanation,
            "certainty_factor": primary["certainty_factor"]
        }

        # Step 7: Construct Complete Response
        response = {
            "patient_profile": {
                "name": patient_data.get("name", "Patient"),
                "age": age,
                "gender": patient_data.get("gender", "Other"),
                "symptoms": symptoms,
                "severity": severity,
                "urgency": effective_urgency,
                "vitals": vitals
            },
            "top_result": top_result_payload,
            "primary_recommendation": primary,
            "ranked_alternatives": alternatives,
            "all_evaluated_departments": candidates,
            "warnings": warnings,
            "rule_engine_trace": activated_rules,
            "fuzzy_membership_breakdown": {
                "severity": FuzzyScoringEngine.evaluate_severity_membership(severity),
                "urgency": FuzzyScoringEngine.evaluate_urgency_membership(effective_urgency)
            },
            "certainty_factor_trace": {
                "primary_department": primary["department"],
                "final_combined_cf": primary["certainty_factor"],
                "data_completeness_ratio": data_completeness_ratio,
                "graceful_degradation_applied": graceful_degradation_applied,
                "formula_applied": "Buchanan & Shortliffe: CF_combine(CF1, CF2) = CF1 + CF2*(1 - CF1)"
            },
            "graceful_degradation_applied": graceful_degradation_applied,
            "graceful_degradation_notice": graceful_degradation_notice,
            "search_pathway": astar_result,
            "search_comparison": search_comparison,
            "minimax_exclusion_reasoning": SearchGraphEngine.get_minimax_exclusion_academic_rationale(),
            "ethical_disclaimer": (
                "CLINICAL DECISION SUPPORT NOTICE: This evaluation is an algorithmic recommendation "
                "intended solely to assist clinical triage workflow. Final medical diagnosis, "
                "department routing, and pharmacological intervention remain the exclusive "
                "responsibility of the licensed attending physician."
            ),
            "academic_attribution": {
                "institution": "NIET Greater Noida",
                "department": "Computer Science & Engineering",
                "course": "Artificial Intelligence (Dr. Mohd. Nazim)",
                "sdg_target": "SDG 3: Good Health & Well-Being"
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        return response
