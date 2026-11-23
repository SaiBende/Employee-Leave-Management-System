# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies separately from source changes
COPY pom.xml .
RUN mvn -B -ntp dependency:go-offline

COPY src ./src
RUN mvn -B -ntp -Dmaven.test.skip=true package

# ---------- Runtime stage ----------
FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app

COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
RUN chown -R app:app /app
USER app

EXPOSE 8080

# Overridable at runtime (docker-compose sets tighter limits)
ENV JAVA_TOOL_OPTIONS="-Xms128m -Xmx512m"

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
