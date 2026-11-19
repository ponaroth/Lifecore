-- One database per service. Locally they share a Postgres server; on AWS they can share one RDS
-- instance with separate databases and credentials, or be split onto separate instances.
CREATE DATABASE policy;
CREATE DATABASE document;
CREATE DATABASE audit;
