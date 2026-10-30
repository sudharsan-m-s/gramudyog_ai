"""Indicative finance only. The LLM never participates in calculations."""

import json
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

from pydantic import BaseModel, Field, model_validator

RULES = json.loads(Path(__file__).resolve().parents[1].joinpath("schemes", "prototype_rules.json").read_text())
CENT = Decimal("0.01")


def money(value: Decimal) -> Decimal:
    return value.quantize(CENT, rounding=ROUND_HALF_UP)


class FinanceInput(BaseModel):
    margin_capital: Decimal = Field(ge=0, le=Decimal(5000000), max_digits=10, decimal_places=2)
    project_cost: Decimal = Field(gt=0, le=Decimal(100000000), max_digits=12, decimal_places=2)
    monthly_sales: Decimal = Field(ge=0, le=Decimal(100000000), max_digits=12, decimal_places=2)
    monthly_operating_cost: Decimal = Field(ge=0, le=Decimal(100000000), max_digits=12, decimal_places=2)
    working_capital_months: int = Field(default=1, ge=1, le=12)

    @model_validator(mode="after")
    def validate_finite(self):
        for value in (self.margin_capital, self.project_cost, self.monthly_sales, self.monthly_operating_cost):
            if not value.is_finite():
                raise ValueError("Inputs must be finite")
        return self


class ScheduleRow(BaseModel):
    month: int
    opening_balance: Decimal
    interest: Decimal
    principal: Decimal
    payment: Decimal
    closing_balance: Decimal
    phase: str


class FinanceResult(BaseModel):
    inputs: FinanceInput
    status: str
    scheme: str | None
    rules_version: str
    rules_source: str
    indicative_loan: Decimal
    required_margin: Decimal
    funding_gap: Decimal
    monthly_payment: Decimal
    monthly_surplus_before_debt: Decimal
    repayment_coverage: Decimal | None
    working_capital_estimate: Decimal
    schedule: list[ScheduleRow]
    assumptions: list[str]
    formula: str


def calculate(data: FinanceInput) -> FinanceResult:
    cost = data.project_cost
    if cost <= Decimal(RULES["micro"]["max_project_cost"]):
        name, rule = "Micro Finance Scheme", RULES["micro"]
    elif cost <= Decimal(RULES["term"]["max_project_cost"]):
        name, rule = "Term Loan Scheme", RULES["term"]
    else:
        name, rule = None, None

    required = money(cost * Decimal(RULES["margin_ratio"]))
    loan = money(min(
        cost * Decimal(RULES["finance_ratio"]),
        Decimal(rule["max_loan"]) if rule else Decimal(0),
        max(cost - data.margin_capital, Decimal(0)),
    ))
    gap = money(max(cost - data.margin_capital - loan, Decimal(0)))
    surplus = money(data.monthly_sales - data.monthly_operating_cost)
    working = money(data.monthly_operating_cost * data.working_capital_months)
    schedule: list[ScheduleRow] = []
    payment = Decimal(0)

    if rule and loan > 0:
        rate = Decimal(rule["annual_rate"]) / Decimal(12)
        months = rule["repayment_months"]
        # Prototype policy: interest-only moratorium, then full stated repayment tenure.
        payment = money(loan * rate / (Decimal(1) - (Decimal(1) + rate) ** -months))
        balance = loan
        for month in range(1, rule["moratorium_months"] + months + 1):
            opening = balance
            interest = money(opening * rate)
            if month <= rule["moratorium_months"]:
                principal = Decimal(0)
                due = interest
                phase = "interest-only moratorium"
            else:
                due = min(payment, money(opening + interest))
                principal = money(due - interest)
                if month == rule["moratorium_months"] + months:
                    principal = opening
                    due = money(principal + interest)
                balance = money(opening - principal)
                phase = "repayment"
            schedule.append(ScheduleRow(
                month=month, opening_balance=opening, interest=interest,
                principal=principal, payment=due, closing_balance=balance, phase=phase,
            ))
    coverage = money(surplus / payment) if payment > 0 else None
    status = "unsupported" if not rule else "funding_gap" if gap > 0 or data.margin_capital < required else "indicative"
    return FinanceResult(
        inputs=data, status=status, scheme=name, rules_version=RULES["version"], rules_source=RULES["source"],
        indicative_loan=loan, required_margin=required, funding_gap=gap, monthly_payment=payment,
        monthly_surplus_before_debt=surplus, repayment_coverage=coverage,
        working_capital_estimate=working, schedule=schedule,
        assumptions=[
            "Prototype rule values require confirmation against official scheme documents.",
            "Interest is paid monthly during moratorium; principal remains unchanged.",
            "The full repayment tenure starts after moratorium; no fees, subsidy, tax, or insurance are included.",
            "Monthly sales and operating costs are user assumptions, not forecasts.",
            "Working capital estimate = monthly operating cost × selected months; it is separate from project cost.",
            "A funding gap means the provided capital plus capped indicative loan does not cover project cost.",
        ],
        formula="Loan = min(90% × project cost, scheme cap, project cost − margin); EMI = P×r/[1−(1+r)^(-n)]; coverage = (sales−operating cost)/EMI",
    )
