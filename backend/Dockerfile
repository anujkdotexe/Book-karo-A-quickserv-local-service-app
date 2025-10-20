FROM openjdk:21-jdk-slim

VOLUME /tmp

COPY target/bookaro-backend-1.0.3.jar app.jar

ENTRYPOINT ["java","-jar","/app.jar"]
