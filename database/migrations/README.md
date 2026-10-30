# Database migration status

001_initial_postgres.sql defines the intended PostgreSQL/PostGIS schema and constraints.
It has not been applied in this environment, and the API does not use it yet.
The current local adapter uses SQLite for saved assessment inputs and append-only review
events. A PostgreSQL repository implementation and tested migration runner are needed
before production use. PostGIS locations have nullable geometry until coordinates are
verified; no fake points are seeded.
