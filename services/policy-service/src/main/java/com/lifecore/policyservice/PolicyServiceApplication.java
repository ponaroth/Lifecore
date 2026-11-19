package com.lifecore.policyservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Policy service: customers, policies, beneficiaries and the beneficiary change workflow.
 *
 * <p>These live in one service on purpose: approving a change request and replacing the
 * beneficiaries must happen in a single database transaction. Inside the service the code is split
 * into modules (customer, policy, workflow) whose boundaries {@code ModularityTests} verifies.
 * Domain events leave the service through a transactional outbox (see {@code V1__baseline.sql}).
 */
@SpringBootApplication
public class PolicyServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PolicyServiceApplication.class, args);
    }
}
