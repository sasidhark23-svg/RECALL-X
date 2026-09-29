from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class IncidentCreate(BaseModel):
    title: str = Field(..., example="500 failed login attempts followed by successful login")
    incident_type: str = Field(..., example="Credential Compromise")
    description: str = Field(..., example="Multiple failed auth attempts followed by successful access from unknown IP.")
    affected_system: str = Field(..., example="Auth Service / Active Directory")
    observed_indicators: str = Field(..., example="IP: 198.51.100.45, User: jdoe, EventID: 4625, 4624")
    severity: Optional[str] = Field("Medium", example="High")
    memory_enabled: bool = Field(True, description="Toggle Hindsight recall ON/OFF")

class IncidentResolve(BaseModel):
    confirmed_root_cause: str = Field(..., example="Compromised employee credentials via password spray.")
    actions_attempted: Optional[str] = Field("", example="IP blocking, account lockout")
    actions_failed: Optional[str] = Field("", example="IP-only blocking was ineffective as attack shifted IPs")
    successful_remediation: str = Field(..., example="Account disabled, active sessions revoked, credential reset, enforced MFA")
    lessons_learned: str = Field(..., example="IP blocking is insufficient against distributed spray; enforce MFA immediately")
    analyst_feedback: Optional[str] = Field("", example="High severity threat; prior incident INC-003 guidance saved 45 mins")

class RecalledMemoryItem(BaseModel):
    incident_id: str
    incident_title: str
    relevance_explanation: str
    symptoms: str
    root_cause: str
    failed_actions: str
    successful_remediation: str
    lessons_learned: str
    relevance_score: Optional[float] = None

class IncidentAnalysisResult(BaseModel):
    severity: str
    category: str
    summary: str
    confidence: str
    immediate_containment: List[str]
    investigation_steps: List[str]
    remediation_steps: List[str]
    recovery_steps: List[str]
    follow_up: List[str]
    memory_used: bool
    memory_influence: str
    recalled_incidents: List[RecalledMemoryItem] = []
    memory_status: str = "ACTIVE" # ACTIVE, DISABLED, UNAVAILABLE

class IncidentResponse(BaseModel):
    id: str
    title: str
    incident_type: str
    description: str
    affected_system: str
    observed_indicators: str
    severity: str
    status: str
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    confirmed_root_cause: Optional[str] = None
    actions_attempted: Optional[str] = None
    actions_failed: Optional[str] = None
    successful_remediation: Optional[str] = None
    lessons_learned: Optional[str] = None
    analyst_feedback: Optional[str] = None
    memory_used: bool = False
    latest_analysis: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class MemorySearchRequest(BaseModel):
    query: str

class MemorySearchResponse(BaseModel):
    query: str
    memories: List[Dict[str, Any]]
    count: int
    status: str

class DemoRunRequest(BaseModel):
    scenario: Optional[str] = "Suspicious authentication activity"

class AnalyticsResponse(BaseModel):
    total_incidents: int
    active_incidents: int
    resolved_incidents: int
    high_critical_incidents: int
    memories_learned: int
    incidents_by_type: Dict[str, int]
    incidents_by_severity: Dict[str, int]
    memory_assisted_analyses: int
    frequently_recalled_categories: Dict[str, int]
