from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

VALID = {
    "language": "en", "village": "Sulur", "block": "Sulur",
    "district": "Coimbatore", "margin_capital": "15000.00",
    "category": "tailoring", "radius_km": 5,
}


def test_preview_preserves_inputs_without_inventing_evidence():
    response = client.post("/api/v1/assessments/preview", json=VALID)
    assert response.status_code == 200
    assert response.json()["input"]["margin_capital"] == "15000.00"
    assert response.json()["evidence_status"] == "unavailable"


def test_invalid_capital_and_radius_rejected():
    response = client.post(
        "/api/v1/assessments/preview",
        json={**VALID, "margin_capital": "-1", "radius_km": 50},
    )
    assert response.status_code == 422


def test_unknown_category_rejected():
    response = client.post(
        "/api/v1/assessments/preview", json={**VALID, "category": "unknown"}
    )
    assert response.status_code == 422
