-- Policy service baseline. Customer, policy and workflow tables arrive in later migrations.
-- Every timestamp is stored as timestamptz in UTC.

-- Transactional outbox: domain events are written here in the same transaction as the business
-- change, then relayed to SNS. An event is never lost and never sent for a rolled-back change.
CREATE TABLE outbox_event (
    id              UUID         PRIMARY KEY,
    occurred_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    aggregate_type  VARCHAR(100) NOT NULL,
    aggregate_id    VARCHAR(100) NOT NULL,
    event_type      VARCHAR(100) NOT NULL,
    payload         JSONB        NOT NULL,
    published_at    TIMESTAMPTZ
);

CREATE INDEX idx_outbox_unpublished ON outbox_event (occurred_at) WHERE published_at IS NULL;
