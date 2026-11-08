from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON, Index
)
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    deviation_id = Column(String(100), nullable=False, index=True)
    product_name = Column(String(255), nullable=False, index=True)
    batch_number = Column(String(100), nullable=False, index=True)
    manufacturing_date = Column(String(50), nullable=True)
    incident_date = Column(String(50), nullable=True)
    manufacturing_stage = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    deviation_category = Column(String(100), nullable=True)
    severity = Column(String(50), default="Major", index=True) # Minor, Major, Critical
    incident_description = Column(Text, nullable=True)
    expected_specification = Column(Text, nullable=True)
    actual_observation = Column(Text, nullable=True)
    immediate_actions_taken = Column(Text, nullable=True)
    potential_impact = Column(Text, nullable=True)
    status = Column(String(50), default="Draft", index=True) # Draft, Under Investigation, Completed, Approved
    
    # Review & Approval
    final_root_cause = Column(Text, nullable=True)
    confirmed_by = Column(String(150), nullable=True)
    confirmed_at = Column(DateTime, nullable=True)
    
    # Structured RCA & Evidence
    five_whys_data = Column(JSON, nullable=True)
    fishbone_data = Column(JSON, nullable=True)
    missing_evidence_data = Column(JSON, nullable=True)
    ai_confidence_score = Column(Float, default=0.85)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    documents = relationship("Document", back_populates="investigation", cascade="all, delete-orphan")
    root_causes = relationship("RootCause", back_populates="investigation", cascade="all, delete-orphan")
    capa_actions = relationship("CapaAction", back_populates="investigation", cascade="all, delete-orphan")
    history = relationship("InvestigationHistory", back_populates="investigation", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_inv_status_severity", "status", "severity"),
    )


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    investigation_id = Column(String(50), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False) # pdf, text, email
    file_size = Column(Integer, default=0)
    extracted_text = Column(Text, nullable=True)
    upload_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="documents")


class RootCause(Base):
    __tablename__ = "root_causes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    investigation_id = Column(String(50), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    cause_title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # Man, Machine, Method, Material, Measurement, Environment
    supporting_evidence = Column(Text, nullable=True)
    evidence_status = Column(String(50), default="Unverified hypothesis") # Supported by evidence, Partially supported, Unverified hypothesis, Ruled out
    confidence_level = Column(String(50), default="Medium") # High, Medium, Low
    verification_required = Column(Text, nullable=True)
    is_confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="root_causes")


class CapaAction(Base):
    __tablename__ = "capa_actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    investigation_id = Column(String(50), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(50), nullable=False) # Corrective, Preventive
    description = Column(Text, nullable=False)
    reason_for_recommendation = Column(Text, nullable=True)
    related_root_cause = Column(String(255), nullable=True)
    priority = Column(String(50), default="Medium") # Critical, High, Medium, Low
    responsible_person = Column(String(150), default="Unassigned")
    target_completion_date = Column(String(50), nullable=True)
    status = Column(String(50), default="Pending", index=True) # Pending, In Progress, Completed, Overdue
    effectiveness_verification = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="capa_actions")


class InvestigationHistory(Base):
    __tablename__ = "investigation_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    investigation_id = Column(String(50), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(100), nullable=False) # Created, AI Analyzed, Updated, CAPA Added, QP Approved
    performed_by = Column(String(150), default="System")
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="history")
