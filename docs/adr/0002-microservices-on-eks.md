# ADR 0002: Three microservices on Amazon EKS

**Status:** Accepted

## Context
LifeCore should show the architecture a large insurer modernizing its platform is likely to run:
independently deployable services in containers on Kubernetes. It is still built by one developer,
must run on a laptop with one command, and is hosted on AWS only on demand.

The most important correctness rule is that approving a beneficiary change and replacing the
policy's beneficiaries happen atomically.

## Decision
Split by business capability into three Spring Boot services, each with its own PostgreSQL
database and its own container image:

| Service | Owns | Why it is separate |
| --- | --- | --- |
| `policy-service` | customers, policies, beneficiaries, change-request workflow | Approval and beneficiary update must share one transaction, so they stay together. Internally split into modules verified by Spring Modulith. |
| `document-service` | PDF metadata and versions; files in private S3 | Different load (large uploads), different storage, different security concerns. |
| `audit-service` | append-only audit trail | Every service writes to it; it must never block or roll back a business change. |

- **Synchronous calls:** REST, carrying the caller's JWT so every service enforces authorization.
- **Asynchronous events:** services publish domain events to one SNS topic; each consumer reads its
  own SQS queue with a dead-letter queue. Publishers use a transactional outbox, so an event is sent
  if and only if its business change commits. Consumers are idempotent (unique `event_id`).
- **Runtime:** Amazon EKS. Each service has a Kubernetes Deployment with liveness/readiness probes
  (Spring Boot Actuator), is reached through an ALB ingress at `/api/<service>`, and gets AWS
  permissions from its own IAM role (EKS Pod Identity). No AWS keys in the cluster.
- **Locally:** docker-compose runs PostgreSQL (one database per service), LocalStack (S3, SNS, SQS)
  and the three services.

## Consequences
- Shows service boundaries, event-driven integration, outbox, idempotent consumers, per-service data
  and Kubernetes deployment, which are the patterns interviewers ask about.
- Cross-service reads (for example, "may this user see documents of policy X?") need an API call or
  a local copy built from events; each case is decided when the feature is built.
- More moving parts than a monolith: three images, three databases, a message broker, and a cluster
  that takes roughly 15–20 minutes to create. Acceptable because the environment is on demand.
- Annuities can become a fourth service later without touching the others.
