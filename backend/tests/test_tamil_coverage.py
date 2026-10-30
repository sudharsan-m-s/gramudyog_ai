"""Check that backend-generated demo content has a Tamil translation."""

import json
from pathlib import Path

from app.domain.finance.calculator import FinanceInput, calculate
from app.repositories.demo import CATEGORIES


def object_from_typescript(path: Path, marker: str) -> dict:
    source = path.read_text(encoding="utf-8")
    start = source.index(marker) + len(marker)
    end = source.index("\n}", start) + 2
    return json.loads(source[start:end])


def test_tamil_covers_backend_demo_and_financial_text():
    root = Path(__file__).resolve().parents[2]
    evidence = object_from_typescript(
        root / "frontend/src/features/evidence/evidenceTranslations.ts",
        "const evidenceTranslations: Record<string, string> = ",
    )
    ui = object_from_typescript(
        root / "frontend/src/lib/translations.ts", "const tamil: Record<string, string> = "
    )
    market_text = []
    for category in CATEGORIES.values():
        for key in ("channels", "opportunities", "risks"):
            market_text.extend(category[key])
        market_text.extend(category["swot"].values())
    assert not [text for text in market_text if not evidence.get(text)]
    result = calculate(FinanceInput(
        project_cost="140000", margin_capital="15000", monthly_sales="30000",
        monthly_operating_cost="20000",
    ))
    expected = [result.formula, result.rules_source, *result.assumptions, result.scheme]
    assert not [text for text in expected if not ui.get(text)]
