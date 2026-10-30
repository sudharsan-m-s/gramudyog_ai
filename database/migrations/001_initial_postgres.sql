-- PostgreSQL/PostGIS schema for planned production adapter.
-- The current local API uses SQLite until a PostgreSQL connection is configured.
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS locations (
    id BIGSERIAL PRIMARY KEY,
    district TEXT NOT NULL,
    block TEXT NOT NULL,
    village TEXT NOT NULL,
    point GEOGRAPHY(POINT, 4326),
    UNIQUE (district, block, village)
);
CREATE INDEX IF NOT EXISTS locations_point_gist ON locations USING GIST (point);

CREATE TABLE IF NOT EXISTS categories (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS observations (
    id BIGSERIAL PRIMARY KEY,
    location_id BIGINT NOT NULL REFERENCES locations(id),
    category_code TEXT NOT NULL REFERENCES categories(code),
    kind TEXT NOT NULL,
    value_json JSONB,
    status TEXT NOT NULL CHECK (status IN ('verified','estimated','sample','user-entered','unavailable')),
    source TEXT NOT NULL,
    observed_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (status <> 'verified' OR observed_at IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS observations_location_category ON observations (location_id, category_code);

CREATE TABLE IF NOT EXISTS scheme_versions (
    version TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    rules_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY,
    input_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_events (
    id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES assessments(id),
    reviewer TEXT NOT NULL,
    observation TEXT NOT NULL,
    correction TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS review_events_assessment_time ON review_events (assessment_id, created_at);
