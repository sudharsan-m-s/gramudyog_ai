# Database migration status

The deployed application can use the PostgreSQL repository when DATABASE_URL or
POSTGRES_URL is configured. It creates three app-prefixed storage tables and indexes
on first use. This path has been tested with a connection double, not a live PostgreSQL
instance. Local development without a database URL continues to use SQLite.

001_initial_postgres.sql is a separate planned geospatial schema. It is not executed
by the current adapter and PostGIS location queries are not implemented. No fake
geocoded points are seeded.
