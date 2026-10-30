from fastapi import APIRouter, Header, HTTPException

from app.api.router import officer_authorized
from app.repositories import field_observations, local_store
from app.schemas.stage3 import (
    BreakEvenRequest,
    CostRequest,
    ObservationInput,
    break_even,
    cost_total,
)

router = APIRouter(prefix="/api/v1", tags=["stage-3"])


@router.post("/finance/cost-builder")
def calculate_cost(payload: CostRequest):
    return cost_total(payload)


@router.post("/finance/break-even")
def calculate_break_even(payload: BreakEvenRequest):
    return break_even(payload)


@router.post("/officer/assessments/{assessment_id}/observations")
def record_observation(assessment_id: str, payload: ObservationInput, authorization: str | None = Header(default=None)):
    officer_authorized(authorization)
    if not local_store.get(assessment_id):
        raise HTTPException(status_code=404, detail="Assessment not found")
    return field_observations.add_observation(assessment_id, payload.model_dump(mode="json"))


@router.get("/officer/assessments/{assessment_id}/observations")
def list_observations(assessment_id: str, authorization: str | None = Header(default=None)):
    officer_authorized(authorization)
    if not local_store.get(assessment_id):
        raise HTTPException(status_code=404, detail="Assessment not found")
    return field_observations.observations(assessment_id)
