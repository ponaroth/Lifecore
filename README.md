# LifeCore — Insurance Policy Administration Platform

A simplified enterprise application where insurance agents and operations reviewers manage
customers, life insurance policies, documents and annuities. Built as a portfolio project with
the stack used in modern insurance platforms: **Java 21, Spring Boot, PostgreSQL, React and AWS**.

> All customers, policies and documents in this project are fictional. Annuity calculations are a
> simplified demonstration, not production actuarial logic.

## The core workflow
1. An agent finds a customer's policy.
2. The agent submits a beneficiary change request with a signed PDF.
3. The PDF is stored in private S3; its metadata lives in PostgreSQL.
4. An operations reviewer approves the request.
5. The beneficiaries are updated in one transaction, and the audit trail records who did what.

## Architecture
Three Spring Boot microservices on Amazon EKS, each with its own database
([ADR 0002](docs/adr/0002-microservices-on-eks.md)):

```
                    React app (S3 + CloudFront)
                               |
                   ALB ingress  /api/<service>
          +--------------------+--------------------+
          |                    |                    |
   policy-service       document-service      audit-service
  customers, policies,   PDF metadata,        append-only
  beneficiaries,         presigned URLs        audit trail
  change workflow              |                    ^
          |               private S3                |
          +---- domain events -> SNS topic -> SQS queue
   (each service has its own PostgreSQL database)
```

| Layer | Choice |
| --- | --- |
| Services | Java 21, Spring Boot 3.5, Spring Data JPA; Spring Modulith inside `policy-service` |
| Data | PostgreSQL 16, one database per service, Flyway migrations |
| Messaging | Amazon SNS + SQS with dead-letter queues; transactional outbox; idempotent consumers |
| Documents | Private S3 with short-lived presigned URLs |
| Frontend | React, TypeScript, Vite |
| Security | Spring Security, OAuth2/OIDC, role-based access (Phase 2) |
| Runtime | Docker, Amazon EKS, Helm, RDS, Terraform; brought up on demand (Phase 1) |
| Local | docker-compose with LocalStack (S3, SNS, SQS) |
| CI/CD | GitHub Actions |
| Testing | JUnit 5, Mockito, Testcontainers, Spring Modulith, Vitest |

## Repository layout
```
services/            Maven build for all services + one shared Dockerfile
  policy-service/    :8081
  document-service/  :8082
  audit-service/     :8083
frontend/            React + TypeScript + Vite
infra/               local Postgres and LocalStack setup (Terraform and Helm arrive in Phase 1)
docs/                roadmap and architecture decision records
```

## Run it locally
Prerequisites: Java 21, Node 22, Docker.

```bash
# Everything in containers: Postgres, LocalStack and the three services
docker compose --profile apps up -d --build

# Or only the dependencies, and run services from your IDE / terminal
docker compose up -d
cd services && ./mvnw -pl policy-service spring-boot:run   # likewise document-service, audit-service

# Frontend (proxies /api/<service> to the services)
cd frontend && npm install && npm run dev                   # http://localhost:5173
```

Health checks: `curl localhost:8081/actuator/health` (8082, 8083 for the others).

## Test
```bash
cd services && ./mvnw verify   # unit, module-boundary and Testcontainers integration tests
cd frontend && npm test        # Vitest
```

## Roadmap
See [docs/ROADMAP.md](docs/ROADMAP.md). In short:

0. **Foundation** — three-service skeleton, local stack, CI ✅
1. **Live on Amazon EKS** — Terraform, Helm, RDS, S3, SNS/SQS; brought up on demand for demos
2. **Policies, customers and sign-in** — roles, optimistic locking, audit
3. **Documents and beneficiary change workflow** — the end-to-end demo path
4. **Annuities** — BigDecimal ledger, interest, withdrawals (simplified)
5. **Interview polish** — diagrams, demo script, observability
