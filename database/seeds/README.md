# Demonstration data

The API currently includes four category prompt sets in backend/app/repositories/demo.py
for a Coimbatore-district demonstration. All are synthetic sample prompts, not observed
local market data. They have no observation date. Customer counts, competitors, local
prices, and geocoded locations remain unavailable.

001_demo_categories.sql seeds category labels into PostgreSQL only. It is not run by
the current SQLite API adapter. No scraped or real-time observations are included.
