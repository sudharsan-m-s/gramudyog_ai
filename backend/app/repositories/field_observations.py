import json
from datetime import UTC, datetime
from uuid import uuid4

from app.repositories.local_store import connection


def ensure_schema(db):
    db.execute("""
        CREATE TABLE IF NOT EXISTS field_observation_events (
            id TEXT PRIMARY KEY, assessment_id TEXT NOT NULL, created_at TEXT NOT NULL,
            event_json TEXT NOT NULL, FOREIGN KEY (assessment_id) REFERENCES assessments(id)
        )
    """)


def add_observation(assessment_id: str, data: dict) -> dict:
    event = {
        "id": str(uuid4()), "assessment_id": assessment_id,
        "recorded_at": datetime.now(UTC).isoformat(),
        "status": "verified", **data,
    }
    with connection() as db:
        ensure_schema(db)
        db.execute(
            "INSERT INTO field_observation_events VALUES (?, ?, ?, ?)",
            (event["id"], assessment_id, event["recorded_at"], json.dumps(event)),
        )
    return event


def observations(assessment_id: str) -> list[dict]:
    with connection() as db:
        ensure_schema(db)
        rows = db.execute(
            "SELECT event_json FROM field_observation_events WHERE assessment_id=? ORDER BY created_at,id",
            (assessment_id,),
        ).fetchall()
    return [json.loads(row["event_json"]) for row in rows]
