# Bookaro - Quick Serve Local Service App

A production-ready three-tier service marketplace platform connecting customers with local service providers.

## Tech Stack

**Backend:**
- Spring Boot 3.5.0
- PostgreSQL 15.13
- JWT Authentication
- Hibernate/JPA
- Maven

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
- PostgreSQL 15+
- Maven 3.9+

### Backend Setup

```bash
cd backend
mvn clean install
mvn package
java -jar target/bookaro-backend-1.0.3.jar
```

Backend runs on: `http://localhost:8081/api/v1`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

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

## Test Credentials

- **User**: user@bookaro.com / password123
- **Vendor**: vendor@bookaro.com / password123
- **Admin**: admin@bookaro.com / admin123

## Project Status

**Version**: 1.0.3  
**Status**: Production Ready (Phase 1)  
**Last Updated**: October 20, 2025

### Completed
- [DONE] Phase 1 - User Module (All 9 features)
- [DONE] Professional SLF4J logging
- [DONE] Modern UI/UX with consistent styling
- [DONE] Complete CRUD operations
- [DONE] JWT authentication
- [DONE] Database persistence

### Pending
- [PENDING] Phase 2 - Vendor Module
- [PENDING] Phase 3 - Admin Module
- [PENDING] Production deployment
- [PENDING] Performance optimization

## Security Notes

**Development Configuration** (Change for Production):
- Database password: Currently 'root'
- JWT secret: Default key (generate strong secret)
- CORS: localhost:3000 only
- Enable HTTPS/SSL for production

## API Documentation

See `documentation/API_DOCUMENTATION.md` for complete API reference.

## Contributing

This is a private project. Contact the repository owner for collaboration.

## License

Private - All Rights Reserved
