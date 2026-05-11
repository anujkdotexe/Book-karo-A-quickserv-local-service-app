This project targets JDK 24. To make your environment and CI use JDK 24 permanently, set `JAVA_HOME` to your JDK 24 install and ensure `%JAVA_HOME%\bin` is on `Path`.

Option A — set system/user JAVA_HOME (recommended)

On Windows (set permanently via System Properties):
1. Open "Edit the system environment variables" → Environment Variables.
2. Add/Update JAVA_HOME to: C:\Program Files\Java\jdk-24
3. Move `%JAVA_HOME%\bin` before other Java locations in `Path` or remove older Java paths.
4. Restart terminals/IDE.

Notes
- The `backend/pom.xml` targets Java 24 directly, so builds must run on JDK 24 or newer.
- CI systems: set `JAVA_HOME` to a JDK 24 install and make sure the Docker build image uses Java 24 too.
