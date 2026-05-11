FROM maven:3.9.11-eclipse-temurin-24 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests && cp target/*.jar target/app.jar

FROM eclipse-temurin:24-jre-alpine

WORKDIR /app

ENV PORT=8081

COPY --from=build /app/target/app.jar app.jar

EXPOSE 8081

ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS:-} -jar /app/app.jar"]
