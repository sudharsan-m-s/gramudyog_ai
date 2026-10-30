from pydantic import BaseModel

from app.repositories.demo import CATEGORIES, DEMO_REGIONS, DEMO_SOURCE, SEASON_SOURCE, SEASONALITY
from app.schemas.assessment import AssessmentInput, Category


class MarketItem(BaseModel):
    label: str
    status: str
    source: str
    observed_at: None = None


class EvidenceResponse(BaseModel):
    district: str
    category: Category
    radius_km: int
    coverage: str
    channels: list[MarketItem]
    opportunities: list[MarketItem]
    risks: list[MarketItem]
    swot: dict[str, MarketItem]
    customer_reach: MarketItem
    competitor_density: MarketItem
    pricing: MarketItem
    note: str
    seasonality: list[int] = []
    seasonality_source: str = ""
    seasonality_status: str = "sample"


def get_evidence(input_data: AssessmentInput) -> EvidenceResponse:
    region = DEMO_REGIONS.get(input_data.district.casefold())
    supported = bool(region and input_data.block.casefold() == region[0].casefold()
                     and input_data.village.casefold() == region[1].casefold())
    category = CATEGORIES[input_data.category.value]
    def item(label: str, status: str = "sample") -> MarketItem:
        return MarketItem(label=label, status=status, source=DEMO_SOURCE if status == "sample" else "No source available")

    return EvidenceResponse(
        district=input_data.district,
        category=input_data.category,
        radius_km=input_data.radius_km,
        coverage="sample" if supported else "unavailable",
        channels=[item(value) for value in category["channels"]] if supported else [],
        opportunities=[item(value) for value in category["opportunities"]] if supported else [],
        risks=[item(value) for value in category["risks"]] if supported else [],
        swot={key: item(value) for key, value in category["swot"].items()} if supported else {},
        customer_reach=item("No supported customer count", "unavailable"),
        competitor_density=item("No competitor survey or map", "unavailable"),
        pricing=item("No observed local prices", "unavailable"),
        seasonality=SEASONALITY.get(input_data.district.casefold(), []) if supported else [],
        seasonality_source=SEASON_SOURCE if supported else "Unavailable",
        seasonality_status="sample" if supported else "unavailable",
        note=(
            "Synthetic category prompts for a district demonstration. They are not local observations, "
            "and do not support a feasibility ranking."
            if supported else
            "No demonstration data for this district. Enter assumptions to continue when the simulator is available."
        ),
    )
