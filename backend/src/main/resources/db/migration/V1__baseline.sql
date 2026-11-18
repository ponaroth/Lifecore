-- Baseline migration. Business tables arrive module by module in later migrations
-- (see docs/ROADMAP.md). Every timestamp is stored as timestamptz in UTC.

CREATE TABLE audit_event (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    occurred_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actor         VARCHAR(255) NOT NULL,
    action        VARCHAR(100) NOT NULL,
    entity_type   VARCHAR(100) NOT NULL,
    entity_id     VARCHAR(100) NOT NULL,
    details       JSONB
);

CREATE INDEX idx_audit_event_entity ON audit_event (entity_type, entity_id, occurred_at);
