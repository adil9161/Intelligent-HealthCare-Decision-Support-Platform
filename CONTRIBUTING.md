# Contributing to AegisHealth AI

Thank you for your interest in contributing to the **Intelligent Healthcare Decision Support Platform** (AegisHealth AI). This project was developed as an academic capstone initiative within the Department of Computer Science & Engineering at **Noida Institute of Engineering & Technology (NIET), Greater Noida**, under the guidance of **Dr. Mohd. Nazim**, aligned with **United Nations Sustainable Development Goal 3 (Good Health and Well-Being)**.

---

## Code of Conduct & Clinical Integrity

Because this application serves as an advisory Clinical Decision Support System (CDSS), code contributions must adhere to strict clinical safety axioms:

1. **Human-in-the-Loop Supremacy**: No algorithm or automated pipeline may bypass attending physician review or autonomously issue binding diagnoses.
2. **Transparent Reasoning**: Any new triage heuristics or search modifications must supply an explainable, plain-language clinical rationale free of obfuscated jargon.
3. **Graceful Uncertainty Degradation**: Recommendations must tolerate missing or noisy inputs through Buchanan & Shortliffe Certainty Factor degradation without system exceptions.

---

## Getting Started

1. **Fork the Repository**: Create your personal branch from `main`.
2. **Clone Locally**:
   ```bash
   git clone https://github.com/adil9161/Intelligent-HealthCare-Decision-Support-Platform.git
   cd Intelligent-HealthCare-Decision-Support-Platform
   ```
3. **Install Dependencies**:
   ```bash
   # Backend
   pip install -r requirements.txt

   # Frontend
   npm install --prefix frontend
   ```

---

## Development Workflow

### Backend (FastAPI & SQLAlchemy)
- Format code following PEP 8 conventions.
- Ensure all schema changes are reflected in Pydantic models (`backend/app/schemas/`) and SQLAlchemy tables (`backend/app/models/`).
- Verify endpoint latency quality bars: all search graph algorithms (BFS, DFS, Greedy, A*) must execute in **< 200 ms**.
- Run test suites before submitting changes:
  ```bash
  python -m pytest backend/ -v
  ```

### Frontend (React 18, Vite, Three.js & Tailwind CSS)
- Maintain the clinical light theme design system (Plus Jakarta Sans, Inter, JetBrains Mono, crisp borders, high contrast).
- Ensure 3D components (`@react-three/fiber` and `@react-three/drei`) clean up memory, geometries, materials, and pointer states upon unmounting.
- Build and lint frontend cleanly:
  ```bash
  npm run build --prefix frontend
  ```

---

## Branching & Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` Adds a new user-facing clinical or visual capability.
- `fix:` Resolves a bug, latency regression, or UI inconsistency.
- `docs:` Updates documentation, architecture diagrams, or academic citations.
- `refactor:` Code refactoring without behavioral modification.
- `test:` Adds or refines unit, integration, or end-to-end tests.
- `perf:` Performance optimizations in search traversal or 3D rendering.

Example:
```bash
git commit -m "feat(ai-engine): refine heuristic admissibility for pediatric cardiac pathways"
```

---

## Pull Request Process

1. Ensure existing test suites pass with zero failures.
2. Update relevant sections of `README.md` if your change introduces new API endpoints or visual workflows.
3. Submit your pull request to the `main` branch with a concise summary of the clinical problem addressed and technical solution implemented.
4. Maintainers will review your submission for code quality, architectural consistency, and clinical safety.

