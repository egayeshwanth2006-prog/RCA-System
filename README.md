# AIVOA.AI — AI-Powered Root Cause Analysis (RCA) Module
### Enterprise Pharmaceutical Quality Investigation & CAPA Governance Platform
*Compliant with ICH Q7 (GMP for APIs), ICH Q9 (Quality Risk Management), ICH Q10 (Pharmaceutical Quality System), and EU GMP Annex 16*

---

## 🎯 Executive Overview

In pharmaceutical Active Pharmaceutical Ingredient (API) manufacturing, deviations—such as out-of-specification chemical impurity levels, crystallization thermal excursions, or particulate exceedances—require rigorous, evidence-based investigation.

**AIVOA.AI** is a production-grade, full-stack pharmaceutical Root Cause Analysis (RCA) and Corrective & Preventive Action (CAPA) intelligence platform. It automates deviation intake, performs PyMuPDF document extraction, executes a **7-node LangGraph multi-agent workflow** with **Groq LLM (`llama-3.3-70b-versatile`)**, constructs structured **5 Whys** and **Ishikawa 6M Fishbone** causal diagrams, identifies forensic **Missing Evidence** gaps, and formulates measurable **CAPA** plans with effectiveness verification checks.

Following strict pharmaceutical regulatory governance, **all AI-generated assertions are treated as illustrative hypotheses until empirically verified and confirmed by a Qualified Person (QP)**.

---

## 🏗️ Mandatory Tech Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **State Management**: Redux Toolkit (`@reduxjs/toolkit` + `react-redux`)
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS (Navy `#0f172a` & Subtle Teal `#0d9488` corporate palette)
- **Icons**: Lucide React
- **API Communication**: Axios (with response interceptors & unified error handling)

### Backend
- **Framework**: Python 3.14 + FastAPI
- **ORM & Database**: SQLAlchemy 2.0 with PostgreSQL (and zero-config SQLite fallback)
- **Validation**: Pydantic v2 schemas
- **Document Processing**: PyMuPDF (`fitz`) for PDF forensic report extraction

### AI & LLM Engine
- **Workflow Orchestration**: LangGraph (7-node linear `StateGraph` pipeline)
- **LLM Provider**: Groq API
- **Model**: `llama-3.3-70b-versatile` (or `llama-3.1-70b-versatile`, `mixtral-8x7b-32768`)
- **Format**: Structured RFC-compliant JSON outputs

---

## 🔄 7-Node LangGraph AI Workflow

The application executes a stateful 7-node LangGraph state machine:

```mermaid
flowchart TD
    N1["Node 1: Document Text Processing<br/>Sanitizes input, normalizes whitespace, extracts metadata"] --> N2["Node 2: Incident Information Extraction<br/>Extracts 15 pharmaceutical fields via Groq JSON mode"]
    N2 --> N3["Node 3: Information Validation<br/>Identifies missing mandatory fields & data conflicts"]
    N3 --> N4["Node 4: Root Cause Analysis<br/>Deduces 5 Whys chain & Ishikawa 6M fishbone hypotheses"]
    N4 --> N5["Node 5: Evidence Assessment<br/>Flags unsupported assumptions & generates forensic checklist"]
    N5 --> N6["Node 6: CAPA Generation<br/>Formulates Corrective & Preventive Actions with effectiveness metrics"]
    N6 --> N7["Node 7: Human Review Synthesis<br/>Packages structured findings with QP sign-off requirement"]
```

1. **Node 1: Document Text Processing** — Sanitizes PDF text or raw text, strips control characters, and prepares input.
2. **Node 2: Incident Information Extraction** — Extracts:
   - Investigation Title, Deviation ID (temp ID if absent), Product Name, API Batch Number, Manufacturing Date, Incident Date, Manufacturing Stage, Department, Deviation Category, Severity, Incident Description, Expected Specification, Actual Observation, Immediate Containment Actions, and Potential Impact.
3. **Node 3: Information Validation** — Flags missing mandatory fields (e.g., missing batch or specification).
4. **Node 4: Root Cause Analysis** — Builds 5 Whys sequential inquiry and Ishikawa 6M (Man, Machine, Method, Material, Measurement, Environment).
5. **Node 5: Evidence Assessment** — Evaluates physical evidence vs unsupported assumptions and outputs a forensic verification checklist.
6. **Node 6: CAPA Generation** — Synthesizes Corrective Actions (immediate containment) and Preventive Actions (recurrence prevention).
7. **Node 7: Human Review Synthesis** — Enforces regulatory requirement that only a qualified human reviewer can approve findings.

