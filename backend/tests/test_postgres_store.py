import sqlite3
from datetime import date

import psycopg
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.repositories import postgres_store


class FakePostgresConnection:
    """Exercise the SQL adapter against an isolated DB without a PostgreSQL server."""

    def __init__(self, path):
        self.db = sqlite3.connect(path)
        self.db.row_factory = lambda cursor, row: {
            column[0]: row[index] for index, column in enumerate(cursor.description)
        }

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        if exc_type:
            self.db.rollback()
        else:
            self.db.commit()
        self.db.close()

    def execute(self, query, params=()):
        return self.db.execute(query.replace("%s", "?"), params)

    def commit(self):
        self.db.commit()


def test_postgres_adapter_routes_persistent_records(tmp_path, monkeypatch):
    path = tmp_path / "mock-postgres.sqlite3"
    monkeypatch.setattr(settings, "database_url", "postgresql://mock-db/example")
    monkeypatch.setattr(settings, "postgres_url", "")
    monkeypatch.setattr(settings, "officer_api_token", "test-token")
    monkeypatch.setattr(postgres_store, "_schema_url", None)
    monkeypatch.setattr(
        postgres_store.psycopg, "connect", lambda *args, **kwargs: FakePostgresConnection(path)
    )
    client = TestClient(app)
    assert client.get("/api/v1/capabilities").json() == {"persistent_storage": True}
    assessment = {
        "language": "en", "village": "Sulur", "block": "Sulur", "district": "Coimbatore",
        "margin_capital": "15000", "category": "tailoring", "radius_km": 5,
    }
    saved = client.post("/api/v1/assessments", json={"assessment": assessment})
    assert saved.status_code == 200
    identifier = saved.json()["id"]
    assert client.get(f"/api/v1/assessments/{identifier}").json()["payload"]["assessment"] == assessment
    url = f"/api/v1/officer/assessments/{identifier}"
    headers = {"Authorization": "Bearer test-token"}
    review = {"reviewer": "Officer", "observation": "Check", "correction": "Confirmed"}
    assert client.post(url + "/reviews", headers=headers, json=review).status_code == 200
    assert client.get(url + "/reviews", headers=headers).json()[0]["correction"] == "Confirmed"
    observation = {
        "kind": "price", "description": "Observed price", "source": "Field visit",
        "observed_on": date.today().isoformat(), "reviewer": "Officer",
    }
    assert client.post(url + "/observations", headers=headers, json=observation).status_code == 200
    events = client.get(url + "/observations", headers=headers).json()
    assert events[0]["source"] == "Field visit"
    assert events[0]["status"] == "verified"


def test_unreachable_postgres_is_safe_and_does_not_fall_back(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.setattr(settings, "database_url", "postgresql://unreachable/example")
    monkeypatch.setattr(settings, "postgres_url", "")
    monkeypatch.setattr(postgres_store, "_schema_url", None)

    def unavailable(*args, **kwargs):
        raise psycopg.OperationalError("secret internal database details")

    monkeypatch.setattr(postgres_store.psycopg, "connect", unavailable)
    client = TestClient(app)
    assert client.get("/api/v1/capabilities").json() == {"persistent_storage": False}
    response = client.post("/api/v1/assessments", json={"assessment": {
        "language": "en", "village": "Sulur", "block": "Sulur", "district": "Coimbatore",
        "margin_capital": "15000", "category": "tailoring", "radius_km": 5,
    }})
    assert response.status_code == 503
    assert "secret" not in response.text
