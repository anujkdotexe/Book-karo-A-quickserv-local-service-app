# Fast Maven Build Script for Development
# Run this instead of "mvn clean package"

Write-Host "🚀 Fast Maven Build Starting..." -ForegroundColor Cyan

# Skip tests and use incremental compilation
mvn compile -DskipTests -Dmaven.test.skip=true

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilation successful!" -ForegroundColor Green
    Write-Host "Building JAR..." -ForegroundColor Yellow
    mvn package -DskipTests -Dmaven.test.skip=true -Dmaven.javadoc.skip=true
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ JAR built successfully!" -ForegroundColor Green
        Write-Host "📦 Location: backend\target\bookkaro-backend-1.0.4.jar" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
}
