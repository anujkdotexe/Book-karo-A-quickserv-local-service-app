# BOOK-KARO - Project Structure

## Overview

This document describes the professional folder structure of the BOOK-KARO project, organized for maintainability, scalability, and clarity.

---

## Root Directory Structure

```
BOOK-KARO/
├── backend/                 # Spring Boot backend application
├── frontend/                # React frontend application
├── docs/                    # Project documentation
│   ├── important/          # Production documentation (API, architecture, schema)
│   └── archive/            # Historical documentation and session summaries
├── scripts/                 # Utility scripts for development
│   ├── database/           # Database utility scripts (SQL files)
│   ├── START_APP.ps1       # Automated startup script
│   └── test_login_all_roles.ps1  # Authentication testing script
├── csv-templates/           # CSV templates for data import
├── mcp/                     # Model Context Protocol integration
├── project/                 # Project-specific resources
├── .github/                 # GitHub workflows and configurations
├── .vscode/                 # VS Code workspace settings
├── README.md                # Main project documentation
├── QUICK_START.md           # Quick start guide for developers
├── QUICK_START_CHECKLIST.md # Step-by-step setup checklist
├── STRUCTURE.md             # This file - project structure guide
├── LICENSE                  # Project license
└── Configuration Files      # (Procfile, vercel.json, railway.json, etc.)
```

---

