from datetime import date, timedelta
from decimal import Decimal

from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.repositories import local_store


def test_break_even_and_costs():
    client = TestClient(app)
    cost = client.post("/api/v1/finance/cost-builder", json={"items": [
        {"name": "equipment", "amount": "50000"},
        {"name": "initial_stock", "amount": "20000"},
    ]})
    assert cost.status_code == 200
    assert Decimal(cost.json()["project_cost"]) == Decimal(70000)
    duplicate = client.post("/api/v1/finance/cost-builder", json={"items": [
        {"name": "equipment", "amount": "1"}, {"name": "equipment", "amount": "2"},
    ]})
    assert duplicate.status_code == 422
    plan = client.post("/api/v1/finance/break-even", json={
        "monthly_fixed_cost": "20000", "monthly_debt_payment": "5000", "contribution_percent": "50",
    })
    assert Decimal(plan.json()["monthly_revenue_required"]) == Decimal(50000)
    assert client.post("/api/v1/finance/break-even", json={
        "monthly_fixed_cost": "20000", "monthly_debt_payment": "5000", "contribution_percent": "0",
    }).status_code == 422


def test_observation_requires_officer_and_preserves_evidence(tmp_path, monkeypatch):
    monkeypatch.setattr(local_store, "DATA_FILE", tmp_path / "test.sqlite3")
    monkeypatch.setattr(settings, "officer_api_token", "test-only-token")
    client = TestClient(app)
    saved = client.post("/api/v1/assessments", json={"assessment": {
        "language": "en", "village": "Sulur", "block": "Sulur", "district": "Coimbatore",
        "margin_capital": "15000", "category": "tailoring", "radius_km": 5,
    }}).json()
    assert client.get("/api/v1/assessments/" + saved["id"]).json()["payload"]["finance"] is None
    revised = client.post("/api/v1/assessments", json={
        "assessment": saved["payload"]["assessment"],
        "finance": {"project_cost": "100000", "margin_capital": "15000", "monthly_sales": "30000",
                    "monthly_operating_cost": "20000", "working_capital_months": 1},
    })
    assert revised.status_code == 200
    assert revised.json()["id"] != saved["id"]
    snapshot = client.get("/api/v1/assessments/" + revised.json()["id"]).json()
    assert Decimal(snapshot["payload"]["finance"]["project_cost"]) == Decimal(100000)
    url = "/api/v1/officer/assessments/" + saved["id"] + "/observations"
    observation = {"kind": "price", "description": "Price observed at local shop", "source": "Field visit",
                   "observed_on": str(date.today()), "reviewer": "Field officer"}
    assert client.post(url, json=observation).status_code == 403
    preflight = client.options(url, headers={
        "Origin": "http://127.0.0.1:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type",
    })
    assert preflight.status_code == 200
    headers = {"Authorization": "Bearer test-only-token"}
    assert client.post(url, json={**observation, "observed_on": str(date.today() + timedelta(days=1))}, headers=headers).status_code == 422
    added = client.post(url, json=observation, headers=headers)
    assert added.status_code == 200
    assert added.json()["status"] == "verified"
    history = client.get(url, headers=headers).json()
    assert history[0]["source"] == "Field visit"
    assert history[0]["reviewer"] == "Field officer"
    assert history[0]["observed_on"] == observation["observed_on"]
def test_cloud_saving_fails_closed_without_persistent_storage(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    from fastapi.testclient import TestClient

    from app.main import app

    client = TestClient(app)
    payload = {"assessment": {
        "language": "en", "village": "Sulur", "block": "Sulur", "district": "Coimbatore",
        "margin_capital": "15000", "category": "tailoring", "radius_km": 5,
    }}
    response = client.post("/api/v1/assessments", json=payload)
    assert response.status_code == 503
    assert "Persistent storage" in response.json()["detail"]
