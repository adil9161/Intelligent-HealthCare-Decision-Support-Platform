"""
Fuzzy Logic & Scoring Engine
Mapped to Unit 4: Uncertainty Reasoning & Fuzzy Systems
Course: Artificial Intelligence (NIET B.Tech CSE, Dr. Mohd. Nazim)

Replaces binary boolean thresholds (e.g. 'is_critical: true/false') with
graded membership degrees in [0.0, 1.0], reflecting clinical reality where
pathology and physiological compromise exist on a continuum.
"""

from typing import Dict, Any

class FuzzyScoringEngine:
    @staticmethod
    def _triangular(x: float, a: float, b: float, c: float) -> float:
        """Triangular membership function parameterized by (a, b, c)."""
        if x <= a or x >= c:
            return 0.0
        elif a < x <= b:
            return (x - a) / (b - a) if (b - a) != 0 else 1.0
        else: # b < x < c
            return (c - x) / (c - b) if (c - b) != 0 else 1.0

    @staticmethod
    def _trapezoidal(x: float, a: float, b: float, c: float, d: float) -> float:
        """Trapezoidal membership function parameterized by (a, b, c, d)."""
        if x <= a or x >= d:
            return 0.0
        elif a < x <= b:
            return (x - a) / (b - a) if (b - a) != 0 else 1.0
        elif b < x <= c:
            return 1.0
        else: # c < x < d
            return (d - x) / (d - c) if (d - c) != 0 else 1.0

    @classmethod
    def evaluate_severity_membership(cls, severity: float) -> Dict[str, float]:
        """
        Maps severity (1.0 to 10.0 scale) into four fuzzy linguistic variables:
        Mild, Moderate, Severe, Critical.
        """
        severity = max(1.0, min(10.0, float(severity)))
        
        mu_mild = cls._trapezoidal(severity, 0.0, 1.0, 2.5, 4.0)
        mu_moderate = cls._triangular(severity, 2.5, 5.0, 7.5)
        mu_severe = cls._triangular(severity, 5.5, 7.5, 9.2)
        mu_critical = cls._trapezoidal(severity, 7.8, 9.0, 10.0, 10.5)

        return {
            "mild": round(mu_mild, 3),
            "moderate": round(mu_moderate, 3),
            "severe": round(mu_severe, 3),
            "critical": round(mu_critical, 3),
        }

    @classmethod
    def evaluate_urgency_membership(cls, urgency_label: str) -> Dict[str, float]:
        """
        Converts clinical urgency category into fuzzy membership degrees.
        """
        label = urgency_label.strip().lower()
        mapping = {
            "non-urgent": {"non_urgent": 0.95, "semi_urgent": 0.15, "urgent": 0.0, "immediate": 0.0},
            "semi-urgent": {"non_urgent": 0.20, "semi_urgent": 0.90, "urgent": 0.25, "immediate": 0.0},
            "urgent": {"non_urgent": 0.0, "semi_urgent": 0.25, "urgent": 0.92, "immediate": 0.30},
            "emergency": {"non_urgent": 0.0, "semi_urgent": 0.0, "urgent": 0.25, "immediate": 0.98},
            "immediate": {"non_urgent": 0.0, "semi_urgent": 0.0, "urgent": 0.20, "immediate": 1.0},
        }
        return mapping.get(label, {"non_urgent": 0.1, "semi_urgent": 0.4, "urgent": 0.5, "immediate": 0.2})

    @classmethod
    def compute_composite_clinical_score(
        cls,
        severity: float,
        urgency_label: str,
        base_match_cf: float
    ) -> Dict[str, Any]:
        """
        Defuzzifies severity and urgency alongside certainty factor into a
        transparent, continuous Decision Score in [0.0, 100.0]%.
        
        Formula:
        Defuzzified Severity Centroid = sum(mu_i * C_i) / sum(mu_i)
        Where C_mild=20, C_moderate=50, C_severe=80, C_critical=100.
        """
        sev_memberships = cls.evaluate_severity_membership(severity)
        urg_memberships = cls.evaluate_urgency_membership(urgency_label)
        
        # Defuzzification centroids
        c_mild = 20.0
        c_moderate = 50.0
        c_severe = 80.0
        c_critical = 100.0
        
        numerator = (
            sev_memberships["mild"] * c_mild +
            sev_memberships["moderate"] * c_moderate +
            sev_memberships["severe"] * c_severe +
            sev_memberships["critical"] * c_critical
        )
        denominator = sum(sev_memberships.values())
        defuzzified_severity = numerator / denominator if denominator > 0 else 50.0

        # Urgency weight: immediate gives higher weighting
        urgency_weight = (
            urg_memberships["non_urgent"] * 0.25 +
            urg_memberships["semi_urgent"] * 0.50 +
            urg_memberships["urgent"] * 0.80 +
            urg_memberships["immediate"] * 1.00
        )

        # Base CF contributes directly to symptom-department alignment
        cf_positive = max(0.0, base_match_cf)
        
        # Blended final decision score
        final_score = (cf_positive * 55.0) + (defuzzified_severity * 0.25) + (urgency_weight * 20.0)
        final_score = round(min(99.5, max(15.0, final_score)), 1)

        return {
            "decision_score": final_score,
            "defuzzified_severity": round(defuzzified_severity, 2),
            "urgency_weight": round(urgency_weight, 3),
            "severity_memberships": sev_memberships,
            "urgency_memberships": urg_memberships
        }