## Backend Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── bookkaro/
│   │   │           ├── bookkaroApplication.java    # Main Spring Boot application
│   │   │           ├── config/                    # Configuration classes
│   │   │           │   ├── SecurityConfig.java   # Spring Security & JWT
│   │   │           │   ├── CorsConfig.java       # CORS configuration
│   │   │           │   ├── DataInitializer.java  # Test data loader (@Order 1)
│   │   │           │   └── ComprehensiveDataInitializer.java  # Regional vendors (@Order 3)
│   │   │           ├── controller/                # REST API endpoints
│   │   │           │   ├── AuthController.java   # Authentication endpoints
│   │   │           │   ├── UserController.java   # User profile management
│   │   │           │   ├── ServiceController.java # Service browsing
│   │   │           │   ├── BookingController.java # Booking management
│   │   │           │   ├── RefundController.java # Refund management
│   │   │           │   ├── ReviewController.java # Reviews & ratings
│   │   │           │   ├── AddressController.java # Address management
│   │   │           │   ├── FavoriteController.java # Favorites/wishlist
│   │   │           │   ├── CartController.java   # Shopping cart
│   │   │           │   └── AdminController.java  # Admin operations
│   │   │           ├── service/                   # Business logic layer
│   │   │           │   ├── AuthService.java      # Authentication service
│   │   │           │   ├── UserService.java      # User management
│   │   │           │   ├── ServiceService.java   # Service management
│   │   │           │   ├── BookingService.java   # Booking logic
│   │   │           │   ├── RefundService.java    # Refund processing
│   │   │           │   ├── PaymentService.java   # Payment processing
│   │   │           │   ├── MockPaymentGateway.java # Payment simulation
│   │   │           │   └── ...
│   │   │           ├── repository/                # Data access layer (JPA)
│   │   │           │   ├── UserRepository.java
│   │   │           │   ├── VendorRepository.java
│   │   │           │   ├── ServiceRepository.java
│   │   │           │   ├── BookingRepository.java
│   │   │           │   ├── RefundRepository.java
│   │   │           │   └── ...
│   │   │           ├── model/                     # Entity classes (JPA entities)
│   │   │           │   ├── User.java             # User entity
│   │   │           │   ├── Vendor.java           # Vendor entity
│   │   │           │   ├── Service.java          # Service entity
│   │   │           │   ├── Booking.java          # Booking entity
│   │   │           │   ├── Refund.java           # Refund entity
│   │   │           │   ├── Review.java           # Review entity
│   │   │           │   ├── Address.java          # Address entity
│   │   │           │   └── ...
│   │   │           ├── dto/                       # Data Transfer Objects
│   │   │           │   ├── LoginRequest.java     # Request DTOs
│   │   │           │   ├── RegisterRequest.java
│   │   │           │   ├── AuthResponse.java     # Response DTOs
│   │   │           │   ├── ServiceDto.java
│   │   │           │   └── ...
│   │   │           ├── security/                  # Security components
│   │   │           │   ├── JwtUtil.java          # JWT token utilities
│   │   │           │   ├── JwtAuthenticationFilter.java  # JWT filter
│   │   │           │   └── CustomUserDetailsService.java
│   │   │           ├── exception/                 # Custom exceptions
│   │   │           │   ├── GlobalExceptionHandler.java
│   │   │           │   ├── ResourceNotFoundException.java
│   │   │           │   └── ...
│   │   │           └── util/                      # Utility classes
│   │   │               └── ApiResponse.java      # Standard API response wrapper
│   │   └── resources/
│   │       ├── application.properties            # Main configuration
│   │       ├── application-prod.properties       # Production profile
│   │       ├── application-postgres.properties   # PostgreSQL profile
│   │       └── db/
│   │           └── migration/                    # Database migrations
│   └── test/                                     # Unit and integration tests
├── target/                                       # Build output directory
│   ├── bookkaro-backend-1.0.4.jar                # Compiled JAR file (50 MB)
│   └── classes/                                  # Compiled class files
├── pom.xml                                       # Maven configuration
├── fast-build.ps1                                # Fast build script (8-10s)
├── quick-compile.ps1                             # Incremental compile (2-3s)
├── cleanup_database.sql                          # Database cleanup utility
├── BUILD_OPTIMIZATION.md                         # Build performance guide
└── DEPLOYMENT_OPTIMIZATION.md                    # Startup optimization guide
```

---

## Frontend Structure

```
frontend/
├── public/
│   └── index.html                  # HTML template
├── src/
│   ├── index.js                    # React entry point
│   ├── App.js                      # Main App component
│   ├── index.css                   # Global styles
│   ├── App.css                     # App-specific styles
│   ├── components/                 # Reusable UI components
│   │   ├── Navbar/
│   │   │   ├── Navbar.js
│   │   │   └── Navbar.css
│   │   ├── Footer/
│   │   │   ├── Footer.js
│   │   │   └── Footer.css
│   │   ├── LoadingSpinner/
│   │   │   ├── LoadingSpinner.js
│   │   │   └── LoadingSpinner.css
│   │   ├── Toast/
│   │   │   ├── Toast.js
│   │   │   └── Toast.css
│   │   └── ProtectedRoute/
│   │       └── ProtectedRoute.js
│   ├── context/                    # React Context API
│   │   ├── AuthContext.js          # Authentication state
│   │   └── ToastContext.js         # Toast notifications
│   ├── pages/                      # Page components
│   │   ├── Home/
│   │   │   ├── Home.js
│   │   │   └── Home.css
│   │   ├── Login/
│   │   │   ├── Login.js
│   │   │   └── Login.css
│   │   ├── Register/
│   │   │   ├── Register.js
│   │   │   └── Register.css
│   │   ├── Services/
│   │   │   ├── Services.js
│   │   │   └── Services.css
│   │   ├── ServiceDetail/
│   │   │   ├── ServiceDetail.js
│   │   │   └── ServiceDetail.css
│   │   ├── Bookings/
│   │   │   ├── Bookings.js
│   │   │   └── Bookings.css
│   │   ├── RefundRequest/
│   │   │   ├── RefundRequest.js
│   │   │   └── RefundRequest.css
│   │   ├── AdminRefunds/
│   │   │   ├── AdminRefunds.js
│   │   │   └── AdminRefunds.css
│   │   ├── Profile/
│   │   │   ├── Profile.js
│   │   │   └── Profile.css
│   │   ├── Addresses/
│   │   │   ├── Addresses.js
│   │   │   └── Addresses.css
│   │   ├── Favorites/
│   │   │   ├── Favorites.js
│   │   │   └── Favorites.css
│   │   └── ...
│   └── services/                   # API integration layer
│       └── api.js                  # Axios instance & API endpoints
├── build/                          # Production build output
├── package.json                    # NPM configuration
└── vercel-build.sh                 # Vercel build script
```

---

## Documentation Structure

```
docs/
├── important/                      # Production documentation (tracked in Git)
│   ├── README.md                  # Documentation overview
│   ├── API_DOCUMENTATION.md       # Complete API reference (389 lines)
│   ├── ARCHITECTURE.md            # System architecture (139 lines)
│   ├── DATABASE_SCHEMA.md         # Database schema documentation (171 lines)
│   ├── PRODUCTION_READINESS_CHECKLIST.md  # Deployment checklist (332 lines)
│   ├── PRD_bookkaro_COMPLETE.md    # Complete Product Requirements Document (801 lines)
│   ├── PRD_User_Module.md         # User Module PRD
│   └── PRD_IMPLEMENTATION_CHECKLIST.md  # Implementation tracking
└── archive/                        # Historical documentation (not in production)
    ├── SESSION_SUMMARY.md          # Development session summaries
    ├── PROJECT_STATUS_COMPREHENSIVE.md  # Detailed status reports
    ├── REFUND_IMPLEMENTATION_COMPLETE.md  # Feature implementation reports
    ├── READY_FOR_TESTING.md        # Testing documentation
    ├── DOCUMENTATION_CORRECTIONS.md  # Documentation updates
    ├── TESTING_GUIDE.md            # Test case documentation
    ├── IMPLEMENTATION_SUMMARY.md   # Implementation summaries
    ├── PHASE_1_COMPLETION_REPORT.md  # Phase completion reports
    └── ... (other historical docs)
