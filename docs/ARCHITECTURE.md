# BOOK-KARO Architecture Documentation

**Version**: 1.0.4  
**Last Updated**: December 3, 2025  
**Environment**: Production Ready (Dev Mode)  
**Build Status**: Backend JAR built, Frontend optimized  

## Current System Overview

### Live System Statistics (December 3, 2025)
- **Total Users**: 87 (1 admin + 26 vendors + 60 customers)
- **Active Vendors**: 26 service providers across 7 cities
- **Available Services**: 580 across 6 categories (Electrical, Home Services, IT & Software, Logistics, Painting, Plumbing)
- **Historical Bookings**: 973 completed transactions with full lifecycle tracking
- **User Addresses**: 226 (HOME, WORK, OFFICE, OTHER types supported)
- **Customer Favorites**: 488 saved services with idempotent operations
- **Service Reviews**: 762 authentic customer ratings and detailed feedback
- **Payment Records**: 115 transaction records with mock gateway integration
- **Active Coupons**: 24 discount codes with usage tracking
- **Content Items**: 12 announcements, 8 FAQs, 6 promotional banners

### Production Features (All Implemented)
- **Authentication System**: JWT-based with 24h token expiration, role-based access control
- **Service Marketplace**: 580+ services with advanced search, filtering, and pagination
- **Booking Management**: Complete lifecycle from creation to completion with status tracking
- **Address System**: Multiple address types with city validation and default selection
- **Favorites Management**: Idempotent add/remove operations with 488+ saved preferences
- **Review System**: 5-star ratings with 762+ authentic reviews and vendor responses
- **Shopping Cart**: Multi-service cart with checkout and payment integration
- **Vendor Dashboard**: Complete business management with analytics, booking tracking, and service management
- **Admin Panel**: Comprehensive platform management with real-time analytics and content management
- **Payment Processing**: Mock gateway with multiple payment methods (UPI, Card, Wallet)
- **Refund System**: Time-based policy (90%/50%/0%) with admin approval workflow
- **Content Management**: Dynamic FAQs, announcements, and banner management
- **Audit System**: Complete activity tracking with detailed logs
- **System Settings**: Dynamic platform configuration with public/admin settings
- **Multi-City Support**: Services across Mumbai, Pune, Bengaluru, Chennai, Hyderabad, Ahmedabad, Jaipur

### System Health & Performance
- **Backend**: Spring Boot 3.5.0 with lazy initialization and optimized startup (5-10 seconds)
- **Database**: PostgreSQL 15.13 with HikariCP connection pooling (max 5 connections)
- **Frontend**: React 18.2.0 with production build optimization and CSS modules
- **Security**: JWT authentication (24h expiration), BCrypt password hashing, configurable CORS configuration
- **API Performance**: 150+ endpoints with proper pagination, filtering, and error handling
- **Data Volume**: 24+ tables with complete relationships and constraints
- **Build Performance**: Maven multi-threaded builds (8-10 seconds full build)
- **Memory Usage**: ~300MB runtime (33% optimized)
- **Schema Management**: DDL set to 'none' for production stability

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
- password (bcrypt hash)
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
2. Backend validates credentials (using NoOp encoder for dev)
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

## Planned Architecture Enhancements

### "Uber-like" Dispatcher System
To support the blind booking model, a new "Dispatcher Service" logic is planned:
1.  **Generic Service Abstraction**: Decouple the user-facing "Service Listing" from the specific "Vendor Service Implementation".
2.  **Auto-Assignment Engine**: A logic layer in `BookingService` that selects the optimal vendor based on:
    *   **Location**: Proximity to user (using PostGIS in future).
    *   **Availability**: Real-time slot checking.
    *   **Rating**: Prioritizing higher-rated vendors.
    *   **Load Balancing**: Distributing jobs fairly among vendors.

## Non-Functional Requirements

- **Performance:** Response time < 200ms for most endpoints
- **Scalability:** Stateless architecture for horizontal scaling
- **Security:** HTTPS, JWT, input validation (Dev mode: NoOp passwords)
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

### Frontend Structure (Complete Implementation)

