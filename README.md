# BOOK-KARO - Quick Serve Local Service App

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

**Payment Processing**
- Mock payment gateway simulation (95% success rate)
- Secure payment flow
- Payment status tracking
- Automatic booking creation on success

**Refund Management** (NEW)
- Request refunds for eligible bookings
- Time-based refund policy (100%, 50%, or 0%)
- Admin approval/rejection workflow
- Refund status tracking (PENDING, PROCESSING, COMPLETED, REJECTED)
- Automatic booking cancellation on approval

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

- **users**: User authentication and profile (9 users: 3 test + 6 vendors)
- **vendors**: Service provider information (6 regional vendors)
- **services**: Service catalog (25 services across 6 cities)
- **bookings**: Customer bookings (30 sample bookings with reviews)
- **payments**: Payment records
- **refunds**: Refund requests and status
- **reviews**: Service reviews and ratings
- **addresses**: User address management
- **favorites**: User favorites/wishlist
- **cart_items**: Shopping cart
- **content**: Public content (FAQ, Help)

**Regional Coverage**: Mumbai, Pune, Delhi, Bangalore, Thane, Navi Mumbai

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
.\scripts\START_APP.ps1
```

**Option 2: Manual startup**

```bash
# Backend (Terminal 1)
cd backend
mvn clean package -DskipTests
java -jar target/bookkaro-backend-1.0.3.jar

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
CREATE DATABASE bookkarodb;
```

Update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/bookkarodb
spring.datasource.username=postgres
spring.datasource.password=your_password
```

## Deployment

### Production Build
```bash
# Backend
cd backend
mvn clean package -DskipTests
# Output: target/bookkaro-backend-1.0.3.jar

# Frontend
cd frontend
npm run build
# Output: build/ directory
```

### Environment Variables (Production)

**IMPORTANT**: The application uses default values for development. Override these in production:

```bash
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/dbname
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=password  # Default in dev: root (CHANGE THIS!)
JWT_SECRET=your-super-secret-256-bit-key  # Default in dev: bookkaroSecretKey2025... (CHANGE THIS!)
PORT=8081
```

**Security**: Never use default database password or JWT secret in production. Generate a strong JWT secret using:
```bash
# Generate secure 256-bit secret
openssl rand -base64 32
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

- **User**: user@bookkaro.com / password123
- **Vendor**: vendor@bookkaro.com / password123
- **Admin**: admin@bookkaro.com / admin123

## Project Status

**Version**: 1.0.3  
**Status**: Production Ready - Fully Optimized  
**Last Updated**: October 22, 2025

### Completed
- Phase 1 - User Module (All 13 features including refunds)
- Professional SLF4J logging
- Modern UI/UX with consistent styling
- Complete CRUD operations
- JWT authentication & authorization
- Database with 25 services across 6 regional vendors (multi-city)
- Backend startup optimization (60% faster)
- Build compilation optimization (40% faster)
- Cloud deployment ready
- Multi-role system (USER/VENDOR/ADMIN)
- Payment simulation with mock gateway
- Complete refund management system with admin approval workflow

### Pending
- [ ] Phase 2 - Vendor Module Testing
- [ ] Phase 3 - Admin Module Testing
- [ ] Production deployment to cloud
- [ ] Performance monitoring dashboard

## Documentation

- `README.md` - This file (overview and quick start)
- `QUICK_START.md` - Detailed setup guide
- `STRUCTURE.md` - Professional folder structure and organization
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

See `docs/important/API_DOCUMENTATION.md` for complete API reference.

## Contributing

This is a private project. Contact the repository owner for collaboration.

## License

Private - All Rights Reserved
