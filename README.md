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
| Layer | Choice |
| --- | --- |
| Backend | Java 21, Spring Boot 3.5, Spring Data JPA, modular monolith ([ADR 0001](docs/adr/0001-modular-monolith.md)) |
| Database | PostgreSQL 16, Flyway migrations |
| Documents | Private S3 with short-lived presigned URLs (LocalStack locally) |
| Frontend | React, TypeScript, Vite |
| Security | Spring Security, OAuth2/OIDC, role-based access (Phase 2) |
| Deployment | Docker, AWS ECS Fargate, RDS, Terraform (Phase 1) |
| CI/CD | GitHub Actions |
| Testing | JUnit 5, Mockito, Testcontainers, Spring Modulith, Vitest |

Backend modules live under `backend/src/main/java/com/lifecore/`: `customer`, `policy`,
`document`, `workflow`, `audit`, plus `shared` for cross-cutting code.

## Run it locally
Prerequisites: Java 21, Node 22, Docker.

```bash
docker compose up -d                      # PostgreSQL on :5432, LocalStack S3 on :4566
cd backend && ./mvnw spring-boot:run      # API on http://localhost:8080
cd frontend && npm install && npm run dev # UI on http://localhost:5173
```

Health check: `curl localhost:8080/actuator/health`

## Test
```bash
cd backend && ./mvnw verify   # unit, module-boundary and Testcontainers integration tests
cd frontend && npm test       # Vitest
```

## Roadmap
See [docs/ROADMAP.md](docs/ROADMAP.md). In short:

0. **Foundation** — project skeleton, CI ✅
1. **Live on AWS** — Terraform, ECS Fargate, RDS, S3; brought up on demand for demos
2. **Policies, customers and sign-in** — roles, optimistic locking, audit
3. **Documents and beneficiary change workflow** — the end-to-end demo path
4. **Annuities** — BigDecimal ledger, interest, withdrawals (simplified)
5. **Interview polish** — diagrams, demo script, observability
