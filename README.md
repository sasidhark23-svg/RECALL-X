# RECALL-X
> **An AI Incident Response Agent That Learns From Every Incident**

RECALL-X is an AI-powered Security Operations Center (SOC) incident response assistant built with **persistent memory** powered by **Hindsight by Vectorize**.

---

## 💡 Problem & Solution

### WITHOUT MEMORY:
Traditional AI security assistants treat every incident independently. When an incident is resolved, the root cause analysis, failed containment actions, and successful remediation steps are lost to the AI. Every new incident begins from zero—frequently repeating previous containment mistakes (e.g., relying solely on perimeter IP blocking when attackers use rotated proxies).

### WITH HINDSIGHT:
RECALL-X retains **organizational incident experience** in a long-term memory bank using Hindsight. When a new incident is submitted:
1. RECALL-X queries Hindsight memory for semantically similar past incidents.
2. Recalls past **symptoms**, **root causes**, **failed containment attempts**, and **proven successful remediations**.
3. Feeds these historical memories to the Groq LLM reasoning engine.
4. Generates an **experience-informed response** that explicitly avoids past mistakes.
5. When the analyst marks the incident as resolved, the newly confirmed root cause and lessons learned are retained in Hindsight for future incidents.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    User([Security Analyst]) <--> Dashboard[React SOC Dashboard]
    Dashboard <--> REST[FastAPI REST API]
    
    subgraph AgentPipeline ["RECALL-X Reasoning Pipeline"]
        REST --> IncidentAgent[Incident Agent]
        IncidentAgent <--> GroqLLM[Groq LLM - llama-3.3-70b-versatile]
        IncidentAgent <--> Hindsight[Hindsight Memory Service]
    end

    subgraph DataStorage ["Storage Layers"]
        Hindsight <--> HindsightEngine[(Hindsight Vector Memory Bank)]
        REST <--> SQLiteDB[(SQLite Operational Incident DB)]
    end
```

### Distinction Between Storage Layers:
* **SQLite Operational Records**: Stores incident status, timestamps, form fields, severity, and operational logs (`INC-001`, `INC-002`, etc.).
* **Hindsight Memory Bank**: Stores agent **experience and organizational knowledge** (what happened, what failed, root causes, what worked, and analyst lessons learned).

---

## ⚡ Tech Stack

* **Frontend**: React, Vite, Tailwind CSS, React Router, Axios, Lucide Icons, Recharts
* **Backend**: Python 3.14, FastAPI, Uvicorn, SQLAlchemy, Pydantic v2
* **Database**: SQLite
* **AI Model**: Groq API (`llama-3.3-70b-versatile`)
* **Memory Engine**: `hindsight-client` Python SDK (Hindsight by Vectorize)

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites
* Python 3.10+
* Node.js 18+ and npm

### 2. Environment Variables Setup
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
HINDSIGHT_API_URL=http://localhost:8888
HINDSIGHT_API_KEY=
HINDSIGHT_BANK_ID=recall-x-incidents
DATABASE_URL=sqlite:///./recall_x.db
HOST=0.0.0.0
PORT=8000
```

### 3. Backend Setup
Install Python dependencies and seed demo data:

```bash
python -m pip install -r requirements.txt
python seed_demo.py
```

Run the backend server:

```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend Setup
Install npm dependencies and run Vite dev server:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🎯 60-Second Demo Walkthrough

Navigate to the **Demo Mode** page in the UI (`/demo-mode`) and click **RUN 60s DEMO COMPARISON**.

1. **Scenario**: *500 failed login attempts followed by successful login from an unknown IP, then unusual outbound TLS traffic to target-c2.net.*
2. **MEMORY OFF (Generic AI)**: Recommends perimeter IP blocking (a standard playbook action that fails when attackers rotate egress proxies).
3. **MEMORY ON (RECALL-X + Hindsight)**: Recalls historical incident `INC-003`. Identifies that IP-only blocking previously failed, and prioritizes **account disablement, OAuth session revocation, and hardware MFA enforcement**.

---

## 📡 REST API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check and Hindsight connectivity status |
| `GET` | `/api/incidents` | List incidents with optional status/severity filters |
| `GET` | `/api/incidents/{id}` | Get single incident detail with analysis history |
| `POST` | `/api/incidents` | Submit new incident & analyze with MEMORY ON/OFF toggle |
| `POST` | `/api/incidents/{id}/analyze` | Re-analyze existing incident with updated memory toggle |
| `POST` | `/api/incidents/{id}/resolve` | Resolve incident & retain structured experience in Hindsight |
| `POST` | `/api/memory/search` | Search Hindsight organizational memory with natural language |
| `GET` | `/api/memory/activity` | Retrieve recent Hindsight memory retain/recall activities |
| `GET` | `/api/analytics` | Get operational metrics and recall frequency statistics |
| `POST` | `/api/demo/run` | Execute side-by-side Memory OFF vs Memory ON demo comparison |

---

## 📁 Project Structure

```
recall-x/
├── backend/
│   ├── config.py             # Environment configuration & settings
│   ├── database.py           # SQLAlchemy SQLite engine setup
│   ├── main.py               # FastAPI application & REST endpoints
│   ├── models/
│   │   ├── db_models.py      # SQLite models (Incident, MemoryActivity)
│   │   └── schemas.py        # Pydantic schemas for API request/response
│   └── services/
│       ├── hindsight_service.py # Hindsight SDK wrapper (retain, recall, search)
│       └── incident_agent.py    # Groq LLM + Hindsight reasoning pipeline
├── frontend/
│   ├── src/
│   │   ├── components/       # Header, Sidebar, MemoryToggle, ResolveModal
│   │   ├── pages/            # Dashboard, NewIncident, Incidents, Memory, Analytics, DemoMode
│   │   ├── api.js            # Axios REST client
│   │   └── App.jsx           # React Router layout
│   ├── package.json
│   └── vite.config.js
├── seed_demo.py              # Populates SQLite DB & retains historical incidents in Hindsight
├── .env.example
├── .gitignore
├── requirements.txt
├── README.md
├── DEMO_SCRIPT.md
└── CONTENT_NOTES.md
```

---

## 🔒 Safety & Responsible AI

RECALL-X is strictly a **defensive incident response recommendation assistant**. It does not perform autonomous network actions, exploit generation, or offensive maneuvers. Recommendations focus on containment, forensic investigation, remediation, and organizational learning.
