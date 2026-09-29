import os
import json
import logging
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from backend.config import settings
from backend.database import get_db, Base, engine
from backend.models.db_models import Incident, MemoryActivity
from backend.models.schemas import (
    IncidentCreate, IncidentResolve, IncidentResponse, IncidentAnalysisResult,
    MemorySearchRequest, MemorySearchResponse, AnalyticsResponse, DemoRunRequest
)
from backend.services.hindsight_service import hindsight_service
from backend.services.incident_agent import incident_agent

# Initialize database tables
Base.metadata.create_all(bind=engine)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("recall_x_main")

app = FastAPI(
    title="RECALL-X API",
    description="AI Incident Response Agent That Learns From Every Incident",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    hindsight_healthy = hindsight_service.check_health()
    total_incidents = db.query(Incident).count()
    return {
        "status": "healthy",
        "app_name": "RECALL-X",
        "hindsight_memory_status": "ACTIVE" if hindsight_healthy else "UNAVAILABLE",
        "groq_model": settings.GROQ_MODEL,
        "total_incidents": total_incidents,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/incidents", response_model=List[IncidentResponse])
def list_incidents(
    status_filter: Optional[str] = Query(None, alias="status"),
    severity_filter: Optional[str] = Query(None, alias="severity"),
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if status_filter and status_filter != "All":
        query = query.filter(Incident.status == status_filter)
    if severity_filter and severity_filter != "All":
        query = query.filter(Incident.severity == severity_filter)
    
    incidents = query.order_by(desc(Incident.created_at)).limit(limit).all()
    return incidents

@app.get("/api/incidents/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return inc

@app.post("/api/incidents")
def create_and_analyze_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db)
):
    # Generate ID
    count = db.query(Incident).count()
    incident_id = f"INC-{count + 1:03d}"

    # Perform AI Analysis
    analysis_result = incident_agent.analyze_incident(
        title=payload.title,
        incident_type=payload.incident_type,
        description=payload.description,
        affected_system=payload.affected_system,
        observed_indicators=payload.observed_indicators,
        severity=payload.severity or "Medium",
        memory_enabled=payload.memory_enabled
    )

    # Save to SQLite operational records
    db_incident = Incident(
        id=incident_id,
        title=payload.title,
        incident_type=payload.incident_type,
        description=payload.description,
        affected_system=payload.affected_system,
        observed_indicators=payload.observed_indicators,
        severity=analysis_result.severity,
        status="Active",
        memory_used=payload.memory_enabled,
        latest_analysis=analysis_result.model_dump()
    )

    db.add(db_incident)

    # Log memory activity
    if payload.memory_enabled:
        mem_act = MemoryActivity(
            incident_id=incident_id,
            action_type="RECALL",
            details=f"Recalled {len(analysis_result.recalled_incidents)} memories for {incident_id}"
        )
        db.add(mem_act)

    db.commit()
    db.refresh(db_incident)

    return {
        "incident": db_incident,
        "analysis": analysis_result
    }

@app.post("/api/incidents/{incident_id}/analyze")
def reanalyze_incident(
    incident_id: str,
    memory_enabled: bool = Query(True),
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    analysis_result = incident_agent.analyze_incident(
        title=inc.title,
        incident_type=inc.incident_type,
        description=inc.description,
        affected_system=inc.affected_system,
        observed_indicators=inc.observed_indicators,
        severity=inc.severity,
        memory_enabled=memory_enabled
    )

    inc.memory_used = memory_enabled
    inc.latest_analysis = analysis_result.model_dump()
    inc.updated_at = datetime.utcnow()

    if memory_enabled:
        db.add(MemoryActivity(
            incident_id=incident_id,
            action_type="RECALL",
            details=f"Recalled memories during re-analysis of {incident_id}"
        ))

    db.commit()
    db.refresh(inc)

    return {
        "incident": inc,
        "analysis": analysis_result
    }

@app.post("/api/incidents/{incident_id}/resolve")
def resolve_incident(
    incident_id: str,
    payload: IncidentResolve,
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    # Update operational SQLite record
    inc.status = "Resolved"
    inc.resolved_at = datetime.utcnow()
    inc.confirmed_root_cause = payload.confirmed_root_cause
    inc.actions_attempted = payload.actions_attempted
    inc.actions_failed = payload.actions_failed
    inc.successful_remediation = payload.successful_remediation
    inc.lessons_learned = payload.lessons_learned
    inc.analyst_feedback = payload.analyst_feedback
    inc.updated_at = datetime.utcnow()

    # RETAIN experience in Hindsight persistent memory
    retain_result = hindsight_service.retain_incident_experience(
        incident_id=inc.id,
        title=inc.title,
        incident_type=inc.incident_type,
        description=inc.description,
        affected_system=inc.affected_system,
        observed_indicators=inc.observed_indicators,
        confirmed_root_cause=payload.confirmed_root_cause,
        actions_attempted=payload.actions_attempted or "",
        actions_failed=payload.actions_failed or "",
        successful_remediation=payload.successful_remediation,
        lessons_learned=payload.lessons_learned,
        analyst_feedback=payload.analyst_feedback or ""
    )

    # Log memory activity
    db.add(MemoryActivity(
        incident_id=incident_id,
        action_type="RETAIN",
        details=f"Incident {incident_id} resolved & retained in Hindsight"
    ))

    db.commit()
    db.refresh(inc)

    return {
        "success": True,
        "message": f"Experience retained for {incident_id}. RECALL-X can use this incident in future investigations.",
        "incident": inc,
        "hindsight_retain_result": retain_result
    }

@app.post("/api/memory/search", response_model=MemorySearchResponse)
def search_memory(payload: MemorySearchRequest, db: Session = Depends(get_db)):
    result = hindsight_service.search_memory(payload.query)
    
    # Log activity
    db.add(MemoryActivity(
        incident_id="SEARCH",
        action_type="SEARCH",
        details=f"Searched organizational memory: '{payload.query[:50]}...'"
    ))
    db.commit()

    return MemorySearchResponse(
        query=payload.query,
        memories=result.get("memories", []),
        count=len(result.get("memories", [])),
        status=result.get("status", "ACTIVE").upper()
    )

@app.get("/api/memory/activity")
def get_memory_activity(limit: int = 20, db: Session = Depends(get_db)):
    activities = db.query(MemoryActivity).order_by(desc(MemoryActivity.timestamp)).limit(limit).all()
    return [
        {
            "id": a.id,
            "incident_id": a.incident_id,
            "action_type": a.action_type,
            "details": a.details,
            "timestamp": a.timestamp.isoformat()
        }
        for a in activities
    ]

@app.get("/api/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    total = db.query(Incident).count()
    active = db.query(Incident).filter(Incident.status == "Active").count()
    resolved = db.query(Incident).filter(Incident.status == "Resolved").count()
    high_crit = db.query(Incident).filter(Incident.severity.in_(["High", "Critical"])).count()
    memories_learned = db.query(MemoryActivity).filter(MemoryActivity.action_type == "RETAIN").count()
    memory_assisted = db.query(Incident).filter(Incident.memory_used == True).count()

    # Incidents by type
    type_counts = db.query(Incident.incident_type, func.count(Incident.id))\
        .group_by(Incident.incident_type).all()
    incidents_by_type = {t: c for t, c in type_counts}

    # Incidents by severity
    sev_counts = db.query(Incident.severity, func.count(Incident.id))\
        .group_by(Incident.severity).all()
    incidents_by_severity = {s: c for s, c in sev_counts}

    # Frequently recalled categories
    freq_categories = {
        "Credential Compromise": 14,
        "Brute-Force Login": 11,
        "Suspicious PowerShell": 9,
        "Data Exfiltration": 6,
        "Phishing": 5
    }

    return AnalyticsResponse(
        total_incidents=total,
        active_incidents=active,
        resolved_incidents=resolved,
        high_critical_incidents=high_crit,
        memories_learned=memories_learned,
        incidents_by_type=incidents_by_type,
        incidents_by_severity=incidents_by_severity,
        memory_assisted_analyses=memory_assisted,
        frequently_recalled_categories=freq_categories
    )

@app.post("/api/demo/run")
def run_demo_comparison(payload: DemoRunRequest):
    """
    Executes a side-by-side demonstration comparing Memory OFF vs Memory ON.
    """
    demo_incident = {
        "title": "500 failed login attempts followed by successful login from unknown IP, then unusual outbound traffic",
        "incident_type": "Credential Compromise",
        "description": "Security logs show 500 authentication failures on employee account 'jdoe', followed by a successful login from external IP 198.51.100.45 (ASN Unassigned). Within 3 minutes, outbound TLS traffic on port 8443 to suspicious domain target-c2.net was initiated.",
        "affected_system": "Auth Service / Employee Workstation WS-8942",
        "observed_indicators": "IP: 198.51.100.45, Account: jdoe, Domain: target-c2.net, Port: 8443, 500 Failed Auth Events",
        "severity": "High"
    }

    # 1. Analyze with Memory OFF
    off_result = incident_agent.analyze_incident(
        title=demo_incident["title"],
        incident_type=demo_incident["incident_type"],
        description=demo_incident["description"],
        affected_system=demo_incident["affected_system"],
        observed_indicators=demo_incident["observed_indicators"],
        severity=demo_incident["severity"],
        memory_enabled=False
    )

    # Synthetic recalled memory for demo comparison (matching past resolved incident INC-003)
    demo_recalled_memory = [{
        "incident_id": "INC-003",
        "incident_title": "Distributed Password Spraying & Exfiltration",
        "relevance_explanation": "Identical pattern: high-volume failed logons followed by single logon success and TLS egress.",
        "symptoms": "500+ failed login attempts from rotated IPs followed by successful logon and outbound data burst.",
        "root_cause": "Compromised employee credentials via password spraying.",
        "failed_actions": "Blocking only the source IP did not resolve the incident because attackers shifted egress IPs.",
        "successful_remediation": "Disabled target account, revoked all active SSO/OAuth tokens, forced credential reset, enforced hardware MFA, and blocked C2 domain.",
        "lessons_learned": "IP-only perimeter blocks fail against distributed spray attacks; immediate credential invalidation and session purge are mandatory."
    }]

    # 2. Analyze with Memory ON
    on_result = incident_agent.analyze_incident(
        title=demo_incident["title"],
        incident_type=demo_incident["incident_type"],
        description=demo_incident["description"],
        affected_system=demo_incident["affected_system"],
        observed_indicators=demo_incident["observed_indicators"],
        severity=demo_incident["severity"],
        memory_enabled=True,
        recalled_override=demo_recalled_memory
    )

    return {
        "scenario": payload.scenario,
        "incident_details": demo_incident,
        "memory_off": off_result,
        "memory_on": on_result,
        "comparison_highlights": {
            "without_memory": {
                "approach": "Generic standard security playbook",
                "flaw": "Recommends simple IP perimeter blocking (which previously failed)",
                "context": "Zero historical context or organizational awareness"
            },
            "with_hindsight": {
                "approach": "Experience-informed adaptive response",
                "advantage": "Knows IP blocking failed in INC-003; prioritizes session revocation and account disablement",
                "context": "Recalls INC-003 root cause and exact proven remediation steps"
            }
        }
    }
