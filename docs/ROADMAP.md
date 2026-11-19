# LifeCore build roadmap

LifeCore is a portfolio project: a simplified policy administration platform for a life insurer.
The goal is a small, finished, deployable system that demonstrates enterprise engineering
judgment, not a feature-complete product. Each phase ends in a working demo and a merged PR
(or a short series of PRs).

**Ground rules**
- All customers, policies and documents are fictional and synthetic.
- Annuity calculations are a simplified demonstration, not production actuarial logic.
- Every schema change is a Flyway migration. Every state change writes an audit event.
- Each phase ships with tests: unit (JUnit, Mockito) and integration (Testcontainers on PostgreSQL).
- From Phase 1 on, the live site always runs the latest `main` while it is up.
- Services never share a database; they talk through REST APIs and SNS/SQS events.

**Running as a public demo:** sign-in uses seeded demo accounts (one agent, one reviewer), demo data
resets nightly, uploads are size-limited, and the API is rate-limited.

## Phase 0 — Foundation ✅ (this PR)
- Three Spring Boot 3 / Java 21 services (`policy-service`, `document-service`, `audit-service`)
  in one Maven build, one shared Dockerfile ([ADR 0002](adr/0002-microservices-on-eks.md)).
- One PostgreSQL database per service with its own Flyway baseline (outbox, document versions,
  audit events); Actuator liveness/readiness probes; RFC 9457 problem-detail errors.
- docker-compose with PostgreSQL, LocalStack (private S3 bucket, SNS topic, SQS queue + DLQ) and
  the three services.
- React + TypeScript + Vite frontend showing each service's health, with Vitest.
- GitHub Actions CI: tests for every service (including Testcontainers), image builds, frontend.

## Phase 1 — Live on Amazon EKS (on demand)
The environment is brought up before an interview or demo and torn down afterwards, so it costs a
few dollars per demo day instead of a monthly bill.
- **Kept layer** (cheap, always there): Terraform state bucket, ECR repository per service, GitHub
  OIDC role, AWS Budgets alert.
- **Disposable layer**: VPC, EKS cluster with a small managed node group, AWS Load Balancer
  Controller, RDS PostgreSQL (one database per service), S3 bucket, SNS topic and SQS queues,
  frontend on S3 + CloudFront, CloudWatch logs.
- **Helm chart** per service: Deployment, Service, probes, resource limits, ConfigMap/Secret,
  and an Ingress rule for `/api/<service>`. Pod Identity gives each service only the AWS access it
  needs (documents → S3, policy → SNS, audit → SQS).
- **GitHub Actions**: every merge to `main` builds and pushes the three images to ECR.
  `Environment up` / `Environment down` buttons apply or destroy the disposable layer, deploy the
  latest images with Helm, seed demo data and print the live URL. Creating the cluster takes about
  15–20 minutes, so `up` takes roughly 25.

## Phase 2 — Policies, customers and sign-in (policy and audit services)
- **Auth:** every service is a Spring Security OAuth2 resource server (JWT); roles `AGENT`,
  `REVIEWER`, `ADMIN`. Frontend signs in with OIDC + PKCE. Service-to-service calls forward the
  user's token. Provider choice tracked in an ADR.
- **Customers:** search by name / policy number, view, create, update.
- **Policies:** create, activate, cancel with an explicit status state machine; list beneficiaries.
  Beneficiary shares must total exactly 100%.
- **Concurrency:** `@Version` optimistic locking, `ETag` / `If-Match` on updates, `409`/`412` responses.
- **Events:** changes write to the outbox in the same transaction; a relay publishes them to SNS.
- **Audit:** `audit-service` consumes events from SQS idempotently and serves an audit timeline.
- **Seed data:** Flyway-loaded fictional customers and policies for the demo.

## Phase 3 — Documents and the beneficiary change workflow (the demo path)
- **Documents:** upload via short-lived S3 presigned PUT, download via presigned GET; content-type
  and size checks; metadata and versions in PostgreSQL; bucket stays private.
- **Access control:** `document-service` asks `policy-service` whether the caller may see the
  owning policy before issuing a URL; every download emits an audit event.
- **Workflow:** beneficiary change request `DRAFT → SUBMITTED → APPROVED | REJECTED`, with illegal
  transitions rejected. Agents submit; reviewers approve; nobody approves their own request.
- **Apply on approval:** inside `policy-service`, beneficiaries are replaced and the request closed in
  one transaction, with the outbox event in that same transaction.
- **Frontend:** policy search, policy detail, submit change with PDF, reviewer queue, audit timeline.

At the end of Phase 3 the five-minute interview demo runs end to end on the live site.

## Phase 4 — Annuities (simplified demonstration, a fourth service)
- Contracts with a ledger of contributions, credited interest and withdrawals.
- `BigDecimal` everywhere, with documented scale and `RoundingMode.HALF_EVEN` rules.
- Balance derived from the ledger; withdrawals rejected on insufficient balance inside a transaction
  with row locking.
- Scheduled withdrawals processed by an idempotent job.

## Phase 5 — Polish for interviews
- Architecture diagram, ADRs for the main decisions, and a scripted five-minute demo.
- Concurrency demo (two browsers editing one policy), error-handling walkthrough.
- Observability: structured logs, distributed tracing across services (OpenTelemetry), a
  CloudWatch dashboard.
- Resilience demo: kill a pod during a request; show retries, the DLQ and Kubernetes self-healing.
