package com.lifecore.auditservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Audit service: an append-only record of who changed what, and when.
 *
 * <p>Other services publish domain events to SNS; this service consumes them from an SQS queue and
 * stores them. Consumers are idempotent because SQS may deliver a message more than once.
 */
@SpringBootApplication
public class AuditServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuditServiceApplication.class, args);
    }
}
