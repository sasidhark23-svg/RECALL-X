from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, JSON
from datetime import datetime
from backend.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    incident_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    affected_system = Column(String, nullable=False)
    observed_indicators = Column(Text, nullable=False)
    severity = Column(String, default="Medium")
    status = Column(String, default="Active") # Active or Resolved
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Resolution details
    confirmed_root_cause = Column(Text, nullable=True)
    actions_attempted = Column(Text, nullable=True)
    actions_failed = Column(Text, nullable=True)
    successful_remediation = Column(Text, nullable=True)
    lessons_learned = Column(Text, nullable=True)
    analyst_feedback = Column(Text, nullable=True)

    # AI Analysis details
    memory_used = Column(Boolean, default=False)
    latest_analysis = Column(JSON, nullable=True)

class MemoryActivity(Base):
    __tablename__ = "memory_activities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String, nullable=False, index=True)
    action_type = Column(String, nullable=False) # RETAIN, RECALL, SEARCH
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
