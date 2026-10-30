from app.schemas.assessment import AssessmentInput
from app.services.evidence import get_evidence


def payload(district: str):
    return AssessmentInput(
        language="en", village="Sulur", block="Sulur", district=district,
        margin_capital="15000", category="tailoring", radius_km=5,
    )


def test_demo_prompts_never_claim_observed_market_statistics():
    result = get_evidence(payload("Coimbatore"))
    assert result.coverage == "sample"
    assert all(item.status == "sample" and item.observed_at is None for item in result.channels)
    assert result.customer_reach.status == "unavailable"
    assert result.pricing.status == "unavailable"
    assert result.competitor_density.status == "unavailable"


def test_other_district_has_no_sample_coverage():
    result = get_evidence(payload("Madurai"))
    assert result.coverage == "unavailable"
    assert not result.channels
