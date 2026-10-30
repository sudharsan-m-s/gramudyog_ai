"""Durable PostgreSQL storage for the deployed prototype.

Only app-prefixed tables are created. Assessment identifiers are bearer-like
locators; this MVP does not provide per-user authentication.
"""

import json
from contextlib import contextmanager
from datetime import UTC, datetime
from threading import Lock
from uuid import uuid4

import psycopg
from fastapi import HTTPException
from psycopg.rows import dict_row

from app.core.config import settings

_schema_lock = Lock()
_schema_url = None
_SCHEMA = (
    """CREATE TABLE IF NOT EXISTS gramudyog_assessments (
        id TEXT PRIMARY KEY, created_at TEXT NOT NULL, payload TEXT NOT NULL
    )""",
    """CREATE TABLE IF NOT EXISTS gramudyog_review_events (
        id TEXT PRIMARY KEY, assessment_id TEXT NOT NULL
            REFERENCES gramudyog_assessments(id),
        reviewer TEXT NOT NULL, created_at TEXT NOT NULL,
        observation TEXT NOT NULL, correction TEXT NOT NULL
    )""",
    """CREATE TABLE IF NOT EXISTS gramudyog_field_observation_events (
        id TEXT PRIMARY KEY, assessment_id TEXT NOT NULL
            REFERENCES gramudyog_assessments(id),
        created_at TEXT NOT NULL, event_json TEXT NOT NULL
    )""",
    """CREATE INDEX IF NOT EXISTS gramudyog_reviews_assessment_idx
       ON gramudyog_review_events (assessment_id, created_at, id)""",
    """CREATE INDEX IF NOT EXISTS gramudyog_observations_assessment_idx
       ON gramudyog_field_observation_events (assessment_id, created_at, id)""",
)


def database_url() -> str:
    return settings.database_url.strip() or settings.postgres_url.strip()


@contextmanager
def connection():
    global _schema_url
    url = database_url()
    if not url:
        raise HTTPException(status_code=503, detail="Persistent storage is not configured.")
    try:
        with psycopg.connect(url, connect_timeout=5, row_factory=dict_row) as db:
            if _schema_url != url:
                with _schema_lock:
                    if _schema_url != url:
                        for query in _SCHEMA:
                            db.execute(query)
                        db.commit()
                        _schema_url = url
            yield db
    except (psycopg.Error, ValueError):
        raise HTTPException(status_code=503, detail="Persistent storage is unavailable.") from None


def is_ready() -> bool:
    try:
        with connection() as db:
            db.execute("SELECT 1")
        return True
    except HTTPException:
        return False


def save(payload: dict) -> dict:
    record = {"id": str(uuid4()), "created_at": datetime.now(UTC).isoformat(), "payload": payload}
    with connection() as db:
        db.execute(
            "INSERT INTO gramudyog_assessments (id, created_at, payload) VALUES (%s, %s, %s)",
            (record["id"], record["created_at"], json.dumps(payload)),
        )
    return record


def get(record_id: str) -> dict | None:
    with connection() as db:
        row = db.execute(
            "SELECT id, created_at, payload FROM gramudyog_assessments WHERE id = %s",
            (record_id,),
        ).fetchone()
    return {**row, "payload": json.loads(row["payload"])} if row else None


def add_review(record_id: str, reviewer: str, observation: str, correction: str) -> dict:
    event = {
        "id": str(uuid4()), "assessment_id": record_id, "reviewer": reviewer,
        "created_at": datetime.now(UTC).isoformat(),
        "observation": observation, "correction": correction,
    }
    with connection() as db:
        db.execute(
            """INSERT INTO gramudyog_review_events
               (id, assessment_id, reviewer, created_at, observation, correction)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            tuple(event.values()),
        )
    return event


def reviews(record_id: str) -> list[dict]:
    with connection() as db:
        return list(db.execute(
            """SELECT id, assessment_id, reviewer, created_at, observation, correction
               FROM gramudyog_review_events WHERE assessment_id = %s ORDER BY created_at, id""",
            (record_id,),
        ).fetchall())


def add_observation(assessment_id: str, data: dict) -> dict:
    event = {
        "id": str(uuid4()), "assessment_id": assessment_id,
        "recorded_at": datetime.now(UTC).isoformat(), "status": "verified", **data,
    }
    with connection() as db:
        db.execute(
            """INSERT INTO gramudyog_field_observation_events
               (id, assessment_id, created_at, event_json) VALUES (%s, %s, %s, %s)""",
            (event["id"], assessment_id, event["recorded_at"], json.dumps(event)),
        )
    return event


def observations(assessment_id: str) -> list[dict]:
    with connection() as db:
        rows = db.execute(
            """SELECT event_json FROM gramudyog_field_observation_events
               WHERE assessment_id = %s ORDER BY created_at, id""",
            (assessment_id,),
        ).fetchall()
    return [json.loads(row["event_json"]) for row in rows]
