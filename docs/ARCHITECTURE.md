# BOOK-KARO Architecture Documentation

## System Architecture

### Overview
BOOK-KARO follows a modern three-tier architecture with clear separation of concerns:
- **Presentation Layer:** React-based SPA
- **Application Layer:** Spring Boot REST APIs
- **Data Layer:** PostgreSQL database with JPA/Hibernate

### Architecture Diagram
```
┌─────────────────┐
│  React Frontend │
│   (Port 3000)   │
└────────┬────────┘
         │ REST API (HTTP/JSON)
         │ JWT Authentication
┌────────▼────────┐
│  Spring Boot    │
│  Backend API    │
│   (Port 8080)   │
└────────┬────────┘
         │ JPA/Hibernate
┌────────▼────────┐
│   PostgreSQL    │
│    Database     │
└─────────────────┘
```

## Backend Architecture

### Layer Structure
```
com.bookkaro
├── config/           # Configuration classes (Security, CORS, etc.)
├── controller/       # REST API endpoints
├── service/          # Business logic
├── repository/       # Data access layer (JPA)
├── model/            # Entity classes
├── dto/              # Data Transfer Objects
├── security/         # JWT, authentication, authorization
├── exception/        # Custom exceptions and handlers
└── util/             # Utility classes
```

## Database Schema (Phase 1)

### Core Tables

**users**
- id (PK)
- email (unique)
- password (hashed)
- first_name
- last_name
- phone
- address
- city
- state
- postal_code
- latitude
- longitude
- role (USER, VENDOR, ADMIN)
- created_at
- updated_at
- is_active

**services**
- id (PK)
- vendor_id (FK -> users)
- service_name
- description
- category
- price
- duration_minutes
- is_available
- created_at
- updated_at

**bookings**
- id (PK)
- user_id (FK -> users)
- service_id (FK -> services)
- booking_date
- booking_time
- status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- total_amount
- notes
- created_at
- updated_at

**reviews**
- id (PK)
- booking_id (FK -> bookings)
- user_id (FK -> users)
- vendor_id (FK -> users)
- rating (1-5)
- comment
- created_at
- updated_at

## Security Architecture

### Authentication Flow
1. User submits credentials to `/api/auth/login`
2. Backend validates credentials
3. JWT token generated and returned
4. Client stores token (localStorage/sessionStorage)
5. Token sent in Authorization header for subsequent requests
6. Backend validates token on each request

### Authorization
- Role-based access control (RBAC)
- Three roles: USER, VENDOR, ADMIN
- Method-level security using @PreAuthorize

## API Design Principles

- RESTful conventions
- Versioned APIs (/api/v1/...)
- Consistent response format
- Proper HTTP status codes
- Pagination for list endpoints
- Input validation
- Error handling

## Non-Functional Requirements

- **Performance:** Response time < 200ms for most endpoints
- **Scalability:** Stateless architecture for horizontal scaling
- **Security:** HTTPS, JWT, password hashing (BCrypt), input validation
- **Maintainability:** Clean code, documentation, unit tests
- **Availability:** 99.9% uptime target

---

## Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/bookkaro/
│   │   │       ├── bookkaroApplication.java      # Main Spring Boot application
│   │   │       ├── config/                       # Configuration classes
│   │   │       │   ├── SecurityConfig.java      # Spring Security & JWT
│   │   │       │   ├── CorsConfig.java          # CORS configuration
│   │   │       │   └── DataInitializer.java     # Test data loader
│   │   │       ├── controller/                   # REST API endpoints
│   │   │       ├── service/                      # Business logic layer
│   │   │       ├── repository/                   # Data access (JPA)
│   │   │       ├── model/                        # Entity classes
│   │   │       ├── dto/                          # Data Transfer Objects
│   │   │       ├── security/                     # JWT utilities
│   │   │       ├── exception/                    # Exception handling
│   │   │       └── util/                         # Utility classes
│   │   └── resources/
│   │       ├── application.properties            # Main configuration
│   │       ├── application-prod.properties       # Production profile
│   │       └── application-postgres.properties   # PostgreSQL profile
│   └── test/                                     # Unit and integration tests
├── target/                                       # Build output
├── pom.xml                                       # Maven configuration
└── fast-build.ps1                                # Fast build script
```

### Frontend Structure

```
frontend/
├── public/
│   └── index.html                  # HTML template
├── src/
│   ├── index.js                    # React entry point
│   ├── App.js                      # Main App component
│   ├── components/                 # Reusable UI components
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   ├── LoadingSpinner/
│   │   ├── Toast/
│   │   ├── Modal/
│   │   ├── Breadcrumb/
│   │   └── ProtectedRoute/
│   ├── context/                    # React Context API
│   │   ├── AuthContext.js          # Authentication state
│   │   └── CartContext.js          # Shopping cart state
│   ├── pages/                      # Page components
│   │   ├── Home/
│   │   ├── Auth/                   # Login, Register
│   │   ├── Services/               # Service browsing
│   │   ├── Bookings/               # Booking management
│   │   ├── Profile/                # User profile
│   │   ├── Addresses/              # Address management
│   │   ├── Payment/                # Payment processing
│   │   ├── AdminRefunds/           # Admin refund management
│   │   └── ...
│   └── services/                   # API integration layer
│       ├── api.js                  # Main API client
│       ├── adminAPI.js             # Admin API calls
│       └── vendorAPI.js            # Vendor API calls
├── build/                          # Production build output
└── package.json                    # NPM configuration
```

### Configuration Files

**Backend (Port 8081):**
- Database: PostgreSQL 15.13 on `localhost:5432/bookkarodb`
- JWT Expiration: 24 hours
- Hibernate DDL: `update` (dev), `validate` (prod)

**Frontend (Port 3000):**
- API Base URL: `http://localhost:8081/api/v1`
- React Router v6 for navigation
- Axios for HTTP requests

### Build Performance

**Backend:**
- Full build: 8-10 seconds (multi-threaded)
- Incremental compile: 2-3 seconds
- Startup time: 5-10 seconds (optimized)

**Frontend:**
- Build time: ~15 seconds
- Hot reload: < 1 second

### Version Information

| Component | Version |
|-----------|---------|
| Java | 21 (LTS) |
| Spring Boot | 3.5.0 |
| PostgreSQL | 15.13 |
| React | 18.2.0 |
| Maven | 3.9+ |
| Node.js | 18+ |

---
Last Updated: October 24, 2025