```

---

## Scripts Structure

```
scripts/
├── START_APP.ps1                   # Automated startup (starts backend + frontend)
├── test_login_all_roles.ps1        # Test authentication for all user roles
└── database/
    └── reset_user_account.sql      # Reset user account utility
```

---

## Key Files & Their Purpose

### Root Level
| File | Purpose |
|------|---------|
| `README.md` | Main project overview, quick start, features, deployment |
| `QUICK_START.md` | Detailed setup guide with performance tips |
| `QUICK_START_CHECKLIST.md` | Step-by-step content management setup |
| `STRUCTURE.md` | This file - project structure documentation |
| `LICENSE` | MIT License |
| `.gitignore` | Git ignore rules |
| `Procfile` | Heroku deployment configuration |
| `railway.json` | Railway deployment configuration |
| `vercel.json` | Vercel deployment configuration |
| `nixpacks.toml` | Nixpacks build configuration |

### Backend Key Files
| File | Purpose |
|------|---------|
| `pom.xml` | Maven project configuration (Java 21, Spring Boot 3.5.0) |
| `application.properties` | Main configuration (port 8081, PostgreSQL, JWT) |
| `SecurityConfig.java` | Spring Security + JWT setup + CORS |
| `bookkaroApplication.java` | Main Spring Boot application class |
| `ApiResponse.java` | Standard API response wrapper |
| `GlobalExceptionHandler.java` | Centralized exception handling |

### Frontend Key Files
| File | Purpose |
|------|---------|
| `package.json` | NPM dependencies (React 18, React Router, Axios) |
| `api.js` | Axios instance with JWT interceptor + all API endpoints |
| `AuthContext.js` | Global authentication state management |
| `App.js` | Main React component with routing |

---

## Configuration Files

### Backend Configuration
- **Port**: 8081 (configurable via `PORT` environment variable)
- **Context Path**: `/api/v1`
- **Database**: PostgreSQL 15.13 on `localhost:5432/bookkarodb`
- **JWT Expiration**: 24 hours (86400000 ms)
- **Hibernate DDL**: `update` (development), `validate` (production)

### Frontend Configuration
- **Port**: 3000 (React default)
- **API Base URL**: `http://localhost:8081/api/v1`
- **Proxy**: Not used (direct API calls with CORS)

---

## Build Artifacts

### Backend
- **JAR File**: `backend/target/bookkaro-backend-1.0.3.jar` (50 MB)
- **Build Time**: 8-10 seconds (full build), 2-3 seconds (incremental)
- **Startup Time**: 5-10 seconds (optimized)

### Frontend
- **Build Output**: `frontend/build/` directory
- **Build Time**: ~15 seconds
- **Production Assets**: Static HTML, CSS, JS files

---

## Database Schema

