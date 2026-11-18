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

## Phase 0 — Foundation ✅ (this PR)
- Modular-monolith Spring Boot 3 / Java 21 backend; module boundaries verified by Spring Modulith.
- PostgreSQL + Flyway baseline; Actuator health probes; RFC 9457 problem-detail errors.
- docker-compose with PostgreSQL and LocalStack (private, versioned S3 bucket).
- React + TypeScript + Vite frontend shell with Vitest.
- GitHub Actions CI building and testing both apps.

## Phase 1 — Policies, customers and sign-in
- **Auth:** Spring Security OAuth2 resource server (JWT); roles `AGENT`, `REVIEWER`, `ADMIN`.
  Frontend signs in with OIDC + PKCE. Provider choice tracked in an ADR.
- **Customers:** search by name / policy number, view, create, update.
- **Policies:** create, activate, cancel with an explicit status state machine; list beneficiaries.
  Beneficiary shares must total exactly 100%.
- **Concurrency:** `@Version` optimistic locking, `ETag` / `If-Match` on updates, `409`/`412` responses.
- **Audit:** append-only `audit_event` written in the same transaction as the change.
- **Seed data:** Flyway-loaded fictional customers and policies for the demo.

## Phase 2 — Documents and the beneficiary change workflow (the demo path)
- **Documents:** upload via short-lived S3 presigned PUT, download via presigned GET; content-type
  and size checks; metadata and versions in PostgreSQL; bucket stays private.
- **Access control:** a user can reach a document only through a policy they are allowed to see;
  every download is audited.
- **Workflow:** beneficiary change request `DRAFT → SUBMITTED → APPROVED | REJECTED`, with illegal
  transitions rejected. Agents submit; reviewers approve; nobody approves their own request.
- **Apply on approval:** beneficiaries are replaced and the request closed in one transaction.
- **Frontend:** policy search, policy detail, submit change with PDF, reviewer queue, audit timeline.

At the end of Phase 2 the five-minute interview demo runs end to end locally.

## Phase 3 — Deploy to AWS
- Terraform: VPC, ALB, ECS Fargate service, RDS PostgreSQL, private S3 bucket, ECR, CloudWatch logs
  and alarms, Secrets Manager for credentials.
- GitHub Actions CD: build image, push to ECR, deploy to ECS, authenticating to AWS with GitHub OIDC
  (no long-lived keys).
- Frontend served from S3 + CloudFront.
- A documented `terraform destroy` path so the environment only costs money while it is up.

## Phase 4 — Annuities (simplified demonstration)
- Contracts with a ledger of contributions, credited interest and withdrawals.
- `BigDecimal` everywhere, with documented scale and `RoundingMode.HALF_EVEN` rules.
- Balance derived from the ledger; withdrawals rejected on insufficient balance inside a transaction
  with row locking.
- Scheduled withdrawals processed by an idempotent job.

## Phase 5 — Polish for interviews
- Architecture diagram, ADRs for the main decisions, and a scripted five-minute demo.
- Concurrency demo (two browsers editing one policy), error-handling walkthrough.
- Observability: structured logs, request correlation IDs, a CloudWatch dashboard.
