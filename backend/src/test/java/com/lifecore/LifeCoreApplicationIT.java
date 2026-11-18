package com.lifecore;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Boots the whole application against a real PostgreSQL (Testcontainers) and checks that
 * Flyway migrations apply and the health endpoint is up. Skipped when Docker is unavailable.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers(disabledWithoutDocker = true)
class LifeCoreApplicationIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    TestRestTemplate http;

    @Autowired
    JdbcTemplate jdbc;

    @Test
    void appliesMigrationsAndReportsHealthy() {
        Integer applied = jdbc.queryForObject(
                "select count(*) from flyway_schema_history where success", Integer.class);
        assertThat(applied).isPositive();

        var health = http.getForEntity("/actuator/health", String.class);
        assertThat(health.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(health.getBody()).contains("\"status\":\"UP\"");
    }
}
