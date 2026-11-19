-- Audit service baseline. Rows are only ever inserted, never updated or deleted.

CREATE TABLE audit_event (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id      UUID         NOT NULL UNIQUE,  -- from the publisher; makes consumption idempotent
    occurred_at   TIMESTAMPTZ  NOT NULL,
    recorded_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    source        VARCHAR(100) NOT NULL,
    actor         VARCHAR(255) NOT NULL,
    action        VARCHAR(100) NOT NULL,
    entity_type   VARCHAR(100) NOT NULL,
    entity_id     VARCHAR(100) NOT NULL,
    details       JSONB
);

CREATE INDEX idx_audit_event_entity ON audit_event (entity_type, entity_id, occurred_at);
