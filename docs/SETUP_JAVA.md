This project targets JDK 24. To make your environment and CI use JDK 24 permanently, follow either option A or B.

Option A — set system/user JAVA_HOME (recommended)

On Windows (set permanently via System Properties):
1. Open "Edit the system environment variables" → Environment Variables.
2. Add/Update JAVA_HOME to: C:\Program Files\Java\jdk-24
3. Move `%JAVA_HOME%\bin` before other Java locations in `Path` or remove older Java paths.
4. Restart terminals/IDE.

Option B — use Maven Toolchains (project-friendly)

1. Copy `backend/toolchains.xml.sample` to your user maven folder as `%USERPROFILE%\.m2\toolchains.xml` on Windows (or `~/.m2/toolchains.xml` on Linux/macOS).
2. Edit the `<jdkHome>` value to point to your JDK 24 install (e.g. `C:\Program Files\Java\jdk-24`).
3. Maven will prefer the toolchain-specified JDK when building the project.

Notes
- The `backend/pom.xml` now requests JDK 24 via the `maven-toolchains-plugin` and will fail the build early if Java &lt; 24 via `maven-enforcer-plugin`.
- CI systems: set JAVA_HOME in your CI environment or add the `toolchains.xml` on the CI agent's `~/.m2`.
