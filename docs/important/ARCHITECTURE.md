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
Last Updated: October 15, 2025