**Database Name**: `bookkarodb`  
**Tables** (12 total):
- `users` - User accounts (9 users)
- `vendors` - Service vendors (6 regional vendors)
- `services` - Service catalog (25 services)
- `bookings` - Customer bookings (30 sample bookings)
- `payments` - Payment records
- `refunds` - Refund requests
- `reviews` - Service reviews and ratings
- `addresses` - User address management
- `favorites` - User favorites/wishlist
- `cart_items` - Shopping cart
- `content` - Public content (FAQ, Help)
- `wallets` - User wallet balances

---

## Data Initialization

**Automatic on First Startup**:
1. **DataInitializer** (@Order 1): Creates 3 test user accounts
2. **ComprehensiveDataInitializer** (@Order 3): Creates 6 regional vendors + 25 services
3. **BookingReviewInitializer** (@Order 3): Creates 30 sample bookings with reviews

**Regional Coverage**: Mumbai, Pune, Delhi, Bangalore, Thane, Navi Mumbai

---

## Version Information

| Component | Version |
|-----------|---------|
| **Java** | 21 (LTS) |
| **Spring Boot** | 3.5.0 |
| **PostgreSQL** | 15.13 |
| **React** | 18.2.0 |
| **Maven** | 3.9+ |
| **Node.js** | 18+ |
| **Backend Version** | 1.0.3 |
| **Frontend Version** | 1.0.0 |

---

## Environment Setup

### Development
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

### Production
```bash
# Set environment variables
export SPRING_PROFILES_ACTIVE=prod
export SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/dbname
export SPRING_DATASOURCE_PASSWORD=secure_password
export JWT_SECRET=256_bit_secret_key

# Deploy JAR
java -jar bookkaro-backend-1.0.3.jar
```

---

## Testing

### Test Credentials
| Role | Email | Password |
|------|-------|----------|
| User | user@bookkaro.com | password123 |
| Vendor | vendor@bookkaro.com | password123 |
| Admin | admin@bookkaro.com | admin123 |

### Regional Vendor Accounts (6 cities)
| City | Email | Password | Services |
|------|-------|----------|----------|
| Mumbai | mumbai@bookkaro.com | vendor123 | 5 services |
| Pune | pune@bookkaro.com | vendor123 | 4 services |
| Delhi | delhi@bookkaro.com | vendor123 | 5 services |
| Bangalore | bangalore@bookkaro.com | vendor123 | 4 services |
| Thane | thane@bookkaro.com | vendor123 | 2 services |
| Navi Mumbai | navimumbai@bookkaro.com | vendor123 | 5 services |

---

## Professional Standards

### Code Organization
- Clear separation of concerns (Controller → Service → Repository)
- RESTful API design with consistent endpoints
- DTO pattern (no entity exposure in APIs)
- Global exception handling
- Centralized API response format

### Security
- JWT-based authentication
- BCrypt password encryption
- Role-based access control (USER, VENDOR, ADMIN)
- CORS configuration
- Input validation with `@Valid` annotations

### Performance
- Lazy bean initialization
- HikariCP connection pooling
- Multi-threaded Maven builds
- Optimized logging levels
- Production-ready startup time (5-10s)

### Maintainability
- Comprehensive documentation
- Consistent naming conventions
- JavaDoc for public APIs
- Professional folder structure
- Version-controlled configuration

---

## Future Enhancements

### Planned Features
- [ ] Phase 2: Vendor Module (dashboard, service management, booking acceptance)
- [ ] Phase 3: Admin Module (user/vendor approval, platform analytics)
- [ ] Real payment gateway integration (Stripe/Razorpay)
- [ ] Email notifications (booking confirmations, refund updates)
- [ ] SMS notifications for booking reminders
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

---

## Additional Resources

- **API Documentation**: `docs/important/API_DOCUMENTATION.md`
- **Architecture Guide**: `docs/important/ARCHITECTURE.md`
- **Database Schema**: `docs/important/DATABASE_SCHEMA.md`
- **Production Checklist**: `docs/important/PRODUCTION_READINESS_CHECKLIST.md`
- **Build Optimization**: `backend/BUILD_OPTIMIZATION.md`
- **Deployment Guide**: `backend/DEPLOYMENT_OPTIMIZATION.md`

---

**Last Updated**: October 22, 2025
**Version**: 1.0.4
