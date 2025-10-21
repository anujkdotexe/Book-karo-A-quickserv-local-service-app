# Bookaro - Quick Serve Local Service App

A production-ready three-tier service marketplace platform connecting customers with local service providers.

## Tech Stack

**Backend:**
- Spring Boot 3.5.0 (Optimized for fast startup)
- PostgreSQL 15.13
- JWT Authentication
- Hibernate/JPA with lazy initialization
- Maven (Multi-threaded builds)

**Frontend:**
- React 18+
- React Router
- Axios
- CSS Variables (Custom Styling)

## Performance Highlights

**Backend Optimization:**
- Startup time: 5-10 seconds (60% faster)
- Multi-threaded compilation (16 cores)
- Memory usage: ~300MB (33% less)
- Cloud-deployment ready

**Build Optimization:**
- Incremental builds: ~3 seconds
- Full compile: ~7 seconds
- Parallel Maven builds enabled

## Features

**User Authentication**
- Registration with email/password
- JWT-based login with 24-hour token expiration
- BCrypt password hashing

**Profile Management**
- View and update personal information
- Secure profile access

**Service Discovery**
- Browse all available services
- Advanced search with filters (category, city, price range)
- Pagination support
- Service details with ratings and reviews

**Booking System**
- Create bookings with date/time selection
- Automatic price calculation
- Booking status tracking (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- View booking history

**Favorites**
- Add/remove services to favorites
- Quick access to preferred services

**Address Management**
- Multiple address support
- Set default address
- Address types (HOME, WORK, OTHER)

**Review & Rating System**
- Rate services (1-5 stars)
- Write detailed reviews
- View service reviews

## Database Schema

- **users**: User authentication and profile
- **vendors**: Service provider information
- **services**: Service catalog (165 services)
- **bookings**: Customer bookings
- **reviews**: Service reviews and ratings
- **addresses**: User address management
- **favorites**: User favorites/wishlist

## Setup Instructions

### Prerequisites
- Java 21+
- Node.js 18+
### Prerequisites
- Java 21+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.9+

### Quick Start (Development)

**Option 1: Use the startup script (Recommended)**
```powershell
# Windows PowerShell
.\START_APP.ps1
```

**Option 2: Manual startup**

```bash
# Backend (Terminal 1)
cd backend
mvn clean package -DskipTests
java -jar target/bookaro-backend-1.0.3.jar

# Frontend (Terminal 2)
cd frontend
npm install
npm start
```

Backend runs on: `http://localhost:8081/api/v1`  
Frontend runs on: `http://localhost:3000`

### Fast Development Builds

**Incremental compile (2-3 seconds):**
```bash
cd backend
mvn compile -DskipTests
```

**Full rebuild (5-7 seconds):**
```bash
cd backend
mvn clean compile -DskipTests
```

**Create JAR (8-10 seconds):**
```bash
cd backend
.\fast-build.ps1
# OR: mvn clean package -DskipTests
```

### Database Configuration

Create PostgreSQL database:
```sql
CREATE DATABASE bookarodb;
```

Update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/bookarodb
spring.datasource.username=postgres
spring.datasource.password=your_password
```

## Deployment

### Production Build
```bash
# Backend
cd backend
mvn clean package -DskipTests
# Output: target/bookaro-backend-1.0.3.jar

# Frontend
cd frontend
npm run build
# Output: build/ directory
```

### Environment Variables (Production)
```bash
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/dbname
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=password
JWT_SECRET=your-super-secret-256-bit-key
PORT=8081
```

### Cloud Deployment
- **Railway/Render**: Auto-detected, just push to Git
- **Heroku**: Uses included `Procfile`
- **Docker**: See `backend/DEPLOYMENT_OPTIMIZATION.md`
- **AWS/GCP/Azure**: Java 21 runtime, 512MB RAM minimum

**Startup time**: 5-10 seconds (optimized for cloud)

## Performance Optimizations

See detailed guides:
- `backend/BUILD_OPTIMIZATION.md` - Compilation speed (40-60% faster)
- `backend/DEPLOYMENT_OPTIMIZATION.md` - Startup optimization (60-70% faster)

**Key optimizations:**
- Lazy bean initialization
- Deferred repository bootstrap
- HikariCP connection pooling
- Multi-threaded Maven builds
- Hibernate batch operations

## Test Credentials

- **User**: user@bookaro.com / password123
- **Vendor**: vendor@bookaro.com / password123
- **Admin**: admin@bookaro.com / admin123

## Project Status

**Version**: 1.0.3  
**Status**: Production Ready - Fully Optimized  
**Last Updated**: October 21, 2025

### Completed
- Phase 1 - User Module (All 9 features)
- Professional SLF4J logging
- Modern UI/UX with consistent styling
- Complete CRUD operations
- JWT authentication & authorization
- Database persistence with 165 services
- Backend startup optimization (60% faster)
- Build compilation optimization (40% faster)
- Cloud deployment ready
- Multi-role system (USER/VENDOR/ADMIN)

### Pending
- [ ] Phase 2 - Vendor Module Testing
- [ ] Phase 3 - Admin Module Testing
- [ ] Production deployment to cloud
- [ ] Performance monitoring dashboard

## Documentation

- `README.md` - This file (overview and quick start)
- `QUICK_START.md` - Detailed setup guide
- `backend/BUILD_OPTIMIZATION.md` - Compilation speed guide
- `backend/DEPLOYMENT_OPTIMIZATION.md` - Startup optimization guide
- `docs/important/` - Complete technical documentation
  - `API_DOCUMENTATION.md` - All API endpoints
  - `DATABASE_SCHEMA.md` - Database structure
  - `ARCHITECTURE.md` - System architecture
  - `PRODUCTION_READINESS_CHECKLIST.md` - Deployment checklist

## Security Notes

**Development Configuration** (Change for Production):
- Database password: Currently 'root' (use strong password)
- JWT secret: Default key (generate 256-bit secret)
- CORS: Currently allows all origins (restrict to your domain)
- Enable HTTPS/SSL for production
- Set `SPRING_PROFILES_ACTIVE=prod`

## API Documentation

See `documentation/API_DOCUMENTATION.md` for complete API reference.

## Contributing

This is a private project. Contact the repository owner for collaboration.

## License

Private - All Rights Reserved
