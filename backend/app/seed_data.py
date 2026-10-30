"""
Seed Data Script for AegisHealth AI Decision Support Platform
Populates initial clinical data, accounts, patients, staff, and resources
Course: B.Tech CSE AI (NIET Greater Noida, Dr. Mohd. Nazim, SDG 3)
"""

from datetime import datetime, timezone
from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.patient import Patient
from app.models.staff import Staff
from app.models.resource import Resource
from app.models.audit import AuditLog
from app.core.security import hash_password
from app.ai_engine.inference import ClinicalInferenceEngine

def seed_database():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if users already exist
        if db.query(User).first():
            print("Database already seeded with users. Skipping seed.")
            return

        print("Seeding Users...")
        # 1. Users (Admin, Doctor, Staff)
        users = [
            User(
                email="admin@niet.ac.in",
                hashed_password=hash_password("Admin@123"),
                full_name="Administrator - NIET AI Labs",
                role="admin",
                department="Hospital Operations",
                is_active=True
            ),
            User(
                email="dr.nazim@niet.ac.in",
                hashed_password=hash_password("Doctor@123"),
                full_name="Dr. Mohd. Nazim, MD",
                role="doctor",
                department="Cardiology",
                is_active=True
            ),
            User(
                email="nurse.priya@niet.ac.in",
                hashed_password=hash_password("Staff@123"),
                full_name="Priya Sharma, RN",
                role="staff",
                department="Emergency",
                is_active=True
            )
        ]
        db.add_all(users)
        db.commit()

        print("Seeding Staff...")
        # 2. Staff Members
        staff_members = [
            Staff(
                staff_id="ST-201",
                name="Dr. Mohd. Nazim",
                department="Cardiology",
                role="Doctor",
                salary=180000.0,
                attendance="Present",
                attendance_percentage=98.5,
                availability="Available",
                shift="Morning",
                current_patient_load=4,
                email="dr.nazim@niet.ac.in",
                phone="+91 98765 43210",
                qualification="MD (Medicine), DM (Cardiology), FACC"
            ),
            Staff(
                staff_id="ST-202",
                name="Dr. Rajesh Verma",
                department="Neurology",
                role="Doctor",
                salary=175000.0,
                attendance="Present",
                attendance_percentage=94.0,
                availability="Available",
                shift="Morning",
                current_patient_load=3,
                email="dr.verma@niet.ac.in",
                phone="+91 98765 43211",
                qualification="MD, DM (Neurology)"
            ),
            Staff(
                staff_id="ST-203",
                name="Dr. Ananya Iyer",
                department="Emergency",
                role="Surgeon",
                salary=195000.0,
                attendance="Present",
                attendance_percentage=99.0,
                availability="Busy",
                shift="Morning",
                current_patient_load=6,
                email="dr.iyer@niet.ac.in",
                phone="+91 98765 43212",
                qualification="MS (General Surgery), MCh (Trauma Surgery)"
            ),
            Staff(
                staff_id="ST-204",
                name="Dr. Sameer Khan",
                department="Pulmonology",
                role="Doctor",
                salary=165000.0,
                attendance="Present",
                attendance_percentage=91.5,
                availability="Available",
                shift="Evening",
                current_patient_load=2,
                email="dr.khan@niet.ac.in",
                phone="+91 98765 43213",
                qualification="MD (Pulmonary Medicine), FICP"
            ),
            Staff(
                staff_id="ST-205",
                name="Dr. Kavita Nair",
                department="Pediatrics",
                role="Doctor",
                salary=160000.0,
                attendance="Present",
                attendance_percentage=93.0,
                availability="Available",
                shift="Morning",
                current_patient_load=3,
                email="dr.nair@niet.ac.in",
                phone="+91 98765 43214",
                qualification="MD (Pediatrics), Fellowship in Neonatology"
            ),
            Staff(
                staff_id="ST-206",
                name="Dr. Amit Deshmukh",
                department="Orthopedics",
                role="Surgeon",
                salary=185000.0,
                attendance="Present",
                attendance_percentage=76.0,
                availability="Busy",
                shift="Morning",
                current_patient_load=5,
                email="dr.deshmukh@niet.ac.in",
                phone="+91 98765 43215",
                qualification="MS (Orthopedics), Joint Replacement Specialist"
            ),
            Staff(
                staff_id="ST-207",
                name="Priya Sharma, RN",
                department="Emergency",
                role="Nurse",
                salary=65000.0,
                attendance="Present",
                attendance_percentage=97.0,
                availability="Available",
                shift="Morning",
                current_patient_load=5,
                email="nurse.priya@niet.ac.in",
                phone="+91 98765 43216",
                qualification="B.Sc Nursing, BLS/ACLS Certified"
            ),
            Staff(
                staff_id="ST-208",
                name="Arjun Mehta, RN",
                department="Cardiology",
                role="Nurse",
                salary=62000.0,
                attendance="Present",
                attendance_percentage=95.5,
                availability="Busy",
                shift="Morning",
                current_patient_load=4,
                email="arjun.m@niet.ac.in",
                phone="+91 98765 43217",
                qualification="Post-Basic B.Sc Nursing, Cardiac Telemetry Specialist"
            ),
            Staff(
                staff_id="ST-209",
                name="Deepak Joshi",
                department="Pulmonology",
                role="Technician",
                salary=50000.0,
                attendance="Present",
                attendance_percentage=89.0,
                availability="Available",
                shift="Morning",
                current_patient_load=0,
                email="deepak.j@niet.ac.in",
                phone="+91 98765 43218",
                qualification="Diploma in Respiratory Therapy & Mechanical Ventilation"
            ),
            Staff(
                staff_id="ST-210",
                name="Sneha Kulkarni",
                department="Neurology",
                role="Radiologist",
                salary=140000.0,
                attendance="Present",
                attendance_percentage=92.5,
                availability="Available",
                shift="Evening",
                current_patient_load=1,
                email="sneha.k@niet.ac.in",
                phone="+91 98765 43219",
                qualification="MD (Radio-diagnosis)"
            ),
            Staff(
                staff_id="ST-211",
                name="Rameshwar Singh",
                department="Hospital Operations",
                role="Administrator",
                salary=110000.0,
                attendance="Present",
                attendance_percentage=98.0,
                availability="Available",
                shift="Morning",
                current_patient_load=0,
                email="rameshwar.s@niet.ac.in",
                phone="+91 98765 43220",
                qualification="MBA in Hospital and Healthcare Management"
            ),
            Staff(
                staff_id="ST-212",
                name="Meera Pillai, RN",
                department="Pediatrics",
                role="Nurse",
                salary=60000.0,
                attendance="On Leave",
                attendance_percentage=68.5,
                availability="Busy",
                shift="Night",
                current_patient_load=0,
                email="meera.p@niet.ac.in",
                phone="+91 98765 43221",
                qualification="GNM, Pediatric ICU Certified"
            )
        ]
        db.add_all(staff_members)
        db.commit()

        print("Seeding Resources & Triggering Predictive Logic...")
        # 3. Resources (Beds, Oxygen, Medicines, Equipment)
        # Includes intentional critical threshold drops to demonstrate predictive alerts!
        resources = [
            # BEDS: ICU Beds at 3/40 = 7.5% (< 10% critical alert rule!)
            Resource(
                resource_id="RES-BED-ICU",
                name="ICU Advanced Life-Support Beds",
                category="Beds",
                department="Critical Care / ICU",
                total_capacity=40.0,
                available_units=3.0, # 7.5% -> CRITICAL SHORTAGE!
                occupied_units=37.0,
                unit_measure="beds",
                burn_rate_per_hour=0.2,
                min_safety_threshold=10.0, # alert when < 10%
                status="Critical",
                notes="CRITICAL ALERT: Bed availability dropped to 7.5% (< 10% capacity threshold). Non-critical admissions diverted."
            ),
            Resource(
                resource_id="RES-BED-TRAUMA",
                name="Emergency Trauma Resuscitation Bays",
                category="Beds",
                department="Emergency",
                total_capacity=25.0,
                available_units=4.0, # 16% -> Elevated Warning
                occupied_units=21.0,
                unit_measure="beds",
                burn_rate_per_hour=0.5,
                min_safety_threshold=15.0,
                status="Warning",
                notes="Elevated trauma influx following NH-24 vehicular accident report."
            ),
            Resource(
                resource_id="RES-BED-GENMED",
                name="General Inpatient Medical Ward Beds",
                category="Beds",
                department="General Medicine",
                total_capacity=150.0,
                available_units=42.0, # 28% -> Normal
                occupied_units=108.0,
                unit_measure="beds",
                burn_rate_per_hour=0.8,
                min_safety_threshold=10.0,
                status="Normal",
                notes="Stable ward capacity. 6 patients scheduled for discharge today."
            ),
            Resource(
                resource_id="RES-BED-PED",
                name="Pediatric & Neonatal Beds",
                category="Beds",
                department="Pediatrics",
                total_capacity=30.0,
                available_units=8.0, # 26.6% -> Normal
                occupied_units=22.0,
                unit_measure="beds",
                burn_rate_per_hour=0.1,
                min_safety_threshold=10.0,
                status="Normal",
                notes="Adequate pediatric capacity across PICU and step-down."
            ),
            # OXYGEN: 1800 Liters with 160 L/hr burn rate = 11.2 hours remaining (< 12h alert!)
            Resource(
                resource_id="RES-O2-CENTRAL",
                name="Central Cryogenic Liquid Medical Oxygen Tank",
                category="Oxygen",
                department="Hospital Operations",
                total_capacity=10000.0,
                available_units=1800.0,
                occupied_units=8200.0,
                unit_measure="liters",
                burn_rate_per_hour=160.0, # 1800 / 160 = 11.25 hours left (<12h Critical Alert!)
                min_safety_threshold=15.0,
                status="Critical",
                notes="FORECAST ALERT: 11.2 hours remaining at current ICU consumption rate. Cryogenic tanker requested."
            ),
            Resource(
                resource_id="RES-O2-PORTABLE",
                name="Emergency Type-D Oxygen Cylinders",
                category="Oxygen",
                department="Emergency",
                total_capacity=60.0,
                available_units=18.0,
                occupied_units=42.0,
                unit_measure="units",
                burn_rate_per_hour=0.5,
                min_safety_threshold=10.0,
                status="Normal",
                notes="Portable cylinders allocated to ambulances and trauma intake."
            ),
            # MEDICINES: Adrenaline 45 vials remaining (threshold 50 -> Reorder point breached!)
            Resource(
                resource_id="RES-MED-ADREN",
                name="Adrenaline (Epinephrine) 1mg/ml Ampoules",
                category="Medicines",
                department="Emergency",
                total_capacity=300.0,
                available_units=45.0, # <= 50 -> Reorder Point Breached!
                occupied_units=255.0,
                unit_measure="vials",
                burn_rate_per_hour=2.0,
                min_safety_threshold=50.0,
                status="Critical",
                notes="STOCKOUT ALERT: Below minimum reserve threshold of 50 vials. Reorder placed with hospital pharmacy."
            ),
            Resource(
                resource_id="RES-MED-BLOOD-O",
                name="Universal Donor Blood Units (O-Negative)",
                category="Medicines",
                department="Emergency Trauma",
                total_capacity=50.0,
                available_units=6.0, # <= 8 -> Critical Blood Alert!
                occupied_units=44.0,
                unit_measure="units",
                burn_rate_per_hour=0.8,
                min_safety_threshold=8.0,
                status="Critical",
                notes="CRITICAL BLOOD ALERT: Only 6 units remaining for uncrossmatched massive transfusions."
            ),
            Resource(
                resource_id="RES-MED-CEFTR",
                name="Ceftriaxone 1g Injectable Antibiotics",
                category="Medicines",
                department="General Medicine",
                total_capacity=500.0,
                available_units=130.0,
                occupied_units=370.0,
                unit_measure="vials",
                burn_rate_per_hour=4.0,
                min_safety_threshold=100.0,
                status="Warning",
                notes="Approaching reorder threshold of 100 units."
            ),
            # EQUIPMENT: Ventilators 22/25 occupied = 88% (> 85% saturation alert!)
            Resource(
                resource_id="RES-EQ-VENT",
                name="ICU Advanced Mechanical Ventilators",
                category="Equipment",
                department="Critical Care / ICU",
                total_capacity=25.0,
                available_units=3.0, # 88% occupancy -> SATURATION IMMINENT!
                occupied_units=22.0,
                unit_measure="units",
                burn_rate_per_hour=0.0,
                min_safety_threshold=4.0,
                status="Critical",
                notes="EQUIPMENT SATURATION: 88% utilization. Only 3 standby ventilators available."
            ),
            Resource(
                resource_id="RES-EQ-DIALYSIS",
                name="Hemodialysis & CRRT Stations",
                category="Equipment",
                department="Nephrology",
                total_capacity=8.0,
                available_units=2.0,
                occupied_units=6.0,
                unit_measure="units",
                burn_rate_per_hour=0.0,
                min_safety_threshold=2.0,
                status="Warning",
                notes="High demand due to 4 acute renal failure cases in step-down."
            ),
            Resource(
                resource_id="RES-EQ-CT",
                name="128-Slice High-Speed Cranial CT Scanner",
                category="Equipment",
                department="Neurology / Radiology",
                total_capacity=2.0,
                available_units=1.0,
                occupied_units=1.0,
                unit_measure="units",
                burn_rate_per_hour=0.0,
                min_safety_threshold=1.0,
                status="Normal",
                notes="Unit 1 operational 24/7 for stroke protocols. Unit 2 undergoing calibration."
            )
        ]
        db.add_all(resources)
        db.commit()

        print("Seeding Patients with AI Inference Passports...")
        # 4. Patients
        patients_seed_specs = [
            {
                "patient_id": "PT-1001",
                "name": "Ramesh Chandra",
                "age": 58,
                "gender": "Male",
                "contact": "+91 98111 22334",
                "symptoms": ["Chest Pain (Retrosternal / Crushing)", "Pain Radiating to Left Arm / Jaw", "Diaphoresis (Profuse Cold Sweats)"],
                "severity": 9.2,
                "urgency": "Emergency",
                "disease": "Acute Coronary Syndrome (STEMI)",
                "assigned_department": "Cardiology",
                "status": "In Consultation",
                "bed_number": "ICU-02",
                "assigned_doctor": "Dr. Mohd. Nazim",
                "vitals": {"bp": "165/100", "heart_rate": 114, "spo2": 93, "temperature": 98.4},
                "triage_notes": "Patient presented with crushing substernal chest pressure of 45 mins duration radiating to left jaw. Cold clammy diaphoresis noted."
            },
            {
                "patient_id": "PT-1002",
                "name": "Sunita Devi",
                "age": 64,
                "gender": "Female",
                "contact": "+91 98222 33445",
                "symptoms": ["Sudden Unilateral Facial Droop", "Unilateral Arm or Leg Weakness (Hemiparesis)", "Slurred Speech / Dysphasia"],
                "severity": 9.4,
                "urgency": "Emergency",
                "disease": "Acute Ischemic Stroke (LVO)",
                "assigned_department": "Neurology",
                "status": "In Consultation",
                "bed_number": "NEURO-04",
                "assigned_doctor": "Dr. Rajesh Verma",
                "vitals": {"bp": "188/104", "heart_rate": 88, "spo2": 96, "temperature": 98.6},
                "triage_notes": "Symptom onset 75 minutes prior. Positive FAST protocol with left hemiplegia and expressive dysphasia. Stat non-contrast head CT ordered."
            },
            {
                "patient_id": "PT-1003",
                "name": "Vikram Malhotra",
                "age": 42,
                "gender": "Male",
                "contact": "+91 98333 44556",
                "symptoms": ["Severe Shortness of Breath / Dyspnea at Rest", "Low SpO2 Saturation (<92%)", "Central Cyanosis (Bluish Lips/Nails)"],
                "severity": 8.6,
                "urgency": "Emergency",
                "disease": "Acute Hypoxemic Respiratory Failure",
                "assigned_department": "Pulmonology",
                "status": "Admitted",
                "bed_number": "ICU-05",
                "assigned_doctor": "Dr. Sameer Khan",
                "vitals": {"bp": "142/88", "heart_rate": 126, "spo2": 87, "temperature": 101.2},
                "triage_notes": "Marked accessory muscle usage, SpO2 87% on room air. Placed on high-flow nasal cannula at 50 L/min."
            },
            {
                "patient_id": "PT-1004",
                "name": "Mohammad Arif",
                "age": 29,
                "gender": "Male",
                "contact": "+91 98444 55667",
                "symptoms": ["Massive External Hemorrhage / Arterial Bleed", "Loss of Consciousness / Unresponsive (GCS < 8)", "High-Velocity Road Traffic Polytrauma"],
                "severity": 9.8,
                "urgency": "Emergency",
                "disease": "High-Velocity Polytrauma with Hemorrhagic Shock",
                "assigned_department": "Emergency",
                "status": "In Consultation",
                "bed_number": "TRAUMA-01",
                "assigned_doctor": "Dr. Ananya Iyer",
                "vitals": {"bp": "78/44", "heart_rate": 142, "spo2": 91, "temperature": 96.8},
                "triage_notes": "Direct transfer from highway ambulance. Tourniquet applied on right thigh; massive transfusion protocol initiated with O-Negative blood."
            },
            {
                "patient_id": "PT-1005",
                "name": "Aarav Sharma",
                "age": 4,
                "gender": "Male",
                "contact": "+91 98555 66778",
                "symptoms": ["Neonatal High Fever (>101 F in infant under 3 months)", "Pediatric Febrile Seizure", "Pediatric Barking Cough (Croup / Stridor)"],
                "severity": 8.1,
                "urgency": "Urgent",
                "disease": "Pediatric Febrile Seizure & Acute Laryngotracheobronchitis",
                "assigned_department": "Pediatrics",
                "status": "Triage Evaluated",
                "bed_number": "PED-03",
                "assigned_doctor": "Dr. Kavita Nair",
                "vitals": {"bp": "95/60", "heart_rate": 148, "spo2": 95, "temperature": 103.4},
                "triage_notes": "Parent reports 2-minute generalized convulsion post fever spike. Currently post-ictal but responding to parent voice. Inhaled budesonide started."
            },
            {
                "patient_id": "PT-1006",
                "name": "Kishore Kumar",
                "age": 36,
                "gender": "Male",
                "contact": "+91 98666 77889",
                "symptoms": ["Compound Open Fracture with Exposed Bone", "Severe Bone Deformity and Angulation", "Complete Inability to Bear Weight"],
                "severity": 7.9,
                "urgency": "Urgent",
                "disease": "Gustilo-Anderson Grade II Open Tibia-Fibula Fracture",
                "assigned_department": "Orthopedics",
                "status": "Admitted",
                "bed_number": "ORTHO-12",
                "assigned_doctor": "Dr. Amit Deshmukh",
                "vitals": {"bp": "134/82", "heart_rate": 96, "spo2": 98, "temperature": 98.6},
                "triage_notes": "Exposed bone distal anterior tibia following construction site fall. Wound irrigated with sterile saline, IV cefazolin administered, splinted."
            },
            {
                "patient_id": "PT-1007",
                "name": "Geeta Bhatt",
                "age": 51,
                "gender": "Female",
                "contact": "+91 98777 88990",
                "symptoms": ["Hematemesis (Vomiting Coffee-Ground Blood)", "Melena (Black Tarry Stools)", "Severe Rigid Board-like Abdominal Guarding"],
                "severity": 8.4,
                "urgency": "Emergency",
                "disease": "Acute Upper Gastrointestinal Bleed",
                "assigned_department": "Gastroenterology",
                "status": "In Consultation",
                "bed_number": "WARD-20",
                "assigned_doctor": "Dr. Ananya Iyer",
                "vitals": {"bp": "100/62", "heart_rate": 108, "spo2": 97, "temperature": 98.8},
                "triage_notes": "Three episodes of frank dark red hematemesis over past 6 hours. High-dose IV pantoprazole bolus running."
            },
            {
                "patient_id": "PT-1008",
                "name": "Harish Rawat",
                "age": 62,
                "gender": "Male",
                "contact": "+91 98888 99001",
                "symptoms": ["Oliguria or Complete Anuria (<100ml urine in 24h)", "Bilateral Refractory Lower Limb and Periorbital Edema", "Acute Bilateral Flank Pain with Costovertebral Tenderness"],
                "severity": 7.8,
                "urgency": "Urgent",
                "disease": "Acute Kidney Injury (KDIGO Stage 3)",
                "assigned_department": "Nephrology",
                "status": "Waiting",
                "bed_number": "WARD-15",
                "assigned_doctor": "Dr. Rajesh Verma",
                "vitals": {"bp": "172/98", "heart_rate": 84, "spo2": 95, "temperature": 99.1},
                "triage_notes": "Serum creatinine elevated at 6.4 mg/dL. Potassium 5.8 mEq/L. Nephrology review requested for urgent hemodialysis access."
            },
            {
                "patient_id": "PT-1009",
                "name": "Ananya Sen",
                "age": 27,
                "gender": "Female",
                "contact": "+91 98999 00112",
                "symptoms": ["Moderate Intermittent Fever with Chills (<3 days)", "Generalized Chronic Fatigue and Body Aches", "Mild Cough and Sore Throat"],
                "severity": 3.8,
                "urgency": "Non-Urgent",
                "disease": "Acute Upper Respiratory Viral Infection",
                "assigned_department": "General Medicine",
                "status": "Waiting",
                "bed_number": None,
                "assigned_doctor": "Dr. Mohd. Nazim",
                "vitals": {"bp": "118/76", "heart_rate": 78, "spo2": 99, "temperature": 100.2},
                "triage_notes": "Mild pharyngeal erythema without exudates. Systemically stable, ambulatory, recommended for outpatient oral symptomatic regimen."
            },
            {
                "patient_id": "PT-1010",
                "name": "Pradeep Chawla",
                "age": 73,
                "gender": "Male",
                "contact": "+91 98123 45678",
                "symptoms": ["Syncope / Sudden Unexplained Fainting", "Cardiac Palpitations", "Dyspnea on Exertion"],
                "severity": 6.8,
                "urgency": "Semi-Urgent",
                "disease": "Symptomatic Bradyarrhythmia / Sick Sinus Syndrome",
                "assigned_department": "Cardiology",
                "status": "Waiting",
                "bed_number": "WARD-08",
                "assigned_doctor": "Dr. Mohd. Nazim",
                "vitals": {"bp": "138/84", "heart_rate": 44, "spo2": 96, "temperature": 98.2},
                "triage_notes": "Sinus bradycardia with HR 44 bpm. 12-lead ECG confirms intermittent sinus pauses > 2.8 seconds. Telemetry monitoring ordered."
            }
        ]

        for p_spec in patients_seed_specs:
            # Generate AI decision passport
            ai_passport = ClinicalInferenceEngine.evaluate_triage({
                "name": p_spec["name"],
                "age": p_spec["age"],
                "gender": p_spec["gender"],
                "symptoms": p_spec["symptoms"],
                "severity": p_spec["severity"],
                "urgency": p_spec["urgency"],
                "vitals": p_spec["vitals"]
            })

            patient_obj = Patient(
                patient_id=p_spec["patient_id"],
                name=p_spec["name"],
                age=p_spec["age"],
                gender=p_spec["gender"],
                contact=p_spec["contact"],
                symptoms=p_spec["symptoms"],
                severity=p_spec["severity"],
                urgency=p_spec["urgency"],
                disease=p_spec["disease"],
                assigned_department=p_spec["assigned_department"],
                status=p_spec["status"],
                bed_number=p_spec["bed_number"],
                assigned_doctor=p_spec["assigned_doctor"],
                vitals=p_spec["vitals"],
                triage_notes=p_spec["triage_notes"],
                ai_recommendation=ai_passport
            )
            db.add(patient_obj)

        # 5. Audit Logs
        audit_samples = [
            AuditLog(
                actor_email="dr.nazim@niet.ac.in",
                actor_name="Dr. Mohd. Nazim, MD",
                actor_role="doctor",
                action="TRIAGE_DECISION_VALIDATED",
                entity_type="Patient",
                entity_id="PT-1001",
                details={"verified_department": "Cardiology", "decision_score": 96.2, "algorithm": "A* Search"}
            ),
            AuditLog(
                actor_email="admin@niet.ac.in",
                actor_name="Administrator - NIET AI Labs",
                actor_role="admin",
                action="PREDICTIVE_SHORTAGE_ALERT_ACKNOWLEDGED",
                entity_type="Resource",
                entity_id="RES-BED-ICU",
                details={"threshold": "<10% capacity", "available_beds": 3, "total_capacity": 40}
            ),
            AuditLog(
                actor_email="nurse.priya@niet.ac.in",
                actor_name="Priya Sharma, RN",
                actor_role="staff",
                action="PATIENT_INTAKE_RECORDED",
                entity_type="Patient",
                entity_id="PT-1004",
                details={"severity": 9.8, "urgency": "Emergency", "trauma_bay": "TRAUMA-01"}
            )
        ]
        db.add_all(audit_samples)

        db.commit()
        print("Database seeded successfully with production-grade clinical dataset!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