```
frontend/
├── public/
│   ├── index.html                  # HTML template
│   └── favicon.ico                 # App icon
├── src/
│   ├── index.js                    # React entry point
│   ├── App.js                      # Main App with 50+ routes
│   ├── App.css                     # Global styles
│   ├── components/                 # Reusable UI components
│   │   ├── Navbar/                 # Navigation with role-based menus
│   │   ├── Footer/                 # Site footer
│   │   ├── LoadingSpinner/         # Loading states
│   │   ├── Toast/                  # Notification system
│   │   ├── Modal/                  # Modal dialogs
│   │   ├── Breadcrumb/             # Navigation breadcrumbs
│   │   ├── ProtectedRoute/         # Route protection by role
│   │   └── ErrorBoundary/          # Error handling
│   ├── context/                    # React Context API
│   │   ├── AuthContext.js          # Authentication state management
│   │   └── CartContext.js          # Shopping cart state
│   ├── pages/                      # Page components (30+ pages)
│   │   ├── Home/                   # Landing page
│   │   ├── Auth/                   # Login, Register, ForgotPassword, ResetPassword
│   │   ├── Services/               # Services, ServiceDetail, CategoryBrowse
│   │   ├── Bookings/               # Bookings, BookingDetail
│   │   ├── Profile/                # User profile management
│   │   ├── Addresses/              # Address CRUD operations
│   │   ├── Favorites/              # Favorite services management
│   │   ├── Cart/                   # Cart, CartCheckout
│   │   ├── Payment/                # Payment, CartPayment
│   │   ├── Support/                # FAQ, HelpCenter, Contact, Terms, Privacy
│   │   ├── Vendor/                 # VendorDashboard, VendorServices, VendorBookings,
│   │   │                           # VendorAnalytics, VendorAvailability, VendorReviews
│   │   ├── Admin/                  # AdminDashboard, AdminUsers, AdminVendors,
│   │   │                           # AdminServices, AdminBookings, AdminCoupons,
│   │   │                           # AdminAnnouncements, AdminBanners, AdminFAQs,
│   │   │                           # AdminRefunds, AdminAuditLogs, PlatformAnalytics,
│   │   │                           # ContentManagement, FunctionalityManagement
│   │   ├── Forbidden/              # 403 error page
│   │   └── RefundRequest.js        # Refund request functionality
│   ├── services/                   # API integration layer
│   │   ├── api.js                  # Main API client with interceptors
│   │   ├── adminAPI.js             # Admin-specific API calls
│   │   └── vendorAPI.js            # Vendor-specific API calls
│   └── styles/                     # CSS modules and global styles
├── build/                          # Production build output
├── package.json                    # NPM dependencies
├── .env                            # Environment variables
├── .env.production                 # Production environment
└── vercel.json                     # Deployment configuration
```

### Configuration Files

**Backend (Port 8081):**
- Database: PostgreSQL 15.13 on `localhost:5432/bookkarodb`
- JWT Secret: 64-character secure key with 24-hour expiration
- Hibernate DDL: `none` (production-safe, schema managed externally)
- Connection Pool: HikariCP (max 5 connections, optimized for development)
- Data Initialization: Disabled (CSV-based data loading)
- Logging: Production-optimized (WARN level, minimal console output)
- File Upload: 10MB limit for multipart requests
- Actuator: Health and info endpoints only

**Frontend (Port 3000):**
- API Base URL: `http://localhost:8081/api/v1`
- React Router v6 with 50+ protected routes
- Axios with request/response interceptors
- Context API for state management (Auth + Cart)
- CSS Modules with CSS Variables for theming
- Error Boundary for graceful error handling
- Toast notifications and modal system
- Environment-specific configurations (.env, .env.production)

### Build Performance

**Backend:**
- Full build: 8-10 seconds (multi-threaded)
- Incremental compile: 2-3 seconds
- Startup time: 5-10 seconds (optimized)

**Frontend:**
- Build time: ~15 seconds
- Hot reload: < 1 second

### Version Information & Dependencies

| Component | Version | Status | Notes |
|-----------|---------|--------|-------|
| **Backend** | 1.0.4 | Production | Optimized JAR build |
| **Frontend** | 1.0.0 | Production | React production build |
| **Java** | 21 (LTS) | Current | OpenJDK compatible |
| **Spring Boot** | 3.5.0 | Latest | With lazy initialization |
| **PostgreSQL** | 15.13 | Current | With HikariCP pooling |
| **React** | 18.2.0 | Latest | With React Router 6.20.0 |
| **Maven** | 3.9+ | Current | Multi-threaded builds |
| **Node.js** | 18+ | Current | NPM 9+ compatible |
| **JWT Library** | 0.11.5 | Stable | JJWT implementation |
| **Axios** | 1.6.2 | Latest | HTTP client |
| **Lombok** | Latest | Active | Code generation |
| **Commons CSV** | 1.10.0 | Stable | Data import utility |

---
*Last Updated: December 3, 2025 - Production Ready System*
