from hmac import compare_digest

from fastapi import APIRouter, Header, HTTPException

from app.core.config import settings
from app.domain.finance.calculator import FinanceInput, FinanceResult, calculate
from app.repositories import local_store
from app.schemas.assessment import AssessmentInput, AssessmentPreview
from app.schemas.review import ReviewEvent, ReviewInput, SavedAssessment, SavedAssessmentInput
from app.services.comparison import ComparisonInput, ComparisonResult, compare
from app.services.evidence import EvidenceResponse, get_evidence

router = APIRouter(prefix="/api/v1")


def officer_authorized(authorization: str | None) -> None:
    if not settings.officer_api_token:
        raise HTTPException(status_code=503, detail="Officer review is not configured")
    expected = f"Bearer {settings.officer_api_token}"
    if not authorization or not compare_digest(authorization, expected):
        raise HTTPException(status_code=403, detail="Officer authorization required")


@router.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "gramudyog-api", "stage": "development"}


@router.post("/assessments/preview", response_model=AssessmentPreview, tags=["assessments"])
def preview_assessment(payload: AssessmentInput) -> AssessmentPreview:
    return AssessmentPreview(input=payload)


@router.post("/evidence", response_model=EvidenceResponse, tags=["evidence"])
def evidence(payload: AssessmentInput) -> EvidenceResponse:
    return get_evidence(payload)


@router.post("/finance/calculate", response_model=FinanceResult, tags=["finance"])
def finance(payload: FinanceInput) -> FinanceResult:
    return calculate(payload)


@router.post("/compare", response_model=ComparisonResult, tags=["comparison"])
def comparison(payload: ComparisonInput) -> ComparisonResult:
    if len(set(payload.categories)) != len(payload.categories):
        raise HTTPException(status_code=422, detail="Choose distinct categories")
    return compare(payload)


@router.post("/assessments", response_model=SavedAssessment, tags=["assessments"])
def save_assessment(payload: SavedAssessmentInput) -> dict:
    """Save input assumptions only; future derived results must be recomputed."""
    return local_store.save(payload.model_dump(mode="json"))


@router.get("/assessments/{assessment_id}", response_model=SavedAssessment, tags=["assessments"])
def get_assessment(assessment_id: str) -> dict:
    record = local_store.get(assessment_id)
    if not record:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return record


@router.post("/officer/assessments/{assessment_id}/reviews", response_model=ReviewEvent, tags=["officer"])
def add_review(
    assessment_id: str, payload: ReviewInput, authorization: str | None = Header(default=None)
) -> dict:
    officer_authorized(authorization)
    if not local_store.get(assessment_id):
        raise HTTPException(status_code=404, detail="Assessment not found")
    return local_store.add_review(
        assessment_id, payload.reviewer, payload.observation, payload.correction
    )


@router.get("/officer/assessments/{assessment_id}/reviews", response_model=list[ReviewEvent], tags=["officer"])
def review_history(assessment_id: str, authorization: str | None = Header(default=None)) -> list[dict]:
    officer_authorized(authorization)
    if not local_store.get(assessment_id):
        raise HTTPException(status_code=404, detail="Assessment not found")
    return local_store.reviews(assessment_id)
