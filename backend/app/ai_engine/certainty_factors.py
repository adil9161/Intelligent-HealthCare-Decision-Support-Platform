"""
Certainty Factors (CF) Calculus Engine
Mapped to Unit 4: Uncertainty Reasoning in Artificial Intelligence
References: Buchanan & Shortliffe (1984) Rule-Based Expert Systems (MYCIN)

Calculates degree of belief vs disbelief for clinical department hypotheses
based on observed symptoms and evidence strengths.
"""

from typing import List, Dict, Any

class CertaintyFactorEngine:
    @staticmethod
    def combine_two_cfs(cf1: float, cf2: float) -> float:
        """
        Standard Buchanan & Shortliffe combination formula for two certainty factors.
        Guarantees that resulting CF stays bounded within [-1.0, +1.0].
        """
        # Clamp inputs
        cf1 = max(-1.0, min(1.0, cf1))
        cf2 = max(-1.0, min(1.0, cf2))
        
        # Case 1: Both positive (mutually reinforcing confirmation)
        if cf1 >= 0 and cf2 >= 0:
            return cf1 + cf2 * (1.0 - cf1)
            
        # Case 2: Both negative (mutually reinforcing disconfirmation)
        if cf1 < 0 and cf2 < 0:
            return cf1 + cf2 * (1.0 + cf1)
            
        # Case 3: Opposite signs (conflicting evidence)
        denom = 1.0 - min(abs(cf1), abs(cf2))
        if denom == 0:
            return 0.0 # Perfectly conflicting contradictory beliefs cancel out
        return (cf1 + cf2) / denom

    @classmethod
    def aggregate_cfs(cls, cf_list: List[float]) -> float:
        """
        Sequentially combines an arbitrary list of certainty factors.
        """
        if not cf_list:
            return 0.0
            
        current = cf_list[0]
        for next_cf in cf_list[1:]:
            current = cls.combine_two_cfs(current, next_cf)
        return round(current, 4)

    @classmethod
    def calculate_evidence_cf(
        cls,
        base_cf: float,
        patient_severity: float, # 1.0 to 10.0
        symptom_prominence: float = 1.0
    ) -> float:
        """
        Computes rule evidence CF = Rule_CF * max(0, Evidence_CF).
        Severity (1-10) scales evidence confidence from 0.5 to 1.0.
        """
        severity_factor = 0.5 + (patient_severity / 10.0) * 0.5 # 0.55 to 1.0
        evidence_strength = min(1.0, symptom_prominence * severity_factor)
        rule_cf = base_cf * max(0.0, evidence_strength)
        return round(min(1.0, max(-1.0, rule_cf)), 4)

