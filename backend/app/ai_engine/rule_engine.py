"""
Rule-Based Inference Engine (Forward Chaining)
Mapped to AI Knowledge Representation & Automated Reasoning
NIET Greater Noida B.Tech CSE AI Course | Dr. Mohd. Nazim

Applies clinical heuristic rules to identify candidate departments,
escalate urgency tiers, and trigger red-flag safety warnings.
"""

from typing import List, Dict, Any

class RuleEngine:
    RULES = [
        {
            "id": "RULE-CARDIO-01",
            "name": "Acute Coronary Syndrome Triad",
            "condition_description": "Retrosternal chest pain + radiation to arm/jaw OR diaphoresis",
            "departments": ["Cardiology", "Emergency"],
            "urgency_escalation": "Emergency",
            "cf_boost": 0.25,
            "is_red_flag": True,
            "rationale": "High clinical suspicion of acute myocardial infarction (STEMI/NSTEMI). Requires immediate ECG within 10 minutes and troponin biomarker assay."
        },
        {
            "id": "RULE-STROKE-02",
            "name": "Acute Cerebrovascular Event (FAST Protocol)",
            "condition_description": "Unilateral facial droop OR hemiparesis OR slurred speech / dysphasia",
            "departments": ["Neurology", "Emergency"],
            "urgency_escalation": "Emergency",
            "cf_boost": 0.30,
            "is_red_flag": True,
            "rationale": "Focal acute neurological deficit indicates acute ischemic/hemorrhagic stroke within the 4.5-hour thrombolytic window. Priority non-contrast head CT required."
        },
        {
            "id": "RULE-RESP-03",
            "name": "Hypoxemic Respiratory Distress",
            "condition_description": "Low SpO2 (<92%) OR Stridor / wheezing OR central cyanosis",
            "departments": ["Pulmonology", "Emergency"],
            "urgency_escalation": "Emergency",
            "cf_boost": 0.28,
            "is_red_flag": True,
            "rationale": "Compromised gas exchange and critical airway obstruction. High risk of hypercapnic or hypoxemic respiratory failure requiring high-flow O2 / mechanical ventilation."
        },
        {
            "id": "RULE-TRAUMA-04",
            "name": "Hemodynamic Collapse / Arterial Exsanguination",
            "condition_description": "Massive external hemorrhage OR loss of consciousness OR road traffic polytrauma",
            "departments": ["Emergency", "Orthopedics"],
            "urgency_escalation": "Emergency",
            "cf_boost": 0.35,
            "is_red_flag": True,
            "rationale": "Hemorrhagic shock Class III/IV risk. Immediate damage control resuscitation, surgical airway, and massive transfusion protocol activation."
        },
        {
            "id": "RULE-PEDIATRIC-05",
            "name": "Pediatric Critical Vulnerability Rule",
            "condition_description": "Patient age <= 12 years with high fever, lethargy, or respiratory distress",
            "departments": ["Pediatrics", "Emergency"],
            "urgency_escalation": "Urgent",
            "cf_boost": 0.22,
            "is_red_flag": False,
            "rationale": "Pediatric patients possess limited physiological reserve and rapidly decompensate from sepsis or respiratory compromise. Dedicated pediatric specialist required."
        },
        {
            "id": "RULE-GERIATRIC-06",
            "name": "Geriatric Multi-Morbidity & Delirium Rule",
            "condition_description": "Patient age >= 65 years with altered mental status or syncope",
            "departments": ["Neurology", "General Medicine", "Cardiology"],
            "urgency_escalation": "Urgent",
            "cf_boost": 0.18,
            "is_red_flag": False,
            "rationale": "Atypical presentation of acute coronary syndrome, urinary sepsis, or silent cerebral ischemia in elderly cohort."
        },
        {
            "id": "RULE-GI-BLEED-07",
            "name": "Upper GI Hemorrhage / Perforation Alert",
            "condition_description": "Hematemesis OR melena OR rigid board-like abdomen",
            "departments": ["Gastroenterology", "Emergency"],
            "urgency_escalation": "Emergency",
            "cf_boost": 0.25,
            "is_red_flag": True,
            "rationale": "Upper gastrointestinal bleeding (variceal/peptic) or visceral hollow organ perforation with acute peritonitis. Urgent endoscopy / surgical exploratory clearance."
        },
        {
            "id": "RULE-RENAL-08",
            "name": "Acute Renal Shutdown & Hyperkalemic Risk",
            "condition_description": "Anuria/oliguria OR refractory bilateral edema with costovertebral flank pain",
            "departments": ["Nephrology"],
            "urgency_escalation": "Urgent",
            "cf_boost": 0.20,
            "is_red_flag": False,
            "rationale": "Acute Kidney Injury (KDIGO Stage 3) or obstructive uropathy with imminent life-threatening hyperkalemia. Urgent nephrology consultation and potassium check."
        }
    ]

    @classmethod
    def evaluate_rules(
        cls,
        symptoms: List[str],
        age: int,
        severity: float,
        vitals: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Executes forward chaining against the rule base given patient evidence.
        """
        symptom_set = {s.strip().lower() for s in symptoms}
        activated_rules = []
        
        # Check vital signs if provided
        spo2 = vitals.get("spo2") if vitals else None
        hr = vitals.get("heart_rate") if vitals else None
        sbp = None
        if vitals and "bp" in vitals and isinstance(vitals["bp"], str) and "/" in vitals["bp"]:
            try:
                sbp = float(vitals["bp"].split("/")[0])
            except ValueError:
                pass

        # Helper matching logic
        has_chest_pain = any("chest pain" in s for s in symptom_set)
        has_arm_pain = any("arm" in s or "jaw" in s for s in symptom_set)
        has_diaphoresis = any("diaphoresis" in s or "sweat" in s for s in symptom_set)
        has_facial_droop = any("facial droop" in s for s in symptom_set)
        has_hemiparesis = any("weakness" in s or "hemiparesis" in s for s in symptom_set)
        has_speech_issue = any("speech" in s or "dysphasia" in s for s in symptom_set)
        has_hypoxia = any("spo2" in s or "breath" in s or "cyanosis" in s or "stridor" in s for s in symptom_set) or (spo2 is not None and spo2 < 92)
        has_massive_bleed = any("hemorrhage" in s or "arterial" in s or "trauma" in s for s in symptom_set)
        has_unresponsive = any("unresponsive" in s or "consciousness" in s for s in symptom_set)
        has_gi_bleed = any("hematemesis" in s or "melena" in s or "vomiting" in s and "blood" in s for s in symptom_set)
        has_renal_drop = any("oliguria" in s or "anuria" in s or "urine" in s for s in symptom_set)

        # Rule 1: Cardio Triad
        if has_chest_pain and (has_arm_pain or has_diaphoresis or severity >= 7.0):
            r = dict(cls.RULES[0])
            r["evidence_matched"] = ["Chest Pain", "Radiation / Diaphoresis", f"Severity: {severity}"]
            activated_rules.append(r)

        # Rule 2: Stroke FAST
        if has_facial_droop or has_hemiparesis or has_speech_issue:
            r = dict(cls.RULES[1])
            r["evidence_matched"] = [s for s in symptoms if any(k in s.lower() for k in ["droop", "weakness", "speech", "dysphasia"])]
            activated_rules.append(r)

        # Rule 3: Respiratory Hypoxia
        if has_hypoxia:
            r = dict(cls.RULES[2])
            ev = [s for s in symptoms if any(k in s.lower() for k in ["breath", "stridor", "spo2", "cyanosis"])]
            if spo2 is not None and spo2 < 92:
                ev.append(f"Recorded SpO2: {spo2}% (<92%)")
            r["evidence_matched"] = ev
            activated_rules.append(r)

        # Rule 4: Trauma & Arterial Exsanguination
        if has_massive_bleed or has_unresponsive:
            r = dict(cls.RULES[3])
            r["evidence_matched"] = [s for s in symptoms if any(k in s.lower() for k in ["hemorrhage", "arterial", "trauma", "unresponsive", "consciousness"])]
            activated_rules.append(r)

        # Rule 5: Pediatric
        if age <= 12 and (severity >= 6.0 or any("pediatric" in s.lower() or "fever" in s.lower() or "cough" in s.lower() for s in symptoms)):
            r = dict(cls.RULES[4])
            r["evidence_matched"] = [f"Pediatric Age: {age} years", f"Severity: {severity}"]
            activated_rules.append(r)

        # Rule 6: Geriatric
        if age >= 65 and (any("confusion" in s.lower() or "mental" in s.lower() or "syncope" in s.lower() or "fatigue" in s.lower() for s in symptoms)):
            r = dict(cls.RULES[5])
            r["evidence_matched"] = [f"Geriatric Age: {age} years", "Altered sensorium/syncope"]
            activated_rules.append(r)

        # Rule 7: GI Bleed
        if has_gi_bleed:
            r = dict(cls.RULES[6])
            r["evidence_matched"] = [s for s in symptoms if any(k in s.lower() for k in ["hematemesis", "melena", "vomit", "guarding"])]
            activated_rules.append(r)

        # Rule 8: Renal
        if has_renal_drop:
            r = dict(cls.RULES[7])
            r["evidence_matched"] = [s for s in symptoms if any(k in s.lower() for k in ["oliguria", "anuria", "urine", "flank"])]
            activated_rules.append(r)

        return activated_rules

