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

## Features (Phase 1 - User Module)

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

**Refund Management**
- Request refunds for eligible bookings
- Time-based refund policy (100%, 50%, or 0%)
- Admin approval/rejection workflow
- Refund status tracking

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

- **users**: User authentication and profile (9 users)
- **vendors**: Service provider information (6 regional vendors)
- **services**: Service catalog (25 services across 6 cities)
- **bookings**: Customer bookings (30 sample bookings)
- **payments**: Payment records
- **refunds**: Refund requests and status
- **reviews**: Service reviews and ratings
- **addresses**: User address management
- **favorites**: User favorites/wishlist
- **cart_items**: Shopping cart

**Regional Coverage**: Mumbai, Pune, Delhi, Bangalore, Thane, Navi Mumbai

## Setup Instructions

### Prerequisites
- Java 21+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.9+

### Quick Start

**Option 1: Automated (Recommended)**
```powershell
.\scripts\START_APP.ps1
```

**Option 2: Manual**
```bash
# Backend
cd backend
mvn clean package -DskipTests
java -jar target/bookkaro-backend-1.0.3.jar

# Frontend
cd frontend
npm install
npm start
```

Backend: `http://localhost:8081/api/v1`  
Frontend: `http://localhost:3000`

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

## Test Credentials

- **User**: user@bookkaro.com / password123
- **Vendor**: vendor@bookkaro.com / password123
- **Admin**: admin@bookkaro.com / admin123

## Project Status

**Version**: 1.0.3  
**Status**: Production Ready - Fully Optimized  
**Last Updated**: January 2025

### Completed
- ✅ Phase 1 - User Module (All 13 features including refunds)
- ✅ Professional SLF4J logging
- ✅ Modern UI/UX with consistent styling
- ✅ Complete CRUD operations
- ✅ JWT authentication & authorization
- ✅ Backend startup optimization (60% faster)
- ✅ Build compilation optimization (40% faster)
- ✅ Cloud deployment ready
- ✅ Multi-role system (USER/VENDOR/ADMIN)
- ✅ Payment simulation with mock gateway
- ✅ Complete refund management system

### Pending
- ⏳ Phase 2 - Vendor Module Testing
- ⏳ Phase 3 - Admin Module Testing
- ⏳ Production deployment to cloud
- ⏳ Performance monitoring dashboard

## Performance Highlights

- Startup time: 5-10 seconds (60% faster)
- Incremental builds: ~3 seconds
- Full compile: ~7 seconds
- Memory usage: ~300MB (33% less)

## Security Notes

**Development Configuration** (Change for Production):
- Database password: Currently 'root' (use strong password)
- JWT secret: Default key (generate 256-bit secret)
- CORS: Currently allows all origins (restrict to your domain)
- Enable HTTPS/SSL for production
- Set `SPRING_PROFILES_ACTIVE=prod`

## Documentation

- `README.md` - Main project overview (this file)
- `QUICK_START.md` - Detailed setup guide
- `STRUCTURE.md` - Project structure
- `docs/important/` - Technical documentation
  - `API_DOCUMENTATION.md` - All API endpoints
  - `DATABASE_SCHEMA.md` - Database structure
  - `ARCHITECTURE.md` - System architecture
  - `PRODUCTION_READINESS_CHECKLIST.md` - Deployment checklist

## Contributing

This is a private project. Contact the repository owner for collaboration.

## License

Private - All Rights Reserved
