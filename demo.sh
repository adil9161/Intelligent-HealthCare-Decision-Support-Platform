#!/usr/bin/env bash
# ==============================================================================
# AegisHealth AI - Intelligent Healthcare Decision Support Platform
# One-Command Demo Script (Unix/Linux/macOS)
# NIET Greater Noida | Dr. Mohd. Nazim | UN SDG 3
# ==============================================================================

set -e

echo "=============================================================================="
echo "      AEGISHEALTH AI - INTELLIGENT HEALTHCARE DECISION SUPPORT PLATFORM"
echo "      B.Tech CSE Artificial Intelligence Course - Dr. Mohd. Nazim"
echo "      NIET Greater Noida  |  United Nations SDG 3: Good Health and Well-Being"
echo "=============================================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "[1/4] Checking Python & Node.js..."
command -v python3 >/dev/null 2>&1 || { echo "[ERROR] python3 required"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "[ERROR] node required"; exit 1; }

echo "[2/4] Initializing Database & Running E2E Test Suite..."
python3 backend/test_e2e_critical_paths.py

echo "[3/4] Launching FastAPI Backend on port 8000..."
(cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) &
BACKEND_PID=$!

echo "[4/4] Launching React Frontend on port 5173..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo "=============================================================================="
echo "  AegisHealth AI is now live!"
echo "  Frontend Application: http://localhost:5173"
echo "  FastAPI Swagger Docs: http://localhost:8000/docs"
echo "  FastAPI Redoc:        http://localhost:8000/redoc"
echo ""
echo "  Demo Credentials:"
echo "    - Doctor: dr.nazim@niet.ac.in   / Doctor@123"
echo "    - Admin:  admin@niet.ac.in      / Admin@123"
echo "    - Staff:  nurse.priya@niet.ac.in / Staff@123"
echo "=============================================================================="

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit" SIGINT SIGTERM EXIT
wait

