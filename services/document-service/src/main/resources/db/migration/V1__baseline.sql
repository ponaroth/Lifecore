-- Document service baseline. Metadata only: file contents live in private S3.

CREATE TABLE document (
    id            UUID         PRIMARY KEY,
    policy_number VARCHAR(50)  NOT NULL,
    document_type VARCHAR(50)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by    VARCHAR(255) NOT NULL
);

CREATE TABLE document_version (
    id              UUID         PRIMARY KEY,
    document_id     UUID         NOT NULL REFERENCES document (id),
    version_number  INT          NOT NULL,
    s3_key          VARCHAR(512) NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    size_bytes      BIGINT       NOT NULL,
    sha256          CHAR(64)     NOT NULL,
    uploaded_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    uploaded_by     VARCHAR(255) NOT NULL,
    UNIQUE (document_id, version_number)
);

CREATE INDEX idx_document_policy ON document (policy_number);
