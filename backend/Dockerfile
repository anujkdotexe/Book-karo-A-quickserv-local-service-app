FROM maven:3.9.11-eclipse-temurin-24 AS build

WORKDIR /app

# Cache dependencies layer
COPY pom.xml .
ENV MAVEN_OPTS="-Xmx512m -XX:+TieredCompilation -XX:TieredStopAtLevel=1"
RUN mvn -B dependency:resolve dependency:resolve-plugins -DexcludeTransitive=false -q || true

# Build application
COPY src ./src
RUN mvn -B package -DskipTests -Dmaven.javadoc.skip=true && cp target/*.jar target/app.jar

FROM eclipse-temurin:24-jre

WORKDIR /app

ENV PORT=8081

COPY --from=build /app/target/app.jar app.jar

EXPOSE 8081

# JVM Optimizations for Containerized Railway / Cloud Deployments:
# - UseContainerSupport: respects container cgroup memory limits
# - MaxRAMPercentage: allocates 75% container memory to heap safely
# - ExitOnOutOfMemoryError: triggers instant clean restart on OOM
# - SerialGC: low-overhead GC optimized for single/dual-core cloud containers
# - preferIPv4Stack & urandom: fast DNS resolution & non-blocking entropy
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=40.0 -XX:+ExitOnOutOfMemoryError -XX:TieredStopAtLevel=1 -XX:+UseSerialGC -Djava.net.preferIPv4Stack=true -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS} -jar app.jar"]
