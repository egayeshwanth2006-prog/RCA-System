import os
import uuid
import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.database.connection import get_db, get_db_status
from app.models.investigation import (
    Investigation,
    Document,
    RootCause,
    CapaAction,
    InvestigationHistory
)
from app.schemas.investigation import (
    AIAnalysisResponse,
    InvestigationCreate,
    InvestigationUpdate,
    InvestigationDetailResponse,
    InvestigationListItem,
    DashboardStatsResponse,
    CapaActionResponse,
    HistoryResponse
)
from app.services.pdf_parser import extract_text_from_pdf_bytes
from app.services.groq_service import (
    get_groq_api_key,
    set_runtime_groq_config,
    get_active_model,
    test_groq_connection
)
from app.services.sample_incidents import SAMPLE_INCIDENTS
from app.ai.graph import run_rca_workflow

logger = logging.getLogger("aivoa.api")

router = APIRouter()

# ==============================================================
# 1. AI ANALYSIS ENDPOINTS
# ==============================================================
@router.post("/investigations/analyze", response_model=AIAnalysisResponse)
async def analyze_incident(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    email_content: Optional[str] = Form(None),
    source_type: Optional[str] = Form("text")
):
    """
    Intake incident via PDF upload, pasted text, or email content.
    Executes the 7-node LangGraph workflow and returns structured results.
    """
    input_text = ""
    detected_source = source_type or "text"

    if file and file.filename:
        # Check PDF or text file
        content = await file.read()
        detected_source = "pdf" if file.filename.lower().endswith(".pdf") else "document"
        if file.filename.lower().endswith(".pdf"):
            try:
                extracted, _ = extract_text_from_pdf_bytes(content, file.filename)
                input_text = extracted
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse PDF document: {str(e)}")
        else:
            try:
                input_text = content.decode("utf-8")
            except UnicodeDecodeError:
                input_text = content.decode("latin-1", errors="ignore")
    elif email_content and email_content.strip():
        input_text = email_content.strip()
        detected_source = "email"
    elif text and text.strip():
        input_text = text.strip()
        detected_source = "text"
    else:
        raise HTTPException(
            status_code=400,
            detail="No incident content provided. Please upload a PDF, paste incident text, or provide email content."
        )

    if len(input_text.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Incident content is too brief to analyze. Please provide detailed manufacturing deviation notes."
        )

    try:
        # Execute LangGraph 7-node workflow
        graph_output = run_rca_workflow(input_text, detected_source)

        return AIAnalysisResponse(
            extracted_data=graph_output.get("extracted_info", {}),
            five_whys=graph_output.get("five_whys", []),
            fishbone=graph_output.get("fishbone", {}),
            potential_root_causes=graph_output.get("potential_root_causes", []),
            missing_evidence=graph_output.get("missing_evidence_checklist", []),
            capa_recommendations=graph_output.get("capa_recommendations", []),
            confidence_score=graph_output.get("confidence_score", 0.85),
            workflow_trace=graph_output.get("workflow_trace", [])
        )
    except Exception as e:
        logger.error(f"LangGraph analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI Workflow execution error: {str(e)}")


