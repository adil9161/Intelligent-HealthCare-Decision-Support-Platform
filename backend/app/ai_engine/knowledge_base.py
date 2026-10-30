"""
Knowledge Base for AegisHealth AI Decision Support Platform
Aligned with B.Tech CSE AI Curriculum (NIET Greater Noida, Dr. Mohd. Nazim, SDG 3)

Contains structured clinical knowledge of:
1. Hospital Departments & Target Facilities
2. Symptom Ontology with Primary/Secondary associations and Rule Weights
3. Red-flag clinical triggers
"""

from typing import Dict, List, Any

# Clinical Departments Master Catalog
DEPARTMENTS: Dict[str, Dict[str, Any]] = {
    "Cardiology": {
        "code": "CARD",
        "name": "Cardiology Care Center",
        "floor": "Floor 2 - Wing A",
        "icon": "HeartPulse",
        "description": "Acute and chronic cardiovascular conditions, ischemic heart diseases, arrhythmias, and cardiac catheterization.",
        "primary_symptoms": [
            {"symptom": "Chest Pain (Retrosternal / Crushing)", "weight": 0.95, "cf": 0.90},
            {"symptom": "Pain Radiating to Left Arm / Jaw", "weight": 0.90, "cf": 0.88},
            {"symptom": "Diaphoresis (Profuse Cold Sweats)", "weight": 0.85, "cf": 0.82},
            {"symptom": "Cardiac Palpitations", "weight": 0.75, "cf": 0.70},
            {"symptom": "Dyspnea on Exertion", "weight": 0.70, "cf": 0.65},
            {"symptom": "Syncope / Sudden Unexplained Fainting", "weight": 0.80, "cf": 0.75},
            {"symptom": "Severe Peripheral Bilateral Edema", "weight": 0.60, "cf": 0.55},
        ],
        "red_flag_triggers": ["Crushing Retrosternal Chest Pain", "Pain Radiating to Left Arm / Jaw", "Diaphoresis (Profuse Cold Sweats)"],
        "critical_resources": ["Cath Lab", "Cardiac ICU Beds", "Defibrillators", "Troponin Rapid Kits", "Nitroglycerin Infusions"]
    },
    "Neurology": {
        "code": "NEUR",
        "name": "Neurology & Comprehensive Stroke Unit",
        "floor": "Floor 3 - Wing B",
        "icon": "Brain",
        "description": "Acute cerebrovascular events (ischemic/hemorrhagic stroke), seizures, neuropathies, and cognitive impairments.",
        "primary_symptoms": [
            {"symptom": "Sudden Unilateral Facial Droop", "weight": 0.95, "cf": 0.92},
            {"symptom": "Unilateral Arm or Leg Weakness (Hemiparesis)", "weight": 0.95, "cf": 0.92},
            {"symptom": "Slurred Speech / Dysphasia", "weight": 0.90, "cf": 0.88},
            {"symptom": "Thunderclap Severe Sudden Headache", "weight": 0.85, "cf": 0.80},
            {"symptom": "Generalized Tonic-Clonic Seizures", "weight": 0.90, "cf": 0.85},
            {"symptom": "Ataxia / Sudden Acute Loss of Balance", "weight": 0.75, "cf": 0.70},
            {"symptom": "Altered Mental Status / Disorientation", "weight": 0.70, "cf": 0.65},
        ],
        "red_flag_triggers": ["Sudden Unilateral Facial Droop", "Slurred Speech / Dysphasia", "Thunderclap Severe Sudden Headache"],
        "critical_resources": ["Emergency CT/MRI Scanner", "Neuro-ICU Beds", "Thrombolytic (tPA) Stocks", "Intracranial Pressure Monitors"]
    },
    "Pulmonology": {
        "code": "PULM",
        "name": "Pulmonology & Respiratory Critical Care",
        "floor": "Floor 2 - Wing C",
        "icon": "Wind",
        "description": "Severe respiratory distress, chronic obstructive pulmonary disease (COPD), pneumonia, asthma exacerbations, and ARDS.",
        "primary_symptoms": [
            {"symptom": "Severe Shortness of Breath / Dyspnea at Rest", "weight": 0.92, "cf": 0.88},
            {"symptom": "Stridor / Audible High-Pitched Wheezing", "weight": 0.88, "cf": 0.82},
            {"symptom": "Low SpO2 Saturation (<92%)", "weight": 0.95, "cf": 0.90},
            {"symptom": "Hemoptysis (Coughing Blood)", "weight": 0.85, "cf": 0.80},
            {"symptom": "Persistent Purulent Productive Cough", "weight": 0.65, "cf": 0.60},
            {"symptom": "Pleuritic Sharp Chest Pain on Deep Inspiration", "weight": 0.70, "cf": 0.68},
            {"symptom": "Central Cyanosis (Bluish Lips/Nails)", "weight": 0.92, "cf": 0.89},
        ],
        "red_flag_triggers": ["Low SpO2 Saturation (<92%)", "Central Cyanosis (Bluish Lips/Nails)", "Stridor / Audible High-Pitched Wheezing"],
        "critical_resources": ["Mechanical Ventilators", "BiPAP/CPAP Systems", "High-Flow Oxygen Cannulas", "Nebulization Stations", "Bronchoscopy Suite"]
    },
    "Emergency": {
        "code": "EMER",
        "name": "Emergency Trauma Bay & Resuscitation",
        "floor": "Ground Floor - Immediate Access",
        "icon": "Flame",
        "description": "Life-threatening physiological decompensation, polytrauma, massive hemorrhages, and acute cardiopulmonary arrests.",
        "primary_symptoms": [
            {"symptom": "Massive External Hemorrhage / Arterial Bleed", "weight": 0.98, "cf": 0.96},
            {"symptom": "Loss of Consciousness / Unresponsive (GCS < 8)", "weight": 0.98, "cf": 0.95},
            {"symptom": "High-Velocity Road Traffic Polytrauma", "weight": 0.95, "cf": 0.92},
            {"symptom": "Acute Anaphylaxis / Airway Angioedema", "weight": 0.96, "cf": 0.94},
            {"symptom": "Deep Puncture or Penetrating Thoracoabdominal Wound", "weight": 0.94, "cf": 0.90},
            {"symptom": "Profound Circulatory Shock (Cold Clammy Shock)", "weight": 0.95, "cf": 0.92},
        ],
        "red_flag_triggers": ["Massive External Hemorrhage / Arterial Bleed", "Loss of Consciousness / Unresponsive (GCS < 8)", "Acute Anaphylaxis / Airway Angioedema"],
        "critical_resources": ["Resuscitation Trauma Bay", "Rapid Infuser", "Universal Donor Blood (O-)", "Emergency Surgical Trays", "Suture Kits"]
    },
    "Orthopedics": {
        "code": "ORTH",
        "name": "Orthopedics & Musculoskeletal Trauma",
        "floor": "Floor 1 - Wing B",
        "icon": "Bone",
        "description": "Fractures, joint dislocations, severe ligament tears, spinal injuries, and acute limb compartment syndrome.",
        "primary_symptoms": [
            {"symptom": "Compound Open Fracture with Exposed Bone", "weight": 0.96, "cf": 0.94},
            {"symptom": "Severe Bone Deformity and Angulation", "weight": 0.90, "cf": 0.88},
            {"symptom": "Complete Inability to Bear Weight", "weight": 0.78, "cf": 0.72},
            {"symptom": "Acute Joint Dislocation with Visible Asymmetry", "weight": 0.88, "cf": 0.85},
            {"symptom": "Intense Bone Pain Post-Fall", "weight": 0.82, "cf": 0.78},
            {"symptom": "Acute Tense Swelling and Pain on Passive Stretch (Compartment Concern)", "weight": 0.92, "cf": 0.89},
        ],
        "red_flag_triggers": ["Compound Open Fracture with Exposed Bone", "Acute Tense Swelling and Pain on Passive Stretch (Compartment Concern)"],
        "critical_resources": ["Digital Orthopedic X-Ray", "Closed Reduction Bay", "C-Arm Fluoroscopy", "Pneumatic Tourniquets", "Plaster Splinting Room"]
    },
    "Gastroenterology": {
        "code": "GAST",
        "name": "Gastroenterology & Hepatology",
        "floor": "Floor 3 - Wing A",
        "icon": "Stomach",
        "description": "Acute abdomen, gastrointestinal hemorrhages, severe pancreatitis, biliary colic, and hepatic decompensation.",
        "primary_symptoms": [
            {"symptom": "Hematemesis (Vomiting Coffee-Ground Blood)", "weight": 0.94, "cf": 0.90},
            {"symptom": "Melena (Black Tarry Stools)", "weight": 0.88, "cf": 0.84},
            {"symptom": "Severe Rigid Board-like Abdominal Guarding", "weight": 0.92, "cf": 0.88},
            {"symptom": "Acute Epigastric Pain Radiating to the Back", "weight": 0.85, "cf": 0.80},
            {"symptom": "Deep Scleral Jaundice (Yellow Eyes / Skin)", "weight": 0.75, "cf": 0.70},
            {"symptom": "Intractable Non-stop Bilious Vomiting", "weight": 0.78, "cf": 0.72},
        ],
        "red_flag_triggers": ["Hematemesis (Vomiting Coffee-Ground Blood)", "Severe Rigid Board-like Abdominal Guarding"],
        "critical_resources": ["Emergency Endoscopy Console", "NG Tubes", "Proton Pump Inhibitor Infusions", "Sengstaken-Blakemore Tube"]
    },
    "Nephrology": {
        "code": "NEPH",
        "name": "Nephrology & Dialysis Care Center",
        "floor": "Floor 4 - Wing C",
        "icon": "Activity",
        "description": "Acute kidney injury, severe hyperkalemia, end-stage renal disease, and uremic encephalopathy.",
        "primary_symptoms": [
            {"symptom": "Oliguria or Complete Anuria (<100ml urine in 24h)", "weight": 0.92, "cf": 0.89},
            {"symptom": "Frank Gross Hematuria with Blood Clots", "weight": 0.86, "cf": 0.82},
            {"symptom": "Severe Generalized Uremic Pruritus and Frosted Breath", "weight": 0.75, "cf": 0.70},
            {"symptom": "Bilateral Refractory Lower Limb and Periorbital Edema", "weight": 0.80, "cf": 0.75},
            {"symptom": "Acute Bilateral Flank Pain with Costovertebral Tenderness", "weight": 0.78, "cf": 0.74},
        ],
        "red_flag_triggers": ["Oliguria or Complete Anuria (<100ml urine in 24h)"],
        "critical_resources": ["Hemodialysis Machines", "CRRT Equipment", "Dialyzers", "Kayexalate / Insulin-Dextrose Packs"]
    },
    "Pediatrics": {
        "code": "PEDI",
        "name": "Pediatrics & Neonatal Intensive Care",
        "floor": "Floor 1 - Wing A",
        "icon": "Baby",
        "description": "Comprehensive medical care for neonates, infants, children, and adolescents under age 14.",
        "primary_symptoms": [
            {"symptom": "Neonatal High Fever (>101 F in infant under 3 months)", "weight": 0.95, "cf": 0.92},
            {"symptom": "Pediatric Febrile Seizure", "weight": 0.90, "cf": 0.86},
            {"symptom": "Severe Lethargy and Inability to Feed in Child", "weight": 0.92, "cf": 0.88},
            {"symptom": "Pediatric Barking Cough (Croup / Stridor)", "weight": 0.85, "cf": 0.80},
            {"symptom": "Sunken Eyes and Depressed Fontanelle (Severe Dehydration)", "weight": 0.88, "cf": 0.84},
        ],
        "red_flag_triggers": ["Neonatal High Fever (>101 F in infant under 3 months)", "Severe Lethargy and Inability to Feed in Child"],
        "critical_resources": ["NICU/PICU Incubators", "Pediatric Resuscitation Broselow Tape", "Pediatric Dosing Pumps", "Micro-cannulas"]
    },
    "General Medicine": {
        "code": "GENM",
        "name": "General Internal Medicine & Preventive Health",
        "floor": "Floor 1 - Wing C",
        "icon": "Stethoscope",
        "description": "Primary adult consultations, non-acute systemic symptoms, lifestyle illnesses, and unexplained constitutional malaise.",
        "primary_symptoms": [
            {"symptom": "Moderate Intermittent Fever with Chills (<3 days)", "weight": 0.70, "cf": 0.65},
            {"symptom": "Generalized Chronic Fatigue and Body Aches", "weight": 0.60, "cf": 0.55},
            {"symptom": "Mild Cough and Sore Throat", "weight": 0.55, "cf": 0.50},
            {"symptom": "Mild Tension Headache", "weight": 0.50, "cf": 0.45},
            {"symptom": "Mild Dyspepsia / Heartburn", "weight": 0.50, "cf": 0.45},
            {"symptom": "Unintentional Weight Loss over 6 Months", "weight": 0.65, "cf": 0.60},
        ],
        "red_flag_triggers": [],
        "critical_resources": ["Standard Examination Suites", "Diagnostic Lab Phlebotomy", "ECG Machines", "Glucometers"]
    }
}

