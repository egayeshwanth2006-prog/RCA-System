"""
Sample Pharmaceutical Manufacturing Incidents for AIVOA.AI Testing & Demonstration.
Compliant with ICH Q7 (GMP for APIs) & ICH Q10 guidelines.
"""

SAMPLE_INCIDENTS = [
    {
        "id": "DEMO-001",
        "title": "API-001 Out of Specification Chemical Impurity Exceedance",
        "product_name": "Active Pharmaceutical Ingredient API-001",
        "batch_number": "BATCH-2026-105",
        "severity": "Critical",
        "manufacturing_stage": "Chemical Reaction / Synthesis",
        "department": "API Production Facility 2",
        "expected_specification": "Related Substances Impurity Level: Maximum 0.5% (w/w)",
        "actual_observation": "Analytical QC HPLC test revealed Related Substance Impurity at 1.2% (w/w)",
        "incident_date": "2026-11-04",
        "raw_text": """INVESTIGATION INCIDENT REPORT — PHARMA QUALITY ASSURANCE
Deviation ID: DEV-2026-105
Product: Active Pharmaceutical Ingredient API-001
Batch Number: BATCH-2026-105
Manufacturing Date: 2026-11-02
Incident Date: 2026-11-04
Manufacturing Stage: Chemical Reaction
Department: API Production Facility 2
Deviation Category: Out of Specification (OOS) / Chemical Purity Excursion
Severity: Critical

Expected Specification:
Related Substances Impurity Level: Maximum 0.5% (Ph. Eur. / USP Monograph 4012).

Actual Observation:
During routine quality control release testing, the impurity level in the manufactured API batch was found to be 1.2%, exceeding the approved specification of 0.5%. 

Incident Description:
During routine quality control testing, the impurity level in the manufactured API batch was found to be 1.2%, exceeding the approved specification of 0.5%. The batch was placed on quality hold, and an investigation was initiated to determine the cause. Shift supervisor logs noted a minor 3.8°C thermal lag in Reactor R-201 temperature indicator (TE-204) during the 4-hour exothermic reaction holding window.

Immediate Actions Taken:
1. The batch BATCH-2026-105 was placed on quality hold in the ERP/MES system.
2. Physical quarantine tags were affixed to all containment drums in Warehouse Bay 4.
3. An investigation team comprising Production, QC, QA, and Metrology was chartered.

Potential Impact:
Batch cannot be released for commercial distribution or formulation into finished dosage tablets. Risk of elevated toxicological impurity profile if consumed by patients.""",
        "email_content": """From: dr.elena.vance@pharma-quality.aivoa.com
To: deviation-triage@pharma-quality.aivoa.com, qp-office@pharma-quality.aivoa.com
Date: 2026-11-04 09:45:00 UTC
Subject: CRITICAL DEVIATION: OOS Impurity in API-001 Batch BATCH-2026-105

Dear Quality Committee,

During routine QC HPLC chromatography on API-001 Lot BATCH-2026-105, our analytical laboratory confirmed an impurity peak of 1.2% against our approved specification of <= 0.5%.

Batch Details:
- Product: Active Pharmaceutical Ingredient API-001
- Batch Number: BATCH-2026-105
- Manufacturing Stage: Chemical Reaction (Reactor R-201)
- Date Manufactured: 2026-11-02

The batch has been quarantined on ERP hold. Preliminary data review indicates reactor jacket temperature sensor TE-204 may have had a 3.8°C temperature excursion due to overdue metrology calibration. Immediate Root Cause Analysis and CAPA assignment is required under ICH Q10.

Regards,
Dr. Elena Vance, Head of QC Analytical Chemistry"""
    },
    {
        "id": "DEMO-002",
        "title": "Atorvastatin Calcium Crystallization Temperature Excursion",
        "product_name": "Atorvastatin Calcium Trihydrate",
        "batch_number": "ATV-2026-088",
        "severity": "Major",
        "manufacturing_stage": "Crystallization & Isolation",
        "department": "Sterile API Suite A",
        "expected_specification": "Crystallization slurry temperature maintained between 18.0°C and 22.0°C for 6 hours",
        "actual_observation": "Chilled glycol jacket supply valve stuck open; slurry temperature plummeted to 11.4°C for 85 minutes",
        "incident_date": "2026-11-05",
        "raw_text": """MANUFACTURING DEVIATION REPORT — API SUITE A
Deviation Number: DEV-2026-088
Product: Atorvastatin Calcium Trihydrate (API)
Batch: ATV-2026-088
Date: 2026-11-05
Department: API Suite A - Isolation & Crystallization
Severity: Major

Specification:
Crystallization slurry temperature maintained strictly between 18.0°C and 22.0°C for 6 hours.

Actual Finding:
At 03:15 during night shift, the chilled glycol control valve (FCV-102) jammed in the 100% open position due to pneumatic diaphragm wear. Slurry temperature dropped to 11.4°C and remained sub-cooled for 85 minutes before operator manual override.

Immediate Containment:
Manual glycol bypass engaged. Slurry slowly reheated to 20°C. Batch held in crystallizer vessel pending particle size distribution (PSD) and polymorphic form XRD analysis.""",
        "email_content": ""
    }
]
