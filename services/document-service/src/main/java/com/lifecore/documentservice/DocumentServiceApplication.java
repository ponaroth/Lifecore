package com.lifecore.documentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Document service: signed PDFs in a private S3 bucket.
 *
 * <p>Clients never get bucket access. The service issues short-lived presigned URLs for a single
 * object after checking that the caller may see the owning policy, and records each version's
 * metadata in its own database.
 */
@SpringBootApplication
public class DocumentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DocumentServiceApplication.class, args);
    }
}
