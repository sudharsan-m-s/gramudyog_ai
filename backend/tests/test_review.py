from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

client = TestClient(app)
PAYLOAD = {
    "assessment": {
        "language": "en", "village": "Sulur", "block": "Sulur",
        "district": "Coimbatore", "margin_capital": "15000",
        "category": "tailoring", "radius_km": 5,
    }
}


def test_saved_assessment_and_officer_audit(monkeypatch):
    saved = client.post("/api/v1/assessments", json=PAYLOAD)
    assert saved.status_code == 200
    assessment_id = saved.json()["id"]
    assert client.get(f"/api/v1/assessments/{assessment_id}").json()["payload"] == PAYLOAD
    url = f"/api/v1/officer/assessments/{assessment_id}/reviews"
    review = {"reviewer": "Field officer", "observation": "Sample channel", "correction": "Needs visit"}
    assert client.post(url, json=review).status_code == 503
    monkeypatch.setattr(settings, "officer_api_token", "test-token")
    assert client.post(url, json=review).status_code == 403
    assert client.post(url, json=review, headers={"Authorization": "Bearer wrong"}).status_code == 403
    created = client.post(url, json=review, headers={"Authorization": "Bearer test-token"})
    assert created.status_code == 200
    history = client.get(url, headers={"Authorization": "Bearer test-token"}).json()
    assert history[0]["correction"] == "Needs visit"
    assert history[0]["created_at"]
