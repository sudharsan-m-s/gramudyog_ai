from decimal import Decimal

from app.domain.finance.calculator import FinanceInput, calculate


def scenario(cost: str, margin: str = "14000"):
    return calculate(FinanceInput(
        project_cost=cost, margin_capital=margin,
        monthly_sales="30000", monthly_operating_cost="20000",
    ))


def test_micro_boundary_and_cap():
    below = scenario("138888.88")
    assert below.scheme == "Micro Finance Scheme"
    assert below.indicative_loan <= Decimal("125000")
    at = scenario("140000")
    assert at.scheme == "Micro Finance Scheme"
    assert at.indicative_loan == Decimal("125000")
    assert at.funding_gap == Decimal("1000.00")


def test_term_boundary_and_upper_limit():
    above = scenario("140000.01")
    assert above.scheme == "Term Loan Scheme"
    assert scenario("5000000", "500000").indicative_loan == Decimal("4500000")
    assert scenario("5000000.01").status == "unsupported"


def test_insufficient_margin_and_full_repayment():
    result = scenario("100000", "5000")
    assert result.status == "funding_gap"
    assert result.funding_gap == Decimal("5000.00")
    assert result.required_margin == Decimal("10000.00")
    assert len(result.schedule) == 39
    assert result.schedule[0].principal == 0
    assert result.schedule[-1].closing_balance == 0
    assert result.repayment_coverage is not None


def test_zero_sales_and_invalid_values():
    result = calculate(FinanceInput(
        project_cost="100000", margin_capital="10000",
        monthly_sales="0", monthly_operating_cost="1000",
    ))
    assert result.monthly_surplus_before_debt == Decimal("-1000.00")
    try:
        FinanceInput(project_cost="-1", margin_capital="10000", monthly_sales="0", monthly_operating_cost="0")
    except ValueError:
        pass
    else:
        raise AssertionError("Negative project cost accepted")
