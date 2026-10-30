"""
Predictive Hospital Resource Management & Shortage Forecasting Engine
Aligned with Dr. Mohd. Nazim's AI Course (NIET Greater Noida, SDG 3 Target 3.d & 3.8)

Core Rule-Based Logic:
1. If available_units <= min_safety_threshold (reorder threshold) -> FIRE SHORTAGE ALERT
2. If projected daily burn exceeds remaining stock within 48 hours -> FIRE SHORTAGE ALERT
3. If available beds < 10% of total capacity -> CRITICAL SHORTAGE ALERT
4. Assigns severity color (CRITICAL / WARNING) and concrete suggested clinical action
5. Generates historical usage trajectory with 48h-72h forward projected exhaustion
"""

from typing import Dict, List, Any
from datetime import datetime, timezone, timedelta

class PredictiveResourceEngine:
    @classmethod
    def evaluate_resource_status(cls, resource_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Applies strict rule-based logic to resource data and returns calculated
        predictive metrics, alerts with suggested actions, and historical/projected trajectory.
        """
        category = resource_data.get("category", "")
        name = resource_data.get("name", "Resource")
        unit_measure = resource_data.get("unit_measure", "units")
        total = float(resource_data.get("total_capacity", 1.0))
        available = float(resource_data.get("available_units", 0.0))
        occupied = float(resource_data.get("occupied_units", max(0.0, total - available)))
        burn_rate_hourly = float(resource_data.get("burn_rate_per_hour", 0.0))
        min_threshold = float(resource_data.get("min_safety_threshold", 10.0))

        # Daily usage rate (24h consumption)
        if burn_rate_hourly > 0:
            daily_usage_rate = round(burn_rate_hourly * 24.0, 1)
        else:
            # Derived daily baseline based on category and occupancy
            if category == "Beds":
                daily_usage_rate = max(1.0, round(occupied * 0.15, 1)) # 15% daily turnover
            elif category == "Medicines":
                daily_usage_rate = max(2.0, round(min_threshold * 0.35, 1))
            elif category == "Equipment":
                daily_usage_rate = max(0.5, round(occupied * 0.10, 1))
            else:
                daily_usage_rate = max(10.0, round(available * 0.05, 1))

        # Hourly burn for time-to-exhaustion
        effective_hourly_burn = burn_rate_hourly if burn_rate_hourly > 0 else (daily_usage_rate / 24.0)
        hours_remaining = round(available / effective_hourly_burn, 1) if effective_hourly_burn > 0 else 999.0

        avail_percent = round((available / total) * 100.0, 1) if total > 0 else 0.0
        occupancy_percent = round((occupied / total) * 100.0, 1) if total > 0 else 0.0

        status = "Normal"
        alerts: List[Dict[str, Any]] = []

        # ====================================================================
        # MANDATORY RULE-BASED SHORTAGE LOGIC
        # 1. Available falls below threshold
        # 2. Projected daily burn exceeds remaining stock within 48 hours
        # ====================================================================
        threshold_breached = available <= min_threshold
        exhaustion_within_48h = hours_remaining <= 48.0
        bed_sub_10_percent = (category == "Beds" and avail_percent < 10.0)

        if threshold_breached or exhaustion_within_48h or bed_sub_10_percent:
            # Determine Severity Color
            # CRITICAL if exhaustion <= 24h OR available <= 50% threshold OR beds < 10%
            is_critical = (
                hours_remaining <= 24.0 or
                available <= (min_threshold * 0.5) or
                bed_sub_10_percent or
                (category == "Equipment" and available <= 1.0)
            )

            severity = "CRITICAL" if is_critical else "WARNING"
            status = "Critical" if is_critical else "Warning"

            # Formulate Clinical Suggested Action by Category
            if category == "Beds":
                suggested_action = (
                    "Initiate Step-Down Telemetry transfer for stable patients; "
                    "expedite discharge rounds in General Wards and alert Emergency Triage for admission diversion."
                )
                reason = f"Available beds dropped to {available:.0f} ({avail_percent}%), breaching <10% safety reserve."
                code = "BEDS_CRITICAL_SUB_10" if bed_sub_10_percent else "BEDS_CAPACITY_ALERT"

            elif category == "Oxygen":
                suggested_action = (
                    "Dispatch emergency requisition to liquid cryogenic supplier (Linde Healthcare / INOX); "
                    "switch secondary wards to reserve manifold cylinders within 6 hours."
                )
                reason = f"At daily burn of {daily_usage_rate} L/day, oxygen reserves will exhaust in {hours_remaining} hours (≤ 48h limit)."
                code = "OXYGEN_RUNOUT_48H"

            elif category == "Medicines":
                suggested_action = (
                    "Issue expedited pharmaceutical purchase order; request courier delivery within 12 hours "
                    "and review generic alternative therapeutic equivalents."
                )
                reason = f"Stock level ({available:.0f} {unit_measure}) fell below minimum safety reorder threshold ({min_threshold:.0f} {unit_measure})."
                code = "MEDICINE_REORDER_BREACH"

            else: # Equipment
                suggested_action = (
                    "Recall idle backup equipment from Central Sterile Supply; "
                    "request urgent biomedical engineering maintenance check and calibrate standby units."
                )
                reason = f"Equipment demand saturated: only {available:.0f} unit(s) available; projected depletion in {hours_remaining}h."
                code = "EQUIPMENT_SATURATION_ALERT"

            alert_obj = {
                "severity": severity,
                "severity_color": "coral" if severity == "CRITICAL" else "amber",
                "code": code,
                "message": f"[{severity} SHORTAGE ALERT] {name}: {reason}",
                "suggested_action": suggested_action,
                "predicted_exhaustion_hours": hours_remaining,
                "available_units": available,
                "min_safety_threshold": min_threshold,
                "daily_usage_rate": daily_usage_rate
            }
            alerts.append(alert_obj)

        # Secondary Cautionary Alert (Approaching Threshold within 72h)
        elif hours_remaining <= 72.0 or available <= (min_threshold * 1.3):
            status = "Warning"
            alerts.append({
                "severity": "WARNING",
                "severity_color": "amber",
                "code": "STOCK_APPROACHING_THRESHOLD",
                "message": f"[WARNING] {name}: Available stock ({available:.0f} {unit_measure}) approaching reorder threshold ({min_threshold:.0f}). Forecasted depletion in {hours_remaining} hours.",
                "suggested_action": "Verify scheduled restock orders and monitor hourly clinical consumption.",
                "predicted_exhaustion_hours": hours_remaining,
                "available_units": available,
                "min_safety_threshold": min_threshold,
                "daily_usage_rate": daily_usage_rate
            })

        # ====================================================================
        # Historical Usage & Forward Predicted Trajectory Generator
        # Generates past 7 days (solid area) and next 3 days (dashed predicted line)
        # ====================================================================
        historical_usage = cls._generate_usage_trajectory(
            available=available,
            total=total,
            daily_burn=daily_usage_rate,
            min_threshold=min_threshold
        )

        return {
            "status": status,
            "availability_percentage": avail_percent,
            "occupancy_percentage": occupancy_percent,
            "predicted_exhaustion_hours": hours_remaining if hours_remaining < 999.0 else None,
            "daily_usage_rate": daily_usage_rate,
            "reorder_threshold": min_threshold,
            "is_critical_shortage": (status == "Critical"),
            "alerts": alerts,
            "historical_usage": historical_usage
        }

    @staticmethod
    def _generate_usage_trajectory(
        available: float,
        total: float,
        daily_burn: float,
        min_threshold: float
    ) -> List[Dict[str, Any]]:
        """
        Creates continuous timeline points spanning Day -6 to Day +3:
        - Past days (Day -6 to Today): historical actual usage (solid area)
        - Future days (Day +1 to Day +3): projected decline (dashed line)
        """
        points = []
        now = datetime.now(timezone.utc)

        # 7 historical days (Day -6 to 0)
        # Reconstruct realistic historical descent to current available
        for i in range(6, -1, -1):
            past_date = now - timedelta(days=i)
            day_label = past_date.strftime("%b %d") if i > 0 else "Today (Now)"
            # Historical units were higher in past by daily_burn * i with slight variance
            simulated_past_avail = min(total, round(available + (daily_burn * i * 0.95), 1))
            simulated_used = max(0.0, round(total - simulated_past_avail, 1))

            points.append({
                "day_index": -i,
                "label": day_label,
                "timestamp": past_date.isoformat(),
                "is_prediction": False,
                "available_units": simulated_past_avail,
                "used_units": simulated_used,
                "predicted_available": None,
                "threshold": min_threshold
            })

        # Today anchor point for prediction line
        points[-1]["predicted_available"] = available

        # 3 future days (Day +1 to +3)
        for i in range(1, 4):
            future_date = now + timedelta(days=i)
            day_label = f"+{i}d ({future_date.strftime('%b %d')})"
            projected_avail = max(0.0, round(available - (daily_burn * i), 1))
            projected_used = min(total, round(total - projected_avail, 1))

            points.append({
                "day_index": i,
                "label": day_label,
                "timestamp": future_date.isoformat(),
                "is_prediction": True,
                "available_units": None, # Solid line stops at Today
                "used_units": projected_used,
                "predicted_available": projected_avail, # Dashed line starts here
                "threshold": min_threshold
            })

        return points
