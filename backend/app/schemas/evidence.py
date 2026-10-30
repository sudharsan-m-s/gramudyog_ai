from datetime import date
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class EvidenceStatus(str, Enum):
    VERIFIED = "verified"
    ESTIMATED = "estimated"
    SAMPLE = "sample"
    USER_ENTERED = "user-entered"
    UNAVAILABLE = "unavailable"


class Evidence(BaseModel):
    id: str
    value: Any = None
    status: EvidenceStatus
    source: str = Field(min_length=1)
    observed_at: date | None = None
    assumptions: list[str] = Field(default_factory=list)
