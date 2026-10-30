from fastapi import APIRouter

router = APIRouter(prefix="/api/v1")


@router.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Process liveness only; does not imply database readiness."""
    return {"status": "ok", "service": "gramudyog-api", "stage": "scaffold"}