@router.post("/investigations/{id}/reanalyze", response_model=AIAnalysisResponse)
def reanalyze_investigation(id: str, db: Session = Depends(get_db)):
    """Re-run AI analysis on an existing investigation's description/document."""
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation {id} not found")

    text_to_analyze = f"{inv.title}\n{inv.incident_description}\nSpecification: {inv.expected_specification}\nObservation: {inv.actual_observation}"
    
    # Check if original document text exists
    doc = db.query(Document).filter(Document.investigation_id == id).first()
    if doc and doc.extracted_text:
        text_to_analyze = doc.extracted_text

    try:
        graph_output = run_rca_workflow(text_to_analyze, "text")

        # Update investigation record with new analysis
        inv.five_whys_data = graph_output.get("five_whys", [])
        inv.fishbone_data = graph_output.get("fishbone", {})
        inv.missing_evidence_data = graph_output.get("missing_evidence_checklist", [])
        inv.ai_confidence_score = graph_output.get("confidence_score", 0.85)

        # Log history
        history = InvestigationHistory(
            investigation_id=inv.id,
            action="AI Re-Analysis Executed",
            performed_by="Quality AI Specialist",
            details="Regenerated 5 Whys, Ishikawa Fishbone, and forensic evidence checklist."
        )
        db.add(history)
        db.commit()

        return AIAnalysisResponse(
            extracted_data=graph_output.get("extracted_info", {}),
            five_whys=graph_output.get("five_whys", []),
            fishbone=graph_output.get("fishbone", {}),
            potential_root_causes=graph_output.get("potential_root_causes", []),
            missing_evidence=graph_output.get("missing_evidence_checklist", []),
            capa_recommendations=graph_output.get("capa_recommendations", []),
            confidence_score=graph_output.get("confidence_score", 0.85),
            workflow_trace=graph_output.get("workflow_trace", [])
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Re-analysis failed: {str(e)}")


# ==============================================================
# 2. INVESTIGATIONS CRUD
# ==============================================================
@router.post("/investigations", response_model=InvestigationDetailResponse)
def create_investigation(data: InvestigationCreate, db: Session = Depends(get_db)):
    """Save a new pharmaceutical investigation to the database."""
    # Generate unique ID
    current_year = datetime.utcnow().year
    inv_count = db.query(Investigation).count() + 1
    generated_id = f"INV-{current_year}-{inv_count:04d}"
    
    dev_id = data.deviation_id or f"DEV-{current_year}-{uuid.uuid4().hex[:5].upper()}"

    new_inv = Investigation(
        id=generated_id,
        title=data.title,
        deviation_id=dev_id,
        product_name=data.product_name,
        batch_number=data.batch_number,
        manufacturing_date=data.manufacturing_date,
        incident_date=data.incident_date or datetime.utcnow().strftime("%Y-%m-%d"),
        manufacturing_stage=data.manufacturing_stage,
        department=data.department,
        deviation_category=data.deviation_category,
        severity=data.severity or "Major",
        incident_description=data.incident_description,
        expected_specification=data.expected_specification,
        actual_observation=data.actual_observation,
        immediate_actions_taken=data.immediate_actions_taken,
        potential_impact=data.potential_impact,
        status=data.status or "Draft",
        final_root_cause=data.final_root_cause,
        confirmed_by=data.confirmed_by,
        confirmed_at=datetime.utcnow() if data.confirmed_by else None,
        five_whys_data=data.five_whys_data or [],
        fishbone_data=data.fishbone_data or {},
        missing_evidence_data=data.missing_evidence_data or [],
        ai_confidence_score=0.88
    )
    db.add(new_inv)
    db.flush()

    # Save document if metadata provided
    if data.document_meta:
        doc = Document(
            investigation_id=new_inv.id,
            filename=data.document_meta.get("filename", "incident_report.txt"),
            file_type=data.document_meta.get("file_type", "text"),
            file_size=data.document_meta.get("file_size", 0),
            extracted_text=data.document_meta.get("extracted_text", "")
        )
        db.add(doc)

    # Save Root Causes
    if data.root_causes:
        for rc in data.root_causes:
            root_cause_obj = RootCause(
                investigation_id=new_inv.id,
                cause_title=rc.get("cause_title", "Unspecified Cause"),
                category=rc.get("category", "Method"),
                supporting_evidence=rc.get("supporting_evidence"),
                evidence_status=rc.get("evidence_status", "Unverified hypothesis"),
                confidence_level=rc.get("confidence_level", "Medium"),
                verification_required=rc.get("verification_required"),
                is_confirmed=rc.get("is_confirmed", False)
            )
            db.add(root_cause_obj)

    # Save CAPA Actions
    if data.capa_actions:
        for capa in data.capa_actions:
            capa_obj = CapaAction(
                investigation_id=new_inv.id,
                action_type=capa.get("action_type", "Corrective"),
                description=capa.get("description", ""),
                reason_for_recommendation=capa.get("reason_for_recommendation"),
                related_root_cause=capa.get("related_root_cause"),
                priority=capa.get("priority", "Medium"),
                responsible_person=capa.get("responsible_person", "Unassigned"),
                target_completion_date=capa.get("target_completion_date"),
                status=capa.get("status", "Pending"),
                effectiveness_verification=capa.get("effectiveness_verification")
            )
            db.add(capa_obj)

    # Initial history entry
    history = InvestigationHistory(
        investigation_id=new_inv.id,
        action="Investigation Created",
        performed_by="Quality Assurance Specialist",
        details=f"Investigation {new_inv.id} created for {new_inv.product_name} lot {new_inv.batch_number}."
    )
    db.add(history)

    db.commit()
    db.refresh(new_inv)
    return new_inv


@router.get("/investigations", response_model=List[InvestigationListItem])
def list_investigations(
    search: Optional[str] = Query(None, description="Search by ID, title, product, or batch"),
    status: Optional[str] = Query(None, description="Filter by status (Draft, Under Investigation, Completed, Approved)"),
    severity: Optional[str] = Query(None, description="Filter by severity (Minor, Major, Critical)"),
    sort: Optional[str] = Query("desc", description="Sort by date: 'asc' or 'desc'"),
    db: Session = Depends(get_db)
):
    """Retrieve all investigations with search, filtering, and sorting."""
    query = db.query(Investigation)

    if status and status != "All":
        query = query.filter(Investigation.status == status)

    if severity and severity != "All":
        query = query.filter(Investigation.severity == severity)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (Investigation.id.ilike(term)) |
            (Investigation.title.ilike(term)) |
            (Investigation.product_name.ilike(term)) |
            (Investigation.batch_number.ilike(term)) |
            (Investigation.deviation_id.ilike(term))
        )

    if sort == "asc":
        query = query.order_by(Investigation.created_at.asc())
    else:
        query = query.order_by(Investigation.created_at.desc())

    investigations = query.all()

    # Format list response with CAPA count
    results = []
    for inv in investigations:
        capa_count = db.query(func.count(CapaAction.id)).filter(CapaAction.investigation_id == inv.id).scalar() or 0
        results.append(InvestigationListItem(
            id=inv.id,
            title=inv.title,
            deviation_id=inv.deviation_id,
            product_name=inv.product_name,
            batch_number=inv.batch_number,
            severity=inv.severity,
            status=inv.status,
            created_at=inv.created_at,
            capa_count=capa_count
        ))

    return results


