# 📝 RECALL-X Technical Content Notes

> Factual technical summary extracted directly from the codebase for technical articles, LinkedIn posts, or video walkthroughs.

---

## 🏛️ Exact Technical Architecture

* **Frontend Framework**: React 18, Vite 5, Tailwind CSS 3, React Router 6, Recharts 2, Lucide React
* **Backend Framework**: Python 3.14, FastAPI 0.141, Uvicorn 0.54, SQLAlchemy 2 font-end async/sync ORM, Pydantic v2
* **Storage Separation**:
  * `SQLite` (`recall_x.db`): Manages operational record metadata (`INC-001` format), timestamps, title, category, severity, status ("Active", "Resolved"), and user form data.
  * `Hindsight Memory Bank` (`recall-x-incidents`): Stores agent experience knowledge vector representations via `hindsight-client` (content, metadata, tags, symptoms, root cause, failed actions, successful remediation, lessons learned).

---

## 🧠 Exact Hindsight Integration

* **SDK Package**: `hindsight-client` v0.10.1
* **Service Module**: `backend/services/hindsight_service.py`
* **Key API Operations**:
  * `Hindsight(base_url, api_key)`: Instantiates client targeting `HINDSIGHT_API_URL`.
  * `client.retain(bank_id, content, metadata, tags)`: Retains structured incident experience records with metadata (`symptoms`, `confirmed_root_cause`, `actions_failed`, `successful_remediation`, `lessons_learned`).
  * `client.recall(bank_id, query)`: Performs hybrid semantic search over memory bank to retrieve top matching incident memories.
* **Graceful Degradation / Health Handling**:
  * If Hindsight server connection is unreachable or missing configuration, `hindsight_service.py` catches network exceptions and returns `status="unavailable"` and `error="Memory service unavailable."`.
  * The reasoning agent explicitly sets `memory_status="UNAVAILABLE"` in the response. The UI displays `MEMORY UNAVAILABLE` and never fabricates fake memory recalls.

---

## 🤖 Reasoning Pipeline & Groq Integration

* **Service Module**: `backend/services/incident_agent.py`
* **Groq Model**: Configured via `GROQ_MODEL` environment variable (default: `llama-3.3-70b-versatile`).
* **Prompt Engineering**:
  * Enforces strict distinction between **CURRENT EVIDENCE** (input incident) and **HISTORICAL MEMORY** (recalled from Hindsight).
  * Instructs model not to invent historical facts.
  * When memories are present, LLM analyzes **what previously failed** (to avoid repeating ineffective containment) and **what previously succeeded** (to prioritize proven remediation).
* **Deterministic Fallback**: If Groq API key is unconfigured or rate-limited, a high-quality deterministic reasoning fallback generates structured output matching the `IncidentAnalysisResult` Pydantic schema so the application remains runnable under any key condition.

---

## 🔑 Useful Code Locations

| Component | File Path |
| :--- | :--- |
| Hindsight SDK Wrapper | `backend/services/hindsight_service.py` |
| AI Agent & Prompt Engine | `backend/services/incident_agent.py` |
| Fast API Router & Endpoints | `backend/main.py` |
| Operational SQLite Models | `backend/models/db_models.py` |
| Pydantic Validation Schemas | `backend/models/schemas.py` |
| Demo Seed Script | `seed_demo.py` |
| Prominent Memory Toggle | `frontend/src/components/MemoryToggle.jsx` |
| Incident Resolution Modal | `frontend/src/components/ResolveModal.jsx` |
| 60s Demo Mode Page | `frontend/src/pages/DemoModePage.jsx` |
| Memory Search & Timeline | `frontend/src/pages/MemoryPage.jsx` |

---

## 🛠️ Technical Challenges & Resolved Decisions

1. **Strict Metadata Schema vs Free-Text Vectors**:
   * *Challenge*: Storing raw unstructured text made it hard to extract explicit "Failed Actions" vs "Successful Actions" in the UI.
   * *Solution*: Passed detailed key-value metadata in `client.retain()` while embedding comprehensive semantic text in `content` for vector retrieval.

2. **Avoiding Hallucinated Historical Facts**:
   * *Challenge*: Standard LLM prompts sometimes blend historical memory details into current incident evidence.
   * *Solution*: Structured system prompt separating `CURRENT INCIDENT EVIDENCE` from `RECALLED HISTORICAL MEMORIES`, enforcing strict JSON schemas.

---

## 📌 Screenshots to Capture for Presentation / Articles

1. **SOC Dashboard**: Showing active incidents, severity distribution chart, and Recent Hindsight Memory Activity timeline.
2. **New Incident Form with Prominent Toggle**: Showing `MEMORY OFF` vs `MEMORY ON` state.
3. **Analysis Result (Memory ON)**: Showing recalled past experience `INC-003`, previous failed approach callout, and memory-influenced reasoning.
4. **Resolution Modal**: Showing "MARK AS RESOLVED & TEACH RECALL-X" form with confirmed root cause, failed actions, and lessons learned.
5. **Memory Bank Search**: Showing natural language query against Hindsight memory.
6. **Side-by-Side 60s Demo Comparison**: Showing WITHOUT MEMORY vs WITH HINDSIGHT MEMORY cards.

---

## ⚠️ Known Limitations & Future Enhancements

* **Local Hindsight Instance**: Requires running Hindsight server locally or connecting to Vectorize Hindsight Cloud instance via URL/key.
* **Autonomous Remediation**: Tool provides recommendations only; does not execute automated perimeter firewall changes or script actions on live endpoints.
* **Future Enhancement**: Integrate webhook listeners for Microsoft Sentinel / Splunk alerts to ingest incidents automatically.
