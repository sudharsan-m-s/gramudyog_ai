from app.repositories.demo import DEMO_REGIONS
from app.schemas.assessment import AssessmentInput
from app.services.evidence import get_evidence


def payload(district: str, village: str = "Sulur", block: str = "Sulur"):
    return AssessmentInput(
        language="en", village=village, block=block, district=district,
        margin_capital="15000", category="tailoring", radius_km=5,
    )


def test_every_region_has_only_synthetic_seasonal_scenarios():
    for district, (block, village) in DEMO_REGIONS.items():
        result = get_evidence(payload(district, village, block))
        assert result.coverage == "sample"
        assert len(result.seasonality) == 12
        assert result.seasonality_status == "sample"
        assert all(item.status == "sample" and item.observed_at is None for item in result.channels)
        assert result.customer_reach.status == "unavailable"
        assert result.pricing.status == "unavailable"
        assert result.competitor_density.status == "unavailable"


def test_unknown_district_and_mismatched_locality_are_unavailable():
    for result in (get_evidence(payload("Chennai")), get_evidence(payload("Madurai"))):
        assert result.coverage == "unavailable"
        assert not result.channels
        assert not result.seasonality
