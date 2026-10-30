"""Stage 3 calculation inputs and reviewed observation schemas."""
from datetime import date
from decimal import ROUND_CEILING, ROUND_HALF_UP, Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class CostItem(BaseModel):
    name: Literal["equipment", "premises", "initial_stock", "setup", "working_capital"]
    amount: Decimal = Field(ge=0, le=Decimal(5000000), max_digits=10, decimal_places=2)


class CostRequest(BaseModel):
    items: list[CostItem] = Field(min_length=1, max_length=5)

    @model_validator(mode="after")
    def distinct_items(self):
        if len({item.name for item in self.items}) != len(self.items):
            raise ValueError("Cost categories must be unique")
        return self


class BreakEvenRequest(BaseModel):
    monthly_fixed_cost: Decimal = Field(ge=0, le=Decimal(100000000), max_digits=12, decimal_places=2)
    contribution_percent: Decimal = Field(gt=0, le=100, max_digits=5, decimal_places=2)
    monthly_debt_payment: Decimal = Field(ge=0, le=Decimal(100000000), max_digits=12, decimal_places=2)


def cost_total(payload: CostRequest) -> dict:
    return {
        "project_cost": sum((item.amount for item in payload.items), Decimal(0)).quantize(Decimal("0.01")),
        "items": payload.items,
        "status": "user-entered",
        "assumption": "Each selected amount is an estimate. Do not count working capital twice.",
    }


def break_even(payload: BreakEvenRequest) -> dict:
    fixed = payload.monthly_fixed_cost + payload.monthly_debt_payment
    revenue = (fixed / (payload.contribution_percent / 100)).quantize(
        Decimal("0.01"), rounding=ROUND_CEILING
    )
    return {
        "monthly_revenue_required": revenue,
        "fixed_cost_plus_debt": fixed.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
        "inputs": payload,
        "formula": "(monthly fixed operating costs + monthly debt payment) / contribution margin",
        "assumption": "Contribution margin is the share of sales left after variable costs. Avoid including variable costs in fixed costs. This is not a success prediction.",
    }


class ObservationInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    kind: Literal["customer_demand", "supplier", "price", "competitor", "other"]
    description: str = Field(min_length=3, max_length=1000)
    source: str = Field(min_length=2, max_length=300)
    observed_on: date
    reviewer: str = Field(min_length=2, max_length=120)

    @model_validator(mode="after")
    def no_future_observation(self):
        if self.observed_on > date.today():
            raise ValueError("Observation date cannot be in the future")
        return self
