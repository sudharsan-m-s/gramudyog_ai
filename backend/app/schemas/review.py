from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.assessment import AssessmentInput


class SavedAssessmentInput(BaseModel):
    assessment: AssessmentInput


class SavedAssessment(BaseModel):
    id: str
    created_at: datetime
    payload: SavedAssessmentInput


class ReviewInput(BaseModel):
    reviewer: str = Field(min_length=2, max_length=120)
    observation: str = Field(min_length=2, max_length=1000)
    correction: str = Field(min_length=2, max_length=1000)


class ReviewEvent(ReviewInput):
    id: str
    assessment_id: str
    created_at: datetime
