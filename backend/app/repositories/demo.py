"""Explicitly synthetic teaching data, not observed market facts."""

DEMO_DISTRICT = "coimbatore"
DEMO_REGIONS = {
    "coimbatore": ("Sulur", "Sulur"),
    "tiruppur": ("Palladam", "Palladam"),
    "erode": ("Perundurai", "Perundurai"),
    "salem": ("Omalur", "Omalur"),
    "madurai": ("Melur", "Melur"),
}
# Synthetic scenario indices: illustrative seasonal variation, not rainfall or sales observations.
SEASONALITY = {
    "coimbatore": [85, 85, 90, 95, 100, 95, 90, 90, 95, 115, 120, 110],
    "tiruppur": [90, 85, 90, 95, 95, 90, 90, 95, 100, 110, 120, 115],
    "erode": [85, 85, 90, 95, 100, 95, 90, 90, 100, 115, 120, 110],
    "salem": [90, 85, 90, 95, 100, 100, 95, 95, 100, 110, 115, 110],
    "madurai": [90, 85, 90, 95, 100, 90, 85, 90, 95, 115, 120, 110],
}
SEASON_SOURCE = "Synthetic scenarios informed by IMD Tamil Nadu northeast monsoon overview: https://mausam.imd.gov.in/chennai/mcdata/ne_monsoon_2024.pdf"

DEMO_SOURCE = "GramUdyog.AI synthetic demonstration dataset"
CATEGORIES = {
    "food_processing": {
        "channels": ["Village shops", "Weekly markets"],
        "opportunities": ["Test small batches with nearby retailers"],
        "risks": ["Ingredient supply and spoilage", "Seasonal demand"],
        "swot": {
            "strength": "A small batch can limit initial spending.",
            "weakness": "Packaging and spoilage can consume working capital.",
            "opportunity": "A retailer trial can test repeat orders.",
            "threat": "Ingredient prices may vary.",
        },
    },
    "tailoring": {
        "channels": ["Direct household orders", "Local garment shops"],
        "opportunities": ["Test alterations and made-to-order work"],
        "risks": ["Irregular orders", "Reliance on one machine"],
        "swot": {
            "strength": "Work can start with limited equipment.",
            "weakness": "Output depends on available skilled time.",
            "opportunity": "Alterations may provide repeat visits.",
            "threat": "Machine downtime interrupts delivery.",
        },
    },
    "dairy": {
        "channels": ["Direct household delivery", "Local collection points"],
        "opportunities": ["Validate recurring buyers before investment"],
        "risks": ["Feed and veterinary costs", "Perishable inventory"],
        "swot": {
            "strength": "Recurring orders can be planned if confirmed.",
            "weakness": "Daily operating costs continue during weak demand.",
            "opportunity": "A buyer agreement can reduce uncertainty.",
            "threat": "Animal health and input prices create exposure.",
        },
    },
    "retail": {
        "channels": ["Walk-in sales", "Neighbourhood orders"],
        "opportunities": ["Test a narrow product range before expansion"],
        "risks": ["Unsold inventory", "Buyer concentration"],
        "swot": {
            "strength": "Inventory can be adjusted after early feedback.",
            "weakness": "Cash is tied up in stock.",
            "opportunity": "Local demand can be checked with a small pilot.",
            "threat": "Nearby alternatives may compete on price.",
        },
    },
}
