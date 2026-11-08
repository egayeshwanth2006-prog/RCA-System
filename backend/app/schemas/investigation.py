from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class FiveWhysStep(BaseModel):
    step: int
    why: str
    answer: str
    is_hypothesis: bool = True
    is_unsupported: bool = False

class FishboneFactor(BaseModel):
    id: Optional[str] = None
    factor: str
    sub_factors: List[str] = Field(default_factory=list)
    is_contributing: bool = True
    notes: Optional[str] = None

class FishboneData(BaseModel):
    man: List[FishboneFactor] = Field(default_factory=list)
    machine: List[FishboneFactor] = Field(default_factory=list)
    method: List[FishboneFactor] = Field(default_factory=list)
    material: List[FishboneFactor] = Field(default_factory=list)
    measurement: List[FishboneFactor] = Field(default_factory=list)
    environment: List[FishboneFactor] = Field(default_factory=list)

class RootCauseItem(BaseModel):
    id: Optional[int] = None
    cause_title: str
    category: str
    supporting_evidence: Optional[str] = None
    evidence_status: str = "Unverified hypothesis" # Supported by evidence, Partially supported, Unverified hypothesis, Ruled out
    confidence_level: str = "Medium" # High, Medium, Low
    verification_required: Optional[str] = None
    is_confirmed: bool = False

class MissingEvidenceItem(BaseModel):
    id: str
    item: str
    category: str
    status: str = "pending" # pending | obtained
    notes: Optional[str] = None

class CapaItem(BaseModel):
    id: Optional[int] = None
    action_type: str # Corrective, Preventive
    description: str
    reason_for_recommendation: Optional[str] = None
    related_root_cause: Optional[str] = None
    priority: str = "Medium" # Critical, High, Medium, Low
    responsible_person: str = "Unassigned"
    target_completion_date: Optional[str] = None
    status: str = "Pending" # Pending, In Progress, Completed, Overdue
    effectiveness_verification: Optional[str] = None

class ExtractedIncidentData(BaseModel):
    investigation_title: Optional[str] = None
    deviation_id: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    incident_date: Optional[str] = None
    manufacturing_stage: Optional[str] = None
    department: Optional[str] = None
    deviation_category: Optional[str] = None
    severity: Optional[str] = "Major"
    incident_description: Optional[str] = None
    expected_specification: Optional[str] = None
    actual_observation: Optional[str] = None
    immediate_actions_taken: Optional[str] = None
    potential_impact: Optional[str] = None
    missing_fields: List[str] = Field(default_factory=list)

class AIAnalysisResponse(BaseModel):
    extracted_data: ExtractedIncidentData
    five_whys: List[FiveWhysStep] = Field(default_factory=list)
    fishbone: FishboneData = Field(default_factory=FishboneData)
    potential_root_causes: List[RootCauseItem] = Field(default_factory=list)
    missing_evidence: List[MissingEvidenceItem] = Field(default_factory=list)
    capa_recommendations: List[CapaItem] = Field(default_factory=list)
    confidence_score: float = 0.85
    workflow_trace: List[str] = Field(default_factory=list)

class InvestigationCreate(BaseModel):
    title: str
    deviation_id: Optional[str] = None
    product_name: str
    batch_number: str
    manufacturing_date: Optional[str] = None
    incident_date: Optional[str] = None
    manufacturing_stage: Optional[str] = None
    department: Optional[str] = None
    deviation_category: Optional[str] = None
    severity: Optional[str] = "Major"
    incident_description: Optional[str] = None
    expected_specification: Optional[str] = None
    actual_observation: Optional[str] = None
    immediate_actions_taken: Optional[str] = None
    potential_impact: Optional[str] = None
    status: Optional[str] = "Draft"
    final_root_cause: Optional[str] = None
    confirmed_by: Optional[str] = None
    five_whys_data: Optional[List[Dict[str, Any]]] = None
    fishbone_data: Optional[Dict[str, Any]] = None
    missing_evidence_data: Optional[List[Dict[str, Any]]] = None
    root_causes: Optional[List[Dict[str, Any]]] = None
    capa_actions: Optional[List[Dict[str, Any]]] = None
    document_meta: Optional[Dict[str, Any]] = None

class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    deviation_id: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    incident_date: Optional[str] = None
    manufacturing_stage: Optional[str] = None
    department: Optional[str] = None
    deviation_category: Optional[str] = None
    severity: Optional[str] = None
    incident_description: Optional[str] = None
    expected_specification: Optional[str] = None
    actual_observation: Optional[str] = None
    immediate_actions_taken: Optional[str] = None
    potential_impact: Optional[str] = None
    status: Optional[str] = None
    final_root_cause: Optional[str] = None
    confirmed_by: Optional[str] = None
    five_whys_data: Optional[List[Dict[str, Any]]] = None
    fishbone_data: Optional[Dict[str, Any]] = None
    missing_evidence_data: Optional[List[Dict[str, Any]]] = None
    root_causes: Optional[List[Dict[str, Any]]] = None
    capa_actions: Optional[List[Dict[str, Any]]] = None

class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    upload_timestamp: datetime

    class Config:
        from_attributes = True

class RootCauseResponse(BaseModel):
    id: int
    investigation_id: str
    cause_title: str
    category: str
    supporting_evidence: Optional[str] = None
    evidence_status: str
    confidence_level: str
    verification_required: Optional[str] = None
    is_confirmed: bool

    class Config:
        from_attributes = True

class CapaActionResponse(BaseModel):
    id: int
    investigation_id: str
    action_type: str
    description: str
    reason_for_recommendation: Optional[str] = None
    related_root_cause: Optional[str] = None
    priority: str
    responsible_person: str
    target_completion_date: Optional[str] = None
    status: str
    effectiveness_verification: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class HistoryResponse(BaseModel):
    id: int
    investigation_id: str
    action: str
    performed_by: str
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class InvestigationDetailResponse(BaseModel):
    id: str
    title: str
    deviation_id: str
    product_name: str
    batch_number: str
    manufacturing_date: Optional[str] = None
    incident_date: Optional[str] = None
    manufacturing_stage: Optional[str] = None
    department: Optional[str] = None
    deviation_category: Optional[str] = None
    severity: str
    incident_description: Optional[str] = None
    expected_specification: Optional[str] = None
    actual_observation: Optional[str] = None
    immediate_actions_taken: Optional[str] = None
    potential_impact: Optional[str] = None
    status: str
    final_root_cause: Optional[str] = None
    confirmed_by: Optional[str] = None
    confirmed_at: Optional[datetime] = None
    five_whys_data: Optional[List[Dict[str, Any]]] = None
    fishbone_data: Optional[Dict[str, Any]] = None
    missing_evidence_data: Optional[List[Dict[str, Any]]] = None
    ai_confidence_score: float
    created_at: datetime
    updated_at: datetime
    documents: List[DocumentResponse] = []
    root_causes: List[RootCauseResponse] = []
    capa_actions: List[CapaActionResponse] = []
    history: List[HistoryResponse] = []

    class Config:
        from_attributes = True

InvestigationResponse = InvestigationDetailResponse

class InvestigationListItem(BaseModel):
    id: str
    title: str
    deviation_id: str
    product_name: str
    batch_number: str
    severity: str
    status: str
    created_at: datetime
    capa_count: int = 0

    class Config:
        from_attributes = True

class DashboardStatsResponse(BaseModel):
    total_investigations: int
    open_investigations: int
    under_investigation: int
    completed_investigations: int
    pending_capa_actions: int
    recent_investigations: List[InvestigationListItem]
    recent_activity: List[HistoryResponse]
