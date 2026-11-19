# ADR 0001: Start as a modular monolith

**Status:** Superseded by [ADR 0002](0002-microservices-on-eks.md). The modular approach still
applies *inside* the policy service.

## Context
LifeCore has several business areas (customers, policies, documents, workflow, audit, later
annuities). One developer builds it, and it must be easy to run locally and cheap to host.
Approving a beneficiary change touches policy, workflow and audit data, and must be atomic.

## Decision
Build one Spring Boot application. Each business area is a top-level package under
`com.lifecore` and is treated as a module: other modules may use only its public API (types in the
module's root package). Spring Modulith verifies these boundaries in `ModularityTests`, so a
violation fails the build.

## Consequences
- One deployable, one database, and ordinary local transactions for cross-module workflows.
- Boundaries are enforced by a test rather than by the network, so a module could be extracted into
  its own service later if there were a real reason to.
- Modules communicate by direct calls to public APIs, or by Spring application events where a
  module should not know about its listeners (for example, audit).
