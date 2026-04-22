FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests -Dproject.build.finalName=app

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

ENV PORT=8081

COPY --from=build /app/target/app.jar app.jar

EXPOSE 8081

ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS:-} -jar /app/app.jar"]
