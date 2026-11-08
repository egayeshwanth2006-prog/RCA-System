#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  AIVOA.AI — AI-Powered Root Cause Analysis (RCA) Module  "
echo "  Compliant with ICH Q7, Q9, and Q10 Guidelines           "
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Environment file check
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
fi

# 2. Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies with npm..."
    cd frontend
    npm install
    cd "$SCRIPT_DIR"
fi

# 3. Create and prepare backend virtual environment if needed
BACKEND_VENV="$SCRIPT_DIR/backend/.venv"
if [ ! -d "$BACKEND_VENV" ]; then
    echo "Creating Python virtual environment for backend..."
    python3 -m venv "$BACKEND_VENV"
fi
BACKEND_PYTHON="$BACKEND_VENV/bin/python"
"$BACKEND_PYTHON" -m pip install --upgrade pip >/dev/null
"$BACKEND_PYTHON" -m pip install -r "$SCRIPT_DIR/backend/requirements.txt"

# 4. Check if frontend dist exists, otherwise build it
if [ ! -d "frontend/dist" ]; then
    echo "Building React frontend with Vite..."
    cd frontend
    npm run build
    cd "$SCRIPT_DIR"
fi

# 5. Start FastAPI server
echo "Starting FastAPI Backend Server on port 8000..."
echo "API Docs available at: http://localhost:8000/docs"
echo "Web Application available at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop."
cd backend
"$BACKEND_PYTHON" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
