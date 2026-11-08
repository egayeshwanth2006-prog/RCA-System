from typing import TypedDict, Optional, List, Dict, Any

class RCAState(TypedDict, total=False):
    # Input
    raw_text: str
    source_type: str  # "pdf", "text", "email"
    
    # Node 1: Processed text
    cleaned_text: str
    metadata: Dict[str, Any]

    # Node 2: Extracted Information
    extracted_info: Dict[str, Any]

    # Node 3: Validation
    missing_fields: List[str]
    data_conflicts: List[str]
    validation_notes: str

    # Node 4: RCA Generation
    five_whys: List[Dict[str, Any]]
    fishbone: Dict[str, List[Dict[str, Any]]]
    potential_root_causes: List[Dict[str, Any]]

    # Node 5: Evidence Assessment
    evidence_assessment: Dict[str, Any]
    missing_evidence_checklist: List[Dict[str, Any]]

    # Node 6: CAPA Recommendations
    capa_recommendations: List[Dict[str, Any]]

    # Node 7: Human Review & Final Synthesis
    workflow_trace: List[str]
    human_review_payload: Dict[str, Any]
    confidence_score: float
    error: Optional[str]
