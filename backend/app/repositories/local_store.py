"""Route to durable PostgreSQL when configured; use local SQLite for development."""

import json
import os
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException

from app.repositories import postgres_store

DATA_FILE = Path(__file__).resolve().parents[2] / "data" / "assessments.sqlite3"


def connection() -> sqlite3.Connection:
    if os.environ.get("VERCEL"):
        raise HTTPException(
            status_code=503,
            detail="Persistent storage is not configured for this deployment.",
        )
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DATA_FILE)
    db.row_factory = sqlite3.Row
    db.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id TEXT PRIMARY KEY, created_at TEXT NOT NULL, payload TEXT NOT NULL
        )
    """)
    db.execute("""
        CREATE TABLE IF NOT EXISTS review_events (
            id TEXT PRIMARY KEY, assessment_id TEXT NOT NULL,
            reviewer TEXT NOT NULL, created_at TEXT NOT NULL,
            observation TEXT NOT NULL, correction TEXT NOT NULL,
            FOREIGN KEY (assessment_id) REFERENCES assessments(id)
        )
    """)
    return db


def save(payload: dict) -> dict:
    if postgres_store.database_url():
        return postgres_store.save(payload)
    record = {"id": str(uuid4()), "created_at": datetime.now(UTC).isoformat(), "payload": payload}
    with connection() as db:
        db.execute(
            "INSERT INTO assessments VALUES (?, ?, ?)",
            (record["id"], record["created_at"], json.dumps(payload)),
        )
    return record


def get(record_id: str) -> dict | None:
    if postgres_store.database_url():
        return postgres_store.get(record_id)
    with connection() as db:
        row = db.execute("SELECT * FROM assessments WHERE id = ?", (record_id,)).fetchone()
    return {"id": row["id"], "created_at": row["created_at"], "payload": json.loads(row["payload"])} if row else None


def add_review(record_id: str, reviewer: str, observation: str, correction: str) -> dict:
    if postgres_store.database_url():
        return postgres_store.add_review(record_id, reviewer, observation, correction)
    event = {
        "id": str(uuid4()), "assessment_id": record_id, "reviewer": reviewer,
        "created_at": datetime.now(UTC).isoformat(),
        "observation": observation, "correction": correction,
    }
    with connection() as db:
        db.execute(
            "INSERT INTO review_events VALUES (?, ?, ?, ?, ?, ?)", tuple(event.values())
        )
    return event


def reviews(record_id: str) -> list[dict]:
    if postgres_store.database_url():
        return postgres_store.reviews(record_id)
    with connection() as db:
        rows = db.execute(
            "SELECT * FROM review_events WHERE assessment_id = ? ORDER BY created_at, id", (record_id,)
        ).fetchall()
    return [dict(row) for row in rows]