# Flat list of all recognizable symptoms with normalized identifiers
ALL_SYMPTOMS: List[str] = [
    # Cardiovascular
    "Chest Pain (Retrosternal / Crushing)",
    "Pain Radiating to Left Arm / Jaw",
    "Diaphoresis (Profuse Cold Sweats)",
    "Cardiac Palpitations",
    "Dyspnea on Exertion",
    "Syncope / Sudden Unexplained Fainting",
    "Severe Peripheral Bilateral Edema",
    # Neurological
    "Sudden Unilateral Facial Droop",
    "Unilateral Arm or Leg Weakness (Hemiparesis)",
    "Slurred Speech / Dysphasia",
    "Thunderclap Severe Sudden Headache",
    "Generalized Tonic-Clonic Seizures",
    "Ataxia / Sudden Acute Loss of Balance",
    "Altered Mental Status / Disorientation",
    # Respiratory
    "Severe Shortness of Breath / Dyspnea at Rest",
    "Stridor / Audible High-Pitched Wheezing",
    "Low SpO2 Saturation (<92%)",
    "Hemoptysis (Coughing Blood)",
    "Persistent Purulent Productive Cough",
    "Pleuritic Sharp Chest Pain on Deep Inspiration",
    "Central Cyanosis (Bluish Lips/Nails)",
    # Trauma & Critical Emergency
    "Massive External Hemorrhage / Arterial Bleed",
    "Loss of Consciousness / Unresponsive (GCS < 8)",
    "High-Velocity Road Traffic Polytrauma",
    "Acute Anaphylaxis / Airway Angioedema",
    "Deep Puncture or Penetrating Thoracoabdominal Wound",
    "Profound Circulatory Shock (Cold Clammy Shock)",
    # Orthopedic
    "Compound Open Fracture with Exposed Bone",
    "Severe Bone Deformity and Angulation",
    "Complete Inability to Bear Weight",
    "Acute Joint Dislocation with Visible Asymmetry",
    "Intense Bone Pain Post-Fall",
    "Acute Tense Swelling and Pain on Passive Stretch (Compartment Concern)",
    # Gastrointestinal
    "Hematemesis (Vomiting Coffee-Ground Blood)",
    "Melena (Black Tarry Stools)",
    "Severe Rigid Board-like Abdominal Guarding",
    "Acute Epigastric Pain Radiating to the Back",
    "Deep Scleral Jaundice (Yellow Eyes / Skin)",
    "Intractable Non-stop Bilious Vomiting",
    # Renal
    "Oliguria or Complete Anuria (<100ml urine in 24h)",
    "Frank Gross Hematuria with Blood Clots",
    "Severe Generalized Uremic Pruritus and Frosted Breath",
    "Bilateral Refractory Lower Limb and Periorbital Edema",
    "Acute Bilateral Flank Pain with Costovertebral Tenderness",
    # Pediatric
    "Neonatal High Fever (>101 F in infant under 3 months)",
    "Pediatric Febrile Seizure",
    "Severe Lethargy and Inability to Feed in Child",
    "Pediatric Barking Cough (Croup / Stridor)",
    "Sunken Eyes and Depressed Fontanelle (Severe Dehydration)",
    # General
    "Moderate Intermittent Fever with Chills (<3 days)",
    "Generalized Chronic Fatigue and Body Aches",
    "Mild Cough and Sore Throat",
    "Mild Tension Headache",
    "Mild Dyspepsia / Heartburn",
    "Unintentional Weight Loss over 6 Months"
]

