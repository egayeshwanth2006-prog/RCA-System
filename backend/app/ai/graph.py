import logging
from typing import Dict, Any
from langgraph.graph import StateGraph, END

from app.ai.state import RCAState
from app.ai.nodes import (
    node_document_text_processing,
    node_incident_information_extraction,
    node_information_validation,
    node_root_cause_analysis,
    node_evidence_assessment,
    node_capa_generation,
    node_human_review
)

logger = logging.getLogger("aivoa.graph")

def create_rca_graph():
    """
    Constructs the 7-node LangGraph execution pipeline for AIVOA.AI:
    Node 1: Document Text Processing
    Node 2: Incident Information Extraction
    Node 3: Information Validation
    Node 4: Root Cause Analysis
    Node 5: Evidence Assessment
    Node 6: CAPA Generation
    Node 7: Human Review
    """
    builder = StateGraph(RCAState)

    # Register all 7 nodes
    builder.add_node("document_text_processing", node_document_text_processing)
    builder.add_node("incident_information_extraction", node_incident_information_extraction)
    builder.add_node("information_validation", node_information_validation)
    builder.add_node("root_cause_analysis", node_root_cause_analysis)
    builder.add_node("evidence_assessment", node_evidence_assessment)
    builder.add_node("capa_generation", node_capa_generation)
    builder.add_node("human_review", node_human_review)

    # Establish linear transitions
    builder.set_entry_point("document_text_processing")
    builder.add_edge("document_text_processing", "incident_information_extraction")
    builder.add_edge("incident_information_extraction", "information_validation")
    builder.add_edge("information_validation", "root_cause_analysis")
    builder.add_edge("root_cause_analysis", "evidence_assessment")
    builder.add_edge("evidence_assessment", "capa_generation")
    builder.add_edge("capa_generation", "human_review")
    builder.add_edge("human_review", END)

    compiled_graph = builder.compile()
    logger.info("LangGraph 7-node RCA workflow compiled successfully.")
    return compiled_graph

# Single compiled instance ready for execution
rca_graph = create_rca_graph()

def run_rca_workflow(raw_text: str, source_type: str = "text") -> RCAState:
    """Execute the full LangGraph workflow given raw text and source type."""
    initial_state: RCAState = {
        "raw_text": raw_text,
        "source_type": source_type,
        "workflow_trace": []
    }
    result_state = rca_graph.invoke(initial_state)
    return result_state