@router.get("/investigations/{id}", response_model=InvestigationDetailResponse)
def get_investigation_details(id: str, db: Session = Depends(get_db)):
    """Fetch complete investigation record including root causes, CAPA, documents, and audit trail."""
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation with ID '{id}' not found")
    return inv


@router.put("/investigations/{id}", response_model=InvestigationDetailResponse)
def update_investigation(id: str, data: InvestigationUpdate, db: Session = Depends(get_db)):
    """Update investigation details, evidence checklist, root causes, or CAPA."""
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation with ID '{id}' not found")

    update_dict = data.model_dump(exclude_unset=True)
    
    # Handle status change or QP confirmation
    prev_status = inv.status
    if "status" in update_dict and update_dict["status"] != prev_status:
        db.add(InvestigationHistory(
            investigation_id=inv.id,
            action=f"Status Changed: {prev_status} → {update_dict['status']}",
            performed_by=data.confirmed_by or "Quality Reviewer",
            details=f"Investigation status updated to {update_dict['status']}."
        ))

    if "confirmed_by" in update_dict and update_dict["confirmed_by"]:
        inv.confirmed_by = update_dict["confirmed_by"]
        inv.confirmed_at = datetime.utcnow()
        db.add(InvestigationHistory(
            investigation_id=inv.id,
            action="Qualified Person (QP) Sign-off",
            performed_by=inv.confirmed_by,
            details=f"Root cause confirmed and investigation approved by QP: {inv.confirmed_by}"
        ))

    # Update basic scalar fields
    for field, val in update_dict.items():
        if field not in ("root_causes", "capa_actions"):
            setattr(inv, field, val)

    # Sync Root Causes if supplied
    if "root_causes" in update_dict and update_dict["root_causes"] is not None:
        db.query(RootCause).filter(RootCause.investigation_id == id).delete()
        for rc in update_dict["root_causes"]:
            db.add(RootCause(
                investigation_id=id,
                cause_title=rc.get("cause_title", "Root cause"),
                category=rc.get("category", "Method"),
                supporting_evidence=rc.get("supporting_evidence"),
                evidence_status=rc.get("evidence_status", "Unverified hypothesis"),
                confidence_level=rc.get("confidence_level", "Medium"),
                verification_required=rc.get("verification_required"),
                is_confirmed=rc.get("is_confirmed", False)
            ))

    # Sync CAPA actions if supplied
    if "capa_actions" in update_dict and update_dict["capa_actions"] is not None:
        db.query(CapaAction).filter(CapaAction.investigation_id == id).delete()
        for capa in update_dict["capa_actions"]:
            db.add(CapaAction(
                investigation_id=id,
                action_type=capa.get("action_type", "Corrective"),
                description=capa.get("description", ""),
                reason_for_recommendation=capa.get("reason_for_recommendation"),
                related_root_cause=capa.get("related_root_cause"),
                priority=capa.get("priority", "Medium"),
                responsible_person=capa.get("responsible_person", "Unassigned"),
                target_completion_date=capa.get("target_completion_date"),
                status=capa.get("status", "Pending"),
                effectiveness_verification=capa.get("effectiveness_verification")
            ))

    db.commit()
    db.refresh(inv)
    return inv


