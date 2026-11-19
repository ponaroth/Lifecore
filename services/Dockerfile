# syntax=docker/dockerfile:1
# One Dockerfile for every service. Build from the services/ directory:
#   docker build --build-arg SERVICE=policy-service -t lifecore/policy-service .
FROM eclipse-temurin:21-jdk AS build
ARG SERVICE
WORKDIR /src
COPY .mvn .mvn
COPY mvnw pom.xml ./
COPY policy-service/pom.xml policy-service/
COPY document-service/pom.xml document-service/
COPY audit-service/pom.xml audit-service/
RUN ./mvnw -B -q -pl ${SERVICE} -am dependency:go-offline
COPY . .
RUN ./mvnw -B -q -pl ${SERVICE} -am package -DskipTests

FROM eclipse-temurin:21-jre
ARG SERVICE
WORKDIR /app
RUN useradd --system --uid 10001 lifecore
COPY --from=build /src/${SERVICE}/target/app.jar app.jar
USER 10001
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
