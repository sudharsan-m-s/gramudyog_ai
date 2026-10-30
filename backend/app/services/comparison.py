from pydantic import BaseModel, Field

from app.repositories.demo import CATEGORIES, DEMO_REGIONS
from app.schemas.assessment import AssessmentInput, Category


class ComparisonInput(BaseModel):
    assessment: AssessmentInput
    categories: list[Category] = Field(min_length=1, max_length=3)


class ComparisonRow(BaseModel):
    category: Category
    data_status: str
    cost_status: str = "user assumption required"
    channels: list[str]
    risks: list[str]
    note: str


class ComparisonResult(BaseModel):
    rows: list[ComparisonRow]
    note: str = "Qualitative prompts only. No market ranking or predicted success."


def compare(payload: ComparisonInput) -> ComparisonResult:
    if len(set(payload.categories)) != len(payload.categories):
        raise ValueError("Categories must be distinct")
    region = DEMO_REGIONS.get(payload.assessment.district.casefold())
    supported = bool(region and payload.assessment.block.casefold() == region[0].casefold()
                     and payload.assessment.village.casefold() == region[1].casefold())
    rows = [
        ComparisonRow(
            category=category,
            data_status="sample" if supported else "unavailable",
            channels=CATEGORIES[category.value]["channels"] if supported else [],
            risks=CATEGORIES[category.value]["risks"] if supported else [],
            note="Synthetic prompts; costs are not established." if supported else "No local data.",
        )
        for category in payload.categories
    ]
    return ComparisonResult(rows=rows)
