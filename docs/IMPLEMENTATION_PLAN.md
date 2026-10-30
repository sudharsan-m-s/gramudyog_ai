# Implementation plan

1. Scaffold: React/TypeScript/Vite/Tailwind, FastAPI health, PostGIS Compose, environment examples.
2. Data models, migrations, replaceable repository and sample Coimbatore-district dataset.
3. Decimal financial calculator and versioned scheme rules with boundary, cap and invalid-input tests.
4. Language selection, assessment inputs, confirmation, sourced evidence and feasibility.
5. Up to three business comparisons, what-if simulator, evidence trail.
6. Server-authorized officer review, immutable audit trail, saved assessments, printable draft DPR.
7. Speech input/readback as progressive enhancement; complete typed fallback.
8. Mobile, accessibility, connectivity, security and end-to-end verification.

The local MVP implements intake, sample evidence prompts, deterministic finance, comparison, save, officer audit, print draft, and optional voice. Real geospatial data, PostgreSQL adapter, production identity, and complete translations remain.

## Financial defaults to implement

These are user-supplied SIH prototype defaults, not verified current official scheme rules.

| Scheme | Project cost | Loan cap | Annual interest | Repayment | Moratorium |
| --- | --- | --- | --- | --- | --- |
| Micro Finance | Up to INR 140,000 | INR 125,000 | 6.5% | 3 years | 3 months |
| Term Loan | Above INR 140,000 to INR 5,000,000 | INR 4,500,000 | 8% | 7 years | 6 months |

Margin approximately 10%; indicative financing up to 90%, subject to caps and approval.
Expose funding gaps rather than increasing loans beyond caps.
Before schedules are implemented, explicitly define the prototype treatment of moratorium interest
and whether moratorium falls inside or outside repayment tenure; supplied defaults do not establish it.
Confirm official scheme documents before real use. Do not infer eligibility criteria.