@router.delete("/investigations/{id}")
def delete_investigation(id: str, db: Session = Depends(get_db)):
    """Delete an investigation by ID."""
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation with ID '{id}' not found")

    db.delete(inv)
    db.commit()
    return {"success": True, "message": f"Investigation '{id}' deleted successfully"}


# ==============================================================
# 3. CAPA MANAGEMENT ENDPOINTS
# ==============================================================
@router.get("/capa", response_model=List[CapaActionResponse])
def get_all_capa_actions(
    status: Optional[str] = Query(None, description="Filter by status (Pending, In Progress, Completed, Overdue)"),
    priority: Optional[str] = Query(None, description="Filter by priority (Critical, High, Medium, Low)"),
    db: Session = Depends(get_db)
):
    """Retrieve all CAPA actions across all investigations."""
    query = db.query(CapaAction)

    if status and status != "All":
        query = query.filter(CapaAction.status == status)

    if priority and priority != "All":
        query = query.filter(CapaAction.priority == priority)

    return query.order_by(desc(CapaAction.created_at)).all()


@router.put("/capa/{id}", response_model=CapaActionResponse)
def update_capa_action(
    id: int,
    action_type: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    responsible_person: Optional[str] = None,
    target_completion_date: Optional[str] = None,
    status: Optional[str] = None,
    effectiveness_verification: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Update a specific CAPA action's status, assignee, or verification details."""
    capa = db.query(CapaAction).filter(CapaAction.id == id).first()
    if not capa:
        raise HTTPException(status_code=404, detail=f"CAPA action with ID {id} not found")

    if action_type:
        capa.action_type = action_type
    if description:
        capa.description = description
    if priority:
        capa.priority = priority
    if responsible_person:
        capa.responsible_person = responsible_person
    if target_completion_date:
        capa.target_completion_date = target_completion_date
    if status:
        prev = capa.status
        capa.status = status
        # Log to parent investigation history
        db.add(InvestigationHistory(
            investigation_id=capa.investigation_id,
            action=f"CAPA #{id} Status Updated: {prev} → {status}",
            performed_by=responsible_person or "CAPA Owner",
            details=f"Action '{capa.description[:60]}...' changed status to {status}."
        ))
    if effectiveness_verification:
        capa.effectiveness_verification = effectiveness_verification

    db.commit()
    db.refresh(capa)
    return capa


@router.post("/capa", response_model=CapaActionResponse)
def create_standalone_capa(
    investigation_id: str,
    action_type: str,
    description: str,
    priority: str = "Medium",
    responsible_person: str = "Unassigned",
    target_completion_date: Optional[str] = None,
    reason_for_recommendation: Optional[str] = None,
    effectiveness_verification: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Add a new CAPA action to an existing investigation."""
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation '{investigation_id}' not found")

    capa = CapaAction(
        investigation_id=investigation_id,
        action_type=action_type,
        description=description,
        priority=priority,
        responsible_person=responsible_person,
        target_completion_date=target_completion_date,
        reason_for_recommendation=reason_for_recommendation,
        effectiveness_verification=effectiveness_verification,
        status="Pending"
    )
    db.add(capa)
    db.commit()
    db.refresh(capa)
    return capa


@router.delete("/capa/{id}")
def delete_capa_action(id: int, db: Session = Depends(get_db)):
    """Delete a CAPA action."""
    capa = db.query(CapaAction).filter(CapaAction.id == id).first()
    if not capa:
        raise HTTPException(status_code=404, detail=f"CAPA with ID {id} not found")

    db.delete(capa)
    db.commit()
    return {"success": True, "message": f"CAPA #{id} deleted successfully"}


# ==============================================================
# 4. DASHBOARD STATS
# ==============================================================
@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Retrieve statistical overview for the main dashboard."""
    total = db.query(func.count(Investigation.id)).scalar() or 0
    open_count = db.query(func.count(Investigation.id)).filter(Investigation.status == "Draft").scalar() or 0
    under_inv = db.query(func.count(Investigation.id)).filter(Investigation.status == "Under Investigation").scalar() or 0
    completed = db.query(func.count(Investigation.id)).filter(Investigation.status.in_(["Completed", "Approved"])).scalar() or 0
    pending_capa = db.query(func.count(CapaAction.id)).filter(CapaAction.status.in_(["Pending", "In Progress"])).scalar() or 0

    recent_invs = db.query(Investigation).order_by(desc(Investigation.created_at)).limit(5).all()
    formatted_recent = []
    for inv in recent_invs:
        capa_count = db.query(func.count(CapaAction.id)).filter(CapaAction.investigation_id == inv.id).scalar() or 0
        formatted_recent.append(InvestigationListItem(
            id=inv.id,
            title=inv.title,
            deviation_id=inv.deviation_id,
            product_name=inv.product_name,
            batch_number=inv.batch_number,
            severity=inv.severity,
            status=inv.status,
            created_at=inv.created_at,
            capa_count=capa_count
        ))

    recent_act = db.query(InvestigationHistory).order_by(desc(InvestigationHistory.timestamp)).limit(8).all()

    return DashboardStatsResponse(
        total_investigations=total,
        open_investigations=open_count,
        under_investigation=under_inv,
        completed_investigations=completed,
        pending_capa_actions=pending_capa,
        recent_investigations=formatted_recent,
        recent_activity=recent_act
    )


# ==============================================================
# 5. SETTINGS & GROQ CONFIGURATION
# ==============================================================
@router.get("/settings")
def get_system_settings():
    """Return runtime configuration status."""
    has_key = bool(get_groq_api_key())
    key_preview = f"{get_groq_api_key()[:8]}...{get_groq_api_key()[-4:]}" if (has_key and len(get_groq_api_key()) > 12) else ("Configured" if has_key else "Not Set")
    
    return {
        "groq_configured": has_key,
        "groq_key_preview": key_preview,
        "active_model": get_active_model(),
        "database": get_db_status(),
        "supported_models": [
            "llama-3.3-70b-versatile",
            "llama-3.1-70b-versatile",
            "mixtral-8x7b-32768"
        ],
        "compliance_standards": ["ICH Q7 (APIs)", "ICH Q9 (Risk)", "ICH Q10 (Quality Systems)", "EU GMP Annex 16"]
    }


@router.post("/settings")
def update_settings(
    groq_api_key: Optional[str] = Form(None),
    groq_model: Optional[str] = Form(None)
):
    """Update runtime Groq API key or model without server restart."""
    set_runtime_groq_config(groq_api_key, groq_model)
    return {
        "success": True,
        "message": "Configuration updated successfully",
        "active_model": get_active_model(),
        "groq_configured": bool(get_groq_api_key())
    }


@router.post("/settings/test-groq")
def test_groq_endpoint(groq_api_key: Optional[str] = Form(None)):
    """Test Groq API connectivity and return result."""
    return test_groq_connection(groq_api_key)


# ==============================================================
# 6. DEMO DATA SEEDING
# ==============================================================
@router.post("/seed-demo")
def seed_demo_data(db: Session = Depends(get_db)):
    """Seed the database with sample pharmaceutical deviation scenarios."""
    seeded_count = 0
    for sample in SAMPLE_INCIDENTS:
        existing = db.query(Investigation).filter(Investigation.deviation_id == sample.get("id")).first()
        if not existing:
            # Run LangGraph workflow on sample text
            graph_res = run_rca_workflow(sample["raw_text"], "text")
            
            inv_count = db.query(Investigation).count() + 1
            inv_id = f"INV-2026-{inv_count:04d}"

            inv = Investigation(
                id=inv_id,
                title=sample["title"],
                deviation_id=sample["id"],
                product_name=sample["product_name"],
                batch_number=sample["batch_number"],
                manufacturing_date="2026-11-02",
                incident_date=sample["incident_date"],
                manufacturing_stage=sample["manufacturing_stage"],
                department=sample["department"],
                deviation_category="Chemical Purity / OOS",
                severity=sample["severity"],
                incident_description=sample["raw_text"][:600],
                expected_specification=sample["expected_specification"],
                actual_observation=sample["actual_observation"],
                immediate_actions_taken="Batch quarantined on ERP hold; warehouse physical locks applied.",
                potential_impact="Risk of out-of-specification drug substance reaching formulation stage.",
                status="Under Investigation",
                five_whys_data=graph_res.get("five_whys", []),
                fishbone_data=graph_res.get("fishbone", {}),
                missing_evidence_data=graph_res.get("missing_evidence_checklist", []),
                ai_confidence_score=0.88
            )
            db.add(inv)
            db.flush()

            # Add sample document
            db.add(Document(
                investigation_id=inv.id,
                filename="deviation_incident_log.txt",
                file_type="text",
                file_size=len(sample["raw_text"]),
                extracted_text=sample["raw_text"]
            ))

            # Add root causes
            for rc in graph_res.get("potential_root_causes", []):
                db.add(RootCause(
                    investigation_id=inv.id,
                    cause_title=rc["cause_title"],
                    category=rc["category"],
                    supporting_evidence=rc.get("supporting_evidence"),
                    evidence_status=rc.get("evidence_status", "Partially supported"),
                    confidence_level=rc.get("confidence_level", "High"),
                    verification_required=rc.get("verification_required")
                ))

            # Add CAPAs
            for capa in graph_res.get("capa_recommendations", []):
                db.add(CapaAction(
                    investigation_id=inv.id,
                    action_type=capa["action_type"],
                    description=capa["description"],
                    reason_for_recommendation=capa.get("reason_for_recommendation"),
                    related_root_cause=capa.get("related_root_cause"),
                    priority=capa.get("priority", "Medium"),
                    responsible_person=capa.get("responsible_person", "Quality Operations"),
                    target_completion_date=capa.get("target_completion_date", "2026-12-01"),
                    status="In Progress",
                    effectiveness_verification=capa.get("effectiveness_verification")
                ))

            # Add history
            db.add(InvestigationHistory(
                investigation_id=inv.id,
                action="Investigation Initialized (Demo Seed)",
                performed_by="System Administrator",
                details=f"Loaded realistic pharmaceutical incident scenario for {sample['product_name']}."
            ))

            seeded_count += 1

    db.commit()
    return {"success": True, "seeded": seeded_count, "message": f"Successfully seeded {seeded_count} investigations"}
