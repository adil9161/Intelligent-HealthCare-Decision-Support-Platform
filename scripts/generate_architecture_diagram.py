import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_architecture_diagram():
    fig = plt.figure(figsize=(16, 10), dpi=300)
    fig.patch.set_facecolor('#F8FAFC')
    ax = fig.add_subplot(111)
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # Palette
    c_primary = '#0D9488'      # Teal
    c_primary_light = '#F0FDFA'
    c_blue = '#0284C7'         # Sky/Blue
    c_blue_light = '#F0F9FF'
    c_purple = '#7C3AED'       # Purple/AI
    c_purple_light = '#F5F3FF'
    c_amber = '#D97706'        # Amber
    c_amber_light = '#FFFBEB'
    c_slate = '#334155'        # Dark text
    c_border = '#CBD5E1'

    def draw_box(x, y, w, h, title, subtitle, items, bg_col, border_col, title_col):
        rect = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.15,rounding_size=0.25",
            facecolor=bg_col,
            edgecolor=border_col,
            linewidth=1.8,
            zorder=2
        )
        ax.add_patch(rect)
        # Title
        ax.text(x + w/2, y + h - 0.35, title, fontsize=11, fontweight='bold',
                color=title_col, ha='center', va='center', zorder=3)
        # Subtitle
        if subtitle:
            ax.text(x + w/2, y + h - 0.65, subtitle, fontsize=8.5,
                    color='#64748B', ha='center', va='center', zorder=3, style='italic')
        # Content bullets
        start_y = y + h - 1.05
        for idx, item in enumerate(items):
            ax.text(x + 0.3, start_y - (idx * 0.32), f"• {item}",
                    fontsize=8.5, color=c_slate, ha='left', va='center', zorder=3)

    # Title Banner
    ax.text(8.0, 9.55, "AegisHealth AI — System Architecture & Data Flow",
            fontsize=18, fontweight='bold', color='#0F172A', ha='center', va='center')
    ax.text(8.0, 9.2, "Intelligent Healthcare Decision Support Platform | NIET Greater Noida (Dr. Mohd. Nazim, AI)",
            fontsize=10, color='#64748B', ha='center', va='center')

    # LAYER 1: CLIENT PRESENTATION LAYER (Top)
    # Box 1.1: Web Clients & Users
    draw_box(0.8, 6.9, 4.3, 1.8,
             "Client Presentation Layer",
             "React 18 • TypeScript • Tailwind CSS",
             [
                 "Triage Nurses & Emergency Physicians",
                 "Interactive Dashboards (Light Theme)",
                 "Framer Motion Fluid Micro-Interactions",
                 "Role-Based Access (Doctor, Nurse, Admin)"
             ],
             '#FFFFFF', c_primary, c_primary)

    # Box 1.2: 3D Visualization Engines
    draw_box(5.8, 6.9, 4.4, 1.8,
             "Spatial 3D & Graphics Layer",
             "Three.js • React Three Fiber • Drei",
             [
                 "Interactive 3D Decision Graph Search",
                 "Hospital Campus Digital Twin (R3F)",
                 "Pulsating Sensor Alert Department Pods",
                 "Traveling Wave Packets & Energy Edges"
             ],
             c_blue_light, c_blue, c_blue)

    # Box 1.3: Explainable UI & Telemetry
    draw_box(10.9, 6.9, 4.3, 1.8,
             "Explainability & Review Layer",
             "Human-in-the-Loop Decision Passports",
             [
                 "Itemized Symptom Contribution Lists",
                 "Plain-Language Clinical Rationale",
                 "4-Algorithm Benchmark Matrix (A*, GBFS, BFS, DFS)",
                 "Active Mathematical Telemetry: f(n)=g(n)+h(n)"
             ],
             c_purple_light, c_purple, c_purple)

    # LAYER 2: GATEWAY & BACKEND SERVICE (Middle)
    draw_box(0.8, 3.8, 14.4, 2.2,
             "FastAPI High-Performance Application Core",
             "RESTful API v1 • Asynchronous ASGI • Pydantic v2 Schemas",
             [
                 "API Gateway: Request ID Tracking, CORS Middleware, Structured JSON Logging",
                 "Security & Auth: JWT Bearer Tokens, PBKDF2 Password Hashing, RBAC Guard Dependencies",
                 "Patient Intake Service: ESI Acuity Categorization, Presenting Vitals Ingestion, Triage Registry",
                 "Workforce Engine: Multi-Tab Live Shift Attendance, Physician Workload Caps (<= 5 acute pts)",
                 "Resource Predictor: 48-Hour Depletion Trajectory, Rule-Based Shortage Detection (<10% Reserve)"
             ],
             '#FFFFFF', c_border, '#0F172A')

    # LAYER 3: AI DECISION & REASONING CORE (Lower Middle)
    # Box 3.1: Buchanan Certainty Factors
    draw_box(0.8, 0.7, 4.3, 2.3,
             "Uncertainty Reasoning Engine",
             "Buchanan & Shortliffe Calculus (Unit 4)",
             [
                 "Certainty Factors: CF in [-1.0, +1.0]",
                 "Cumulative Evidence: CF1 + CF2(1 - CF1)",
                 "Continuous Fuzzy Acuity: Mild / Mod / Sev",
                 "Graceful Degradation on Incomplete Data"
             ],
             c_purple_light, c_purple, c_purple)

    # Box 3.2: Decision Graph Search Engine
    draw_box(5.8, 0.7, 4.4, 2.3,
             "Heuristic Decision Graph Engine",
             "5-Stage Clinical Decision Network",
             [
                 "A* Search: f(n) = g(delay) + h(admissible)",
                 "GBFS: Heuristic Priority Queue Evaluation",
                 "BFS: Shortest Unweighted Edge Hop Count",
                 "DFS: Deep Exploratory Branch Verification",
                 "Latency Quality Bar: All Algos < 200ms"
             ],
             c_primary_light, c_primary, c_primary)

    # Box 3.3: Persistence & Storage Layer
    draw_box(10.9, 0.7, 4.3, 2.3,
             "Persistence & Analytics Layer",
             "SQLAlchemy ORM • SQLite / PostgreSQL",
             [
                 "Relational Schema: Users, Patients, Staff, Resources",
                 "Immutable Audit Logging: Clinical Decision Trails",
                 "Automated Database Seeding (Month 2 Scenarios)",
                 "UN SDG 3 Impact Telemetry & Analytics"
             ],
             c_amber_light, c_amber, c_amber)

    # CONNECTING ARROWS
    def draw_arrow(x1, y1, x2, y2, label=""):
        ax.annotate(
            label,
            xy=(x2, y2), xytext=(x1, y1),
            arrowprops=dict(
                arrowstyle="-|>",
                color=c_primary,
                lw=2.0,
                mutation_scale=16,
                shrinkA=3,
                shrinkB=3
            ),
            fontsize=8,
            fontweight='bold',
            color=c_primary,
            ha='center',
            va='center',
            zorder=4
        )

    # Client to Backend arrows
    draw_arrow(2.95, 6.9, 2.95, 6.0, "HTTPS / REST")
    draw_arrow(8.0, 6.9, 8.0, 6.0, "State Telemetry")
    draw_arrow(13.05, 6.9, 13.05, 6.0, "Inference Calls")

    # Backend to AI & Storage arrows
    draw_arrow(2.95, 3.8, 2.95, 3.0, "Symptom Evidence")
    draw_arrow(8.0, 3.8, 8.0, 3.0, "Graph Traversal")
    draw_arrow(13.05, 3.8, 13.05, 3.0, "ORM Transactions")

    # Horizontal connection between AI modules
    ax.annotate(
        "Candidate Depts",
        xy=(5.8, 1.8), xytext=(5.1, 1.8),
        arrowprops=dict(arrowstyle="-|>", color='#64748B', lw=1.5, mutation_scale=12),
        fontsize=7.5, color='#64748B', ha='center', va='bottom'
    )
    ax.annotate(
        "Audit Trail",
        xy=(10.9, 1.8), xytext=(10.2, 1.8),
        arrowprops=dict(arrowstyle="-|>", color='#64748B', lw=1.5, mutation_scale=12),
        fontsize=7.5, color='#64748B', ha='center', va='bottom'
    )

    plt.tight_layout()
    plt.savefig('docs/architecture.png', dpi=300, facecolor='#F8FAFC', bbox_inches='tight')
    plt.close()
    print("[OK] Successfully generated docs/architecture.png")

if __name__ == '__main__':
    create_architecture_diagram()
