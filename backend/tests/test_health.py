from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_liveness_does_not_claim_database_readiness():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok", "service": "gramudyog-api", "stage": "development"
    }


def test_untrusted_origin_not_allowed():
    response = client.get("/api/v1/health", headers={"Origin": "https://untrusted.example"})
    assert "access-control-allow-origin" not in response.headers