---

## 🗄️ PostgreSQL Database Schema

The database utilizes 5 relational SQLAlchemy models:

1. **`investigations`**: Master table storing deviation metadata, severity, status, 5 Whys JSON, Fishbone JSON, missing evidence JSON, and QP electronic sign-off.
2. **`documents`**: PDF/text document forensic archives with extracted raw text and file metadata (`CASCADE` delete).
3. **`root_causes`**: Evaluated root causes with category, evidence status (`Supported by evidence`, `Partially supported`, `Unverified hypothesis`, `Ruled out`), confidence level, and verification requirements.
4. **`capa_actions`**: Remediations categorized by `Corrective` vs `Preventive`, with priority, assignee, target completion date, status (`Pending`, `In Progress`, `Completed`, `Overdue`), and effectiveness verification criteria.
5. **`investigation_history`**: Immutable 21 CFR Part 11 audit log tracking every user action, AI execution, and status transition.

---

## 🚀 Quick Start Guide

### Option 1: 1-Click Startup (Recommended)
Run the automated startup script:
```bash
cd /Users/egayeshwanth/.gemini/antigravity/scratch/aivoa-rca
./start.sh
```
Open **http://localhost:8000** in your browser.

---

### Option 2: Running Backend & Frontend Separately

#### 1. Backend Setup (FastAPI)
```bash
cd /Users/egayeshwanth/.gemini/antigravity/scratch/aivoa-rca/backend

# Configure environment variables in backend/.env
cp .env.example .env

# Set your Groq API Key and PostgreSQL connection (optional, SQLite fallback active)
# GROQ_API_KEY=your_key_here
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aivoa_rca

# Start FastAPI server
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation will be available at: **http://localhost:8000/docs**

#### 2. Frontend Setup (React + Vite)
```bash
cd /Users/egayeshwanth/.gemini/antigravity/scratch/aivoa-rca/frontend

# Install dependencies (if not already cached)
npm install

# Start Vite dev server (proxies /api requests to port 8000)
npm run dev
```
Open **http://localhost:5173** to access the React dashboard with hot-module reloading.

---

## 🧪 Comprehensive Automated Test Suite

Run the 9-step end-to-end integration test suite verifying health check, demo seeding, dashboard stats, pasted text intake, email parsing, PyMuPDF PDF parsing, investigation CRUD persistence, CAPA status updates, and static SPA serving:

```bash
cd /Users/egayeshwanth/.gemini/antigravity/scratch/aivoa-rca/backend
python3 test_integration.py
```

Expected output:
```
Ran 9 tests in 0.213s
OK
```

---

## 📋 Standard Demonstration Workflow

1. Navigate to **New Investigation** (`/new-investigation`).
2. Click the preset button: **"API-001 (Impurity Exceedance)"** or drag and drop a manufacturing PDF report.
3. Click **"Analyze with AI"** — Watch the LangGraph state machine extract 15 parameters and populate the editable form.
4. Verify that missing mandatory fields are highlighted with red badges.
5. Click **"Continue to Root Cause Analysis"** (`/rca-workspace`).
6. Explore:
   - **5 Whys Analysis**: Sequential deductive ladder with illustrative hypotheses.
   - **Fishbone Diagram**: Visual spine + category cards for Man, Machine, Method, Material, Measurement, and Environment.
   - **Potential Root Causes**: Table classifying evidence status (`Partially supported`, `Unverified hypothesis`).
   - **Missing Evidence**: Interactive checklist to mark calibration and BMR records as Obtained or Pending.
7. Click **"Proceed to CAPA Actions"** (`/capa-management`):
   - Review Corrective Actions (quarantine, sensor calibration) and Preventive Actions (CMMS software interlock).
   - Set due dates, update owners, and inspect effectiveness verification criteria.
8. Click **"Review & Save Investigation"** (`/review-save`):
   - Perform Qualified Person (QP) confirmation.
   - Select the confirmed root cause and enter the QP electronic sign-off name.
   - Click **"Save Investigation"** to commit records to PostgreSQL.
9. View the saved record under **Investigations** (`/investigations`) or inspect real-time metrics on the **Dashboard** (`/`).

---

## 🛡️ Regulatory & Human Review Notice

In compliance with **ICH Q7 Section 2.5** and **EU GMP Annex 16**, this application explicitly treats all AI outputs as recommendations. Final root cause determination, batch disposition, and CAPA sign-off **must be performed and electronically confirmed by a Qualified Person**.
# RCA-System
