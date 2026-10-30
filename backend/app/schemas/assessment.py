from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Category(str, Enum):
    FOOD_PROCESSING = "food_processing"
    TAILORING = "tailoring"
    DAIRY = "dairy"
    RETAIL = "retail"


class Language(str, Enum):
    ENGLISH = "en"
    TAMIL = "ta"


class AssessmentInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    language: Language
    village: str = Field(min_length=2, max_length=120)
    block: str = Field(min_length=2, max_length=120)
    district: str = Field(min_length=2, max_length=120)
    margin_capital: Decimal = Field(gt=0, le=Decimal(5000000), max_digits=10, decimal_places=2)
    category: Category
    radius_km: int = Field(default=5, ge=5, le=10)

    @field_validator("village", "block", "district")
    @classmethod
    def reject_control_characters(cls, value: str) -> str:
        if any(ord(character) < 32 for character in value):
            raise ValueError("Control characters are not allowed")
        return value


class AssessmentPreview(BaseModel):
    input: AssessmentInput
    evidence_status: str = "unavailable"
    message: str = (
        "No local observations have been loaded for this location. "
        "This is an intake preview, not a feasibility or financial assessment."
    )
