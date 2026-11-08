import io
import sys
import unittest
from fastapi.testclient import TestClient

from app.main import app
from app.database.connection import init_db

class TestAivoaRcaModule(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def test_01_health_and_settings(self):
        # 1. Health check
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "healthy")

        # 2. Settings
        res_settings = self.client.get("/api/settings")
        self.assertEqual(res_settings.status_code, 200)
        data = res_settings.json()
        self.assertIn("active_model", data)
        self.assertIn("database", data)

    def test_02_seed_demo_data(self):
        res = self.client.post("/api/seed-demo")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["success"])

    def test_03_dashboard_stats(self):
        res = self.client.get("/api/dashboard/stats")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["total_investigations"], 0)
        self.assertGreater(data["pending_capa_actions"], 0)
        self.assertTrue(len(data["recent_investigations"]) > 0)

    def test_04_ai_analysis_pasted_text(self):
        text_payload = """
        Deviation ID: DEV-2026-105
        Product Name: Active Pharmaceutical Ingredient API-001
        Batch Number: BATCH-2026-105
        Manufacturing Stage: Chemical Reaction
        Severity: Critical
        Specification: Impurity level maximum 0.5%
        Actual Observation: Impurity level was found at 1.2%
        Incident Description: During routine QC release testing, impurity was 1.2% exceeding 0.5% limit.
        Immediate Action: Placed batch on quality hold in warehouse.
        """
        res = self.client.post("/api/investigations/analyze", data={"text": text_payload, "source_type": "text"})
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Check LangGraph extracted details
        extracted = data["extracted_data"]
        self.assertEqual(extracted["batch_number"], "BATCH-2026-105")
        self.assertIn("API-001", extracted["product_name"])
        self.assertEqual(len(data["five_whys"]), 5)
        self.assertIn("machine", data["fishbone"])
        self.assertGreater(len(data["potential_root_causes"]), 0)
        self.assertGreater(len(data["missing_evidence"]), 0)
        self.assertGreater(len(data["capa_recommendations"]), 0)
        self.assertEqual(len(data["workflow_trace"]), 7)

    def test_05_ai_analysis_email(self):
        email_payload = """
        From: qc-lead@aivoa.com
        To: qa-investigations@aivoa.com
        Subject: URGENT: Temperature Excursion in Atorvastatin Lot ATV-2026-088
        Body: Reactor chilled valve stuck open. Temperature dropped to 11.4C against 18.0-22.0C specification.
        """
        res = self.client.post("/api/investigations/analyze", data={"email_content": email_payload, "source_type": "email"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("Atorvastatin", data["extracted_data"]["product_name"])
        self.assertEqual(len(data["five_whys"]), 5)

    def test_06_ai_analysis_pdf_upload(self):
        # Create a simple synthetic PDF using reportlab or PyMuPDF
        import fitz
        doc = fitz.open()
        page = doc.new_page()
        page.insert_text((50, 72), "FORENSIC DEVIATION REPORT\nProduct: Paracetamol API\nBatch: PARA-2026-99\nStage: Centrifugation\nSeverity: Major\nObservation: Residual moisture exceeded specification at 2.4% vs 0.5% max.\nImmediate Action: Centrifuge drum quarantined.")
        pdf_bytes = doc.write()
        doc.close()

        files = {"file": ("deviation_report.pdf", pdf_bytes, "application/pdf")}
        res = self.client.post("/api/investigations/analyze", files=files, data={"source_type": "pdf"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["extracted_data"]["batch_number"], "PARA-2026-99")
        self.assertEqual(len(data["five_whys"]), 5)

    def test_07_investigation_crud_and_persistence(self):
        import uuid
        test_batch = f"BATCH-TEST-{uuid.uuid4().hex[:6].upper()}"
        create_payload = {
            "title": "Automated Test Deviation Investigation",
            "deviation_id": f"DEV-{uuid.uuid4().hex[:6].upper()}",
            "product_name": "API Test Substance",
            "batch_number": test_batch,
            "severity": "Critical",
            "status": "Under Investigation",
            "incident_description": "Automated testing incident description.",
            "expected_specification": "Specification <= 0.5%",
            "actual_observation": "Observation was 1.2%",
            "five_whys_data": [{"step": 1, "why": "Why?", "answer": "Because.", "is_hypothesis": True}],
            "root_causes": [{
                "cause_title": "Primary Sensor Drift",
                "category": "Machine",
                "evidence_status": "Partially supported",
                "confidence_level": "High"
            }],
            "capa_actions": [{
                "action_type": "Corrective",
                "description": "Quarantine affected lot immediately.",
                "priority": "Critical",
                "responsible_person": "QA Specialist",
                "target_completion_date": "2026-11-20",
                "status": "In Progress"
            }]
        }

        # Create
        res_create = self.client.post("/api/investigations", json=create_payload)
        self.assertEqual(res_create.status_code, 200)
        created_id = res_create.json()["id"]
        self.assertTrue(created_id.startswith("INV-"))

        # Read details
        res_get = self.client.get(f"/api/investigations/{created_id}")
        self.assertEqual(res_get.status_code, 200)
        self.assertEqual(res_get.json()["product_name"], "API Test Substance")
        self.assertEqual(len(res_get.json()["root_causes"]), 1)
        self.assertEqual(len(res_get.json()["capa_actions"]), 1)

        # Update
        update_payload = {
            "status": "Completed",
            "final_root_cause": "Verified RTD sensor calibration drift",
            "confirmed_by": "Dr. Marcus Vance (QP)"
        }
        res_update = self.client.put(f"/api/investigations/{created_id}", json=update_payload)
        self.assertEqual(res_update.status_code, 200)
        self.assertEqual(res_update.json()["status"], "Completed")
        self.assertEqual(res_update.json()["confirmed_by"], "Dr. Marcus Vance (QP)")

        # List & Search
        res_list = self.client.get("/api/investigations", params={"search": test_batch})
        self.assertEqual(res_list.status_code, 200)
        self.assertEqual(len(res_list.json()), 1)

    def test_08_capa_management_endpoints(self):
        # Fetch CAPAs
        res = self.client.get("/api/capa")
        self.assertEqual(res.status_code, 200)
        capas = res.json()
        self.assertGreater(len(capas), 0)

        first_capa = capas[0]
        # Update CAPA status
        update_res = self.client.put(f"/api/capa/{first_capa['id']}", params={"status": "Completed"})
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["status"], "Completed")

    def test_09_static_spa_serving(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("AIVOA.AI", res.text)

if __name__ == "__main__":
    unittest.main()
