package com.lifecore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * LifeCore: a simplified insurance policy administration platform.
 *
 * <p>The application is a modular monolith. Each direct sub-package of {@code com.lifecore}
 * is a business module (customer, policy, document, workflow, audit). Module boundaries are
 * verified by {@code ModularityTests} using Spring Modulith.
 */
@SpringBootApplication
public class LifeCoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(LifeCoreApplication.class, args);
    }
}
