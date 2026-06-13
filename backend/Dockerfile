FROM maven:3.9.11-eclipse-temurin-24 AS build

WORKDIR /app

COPY pom.xml .
ENV MAVEN_OPTS="-Xmx384m -XX:+TieredCompilation -XX:TieredStopAtLevel=1"
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests && cp target/*.jar target/app.jar
RUN java -Djarmode=tools -jar target/app.jar extract --layers --destination extracted

FROM eclipse-temurin:24-jre-alpine

WORKDIR /app

ENV PORT=8081

# Copy layers sequentially for maximum caching
COPY --from=build /app/extracted/dependencies/ ./
COPY --from=build /app/extracted/spring-boot-loader/ ./
COPY --from=build /app/extracted/snapshot-dependencies/ ./
COPY --from=build /app/extracted/application/ ./

EXPOSE 8081

# JVM Optimizations for Render Free Tier (Fast startup, IPv4 forced, memory capped)
ENV JAVA_OPTS="-XX:TieredStopAtLevel=1 -XX:+UseSerialGC -Djava.net.preferIPv4Stack=true -Xmx384m -Xms128m"

# Spring Boot 3.3+ generates a slim jar that automatically loads from the lib directory next to it
ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS:-} -jar *.jar"]
