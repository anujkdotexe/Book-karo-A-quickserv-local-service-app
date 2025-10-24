# BOOK-KARO - Local Service Marketplace Platform# BOOK-KARO - Quick Serve Local Service App



> A production-ready, three-tier service marketplace connecting customers with local service providers across multiple cities in India.A production-ready three-tier service marketplace platform connecting customers with local service providers.



[![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)](https://github.com/anujkdotexe/Bookaro-A-quickserv-local-service-app)## Tech Stack

[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)]()

[![License](https://img.shields.io/badge/license-Private-red.svg)]()**Backend:**

- Spring Boot 3.5.0 (Optimized for fast startup)

## 📋 Table of Contents- PostgreSQL 15.13

- JWT Authentication

- [Overview](#overview)- Hibernate/JPA with lazy initialization

- [Tech Stack](#tech-stack)- Maven (Multi-threaded builds)

- [Features](#features)

- [Quick Start](#quick-start)**Frontend:**

- [Documentation](#documentation)- React 18+

- [Deployment](#deployment)- React Router

- [Test Credentials](#test-credentials)- Axios

- [Project Status](#project-status)- CSS Variables (Custom Styling)



---## Performance Highlights



## Overview**Backend Optimization:**

- Startup time: 5-10 seconds (60% faster)

**BOOK-KARO** is a scalable service booking platform enabling seamless connections between customers and local service providers. The platform features a robust three-role system (User, Vendor, Admin) with complete booking lifecycle management, payment processing, and refund workflows.- Multi-threaded compilation (16 cores)

- Memory usage: ~300MB (33% less)

**Key Highlights:**- Cloud-deployment ready

- 🚀 **Optimized Performance**: 5-10 second startup time, 60% faster than standard Spring Boot

- 🏙️ **Multi-City Coverage**: Mumbai, Pune, Delhi, Bangalore, Thane, Navi Mumbai**Build Optimization:**

- 💳 **Complete Payment Flow**: Mock gateway integration with 95% success simulation- Incremental builds: ~3 seconds

- 🔄 **Refund Management**: Time-based policy with admin approval workflow- Full compile: ~7 seconds

- 🔒 **Enterprise Security**: JWT authentication, BCrypt hashing, role-based access control- Parallel Maven builds enabled



---## Features



## Tech Stack**User Authentication**

- Registration with email/password

### Backend- JWT-based login with 24-hour token expiration

- **Framework**: Spring Boot 3.5.0- BCrypt password hashing

- **Database**: PostgreSQL 15.13

- **Security**: Spring Security 6.x + JWT**Profile Management**

- **ORM**: Hibernate/JPA with lazy initialization- View and update personal information

- **Build**: Maven 3.9+ (multi-threaded builds)- Secure profile access

- **Logging**: SLF4J with Logback

**Service Discovery**

### Frontend- Browse all available services

- **Framework**: React 18+- Advanced search with filters (category, city, price range)

- **Routing**: React Router v6- Pagination support

- **HTTP Client**: Axios- Service details with ratings and reviews

- **Styling**: CSS Variables (Custom Design System)

- **State Management**: Context API**Booking System**

- Create bookings with date/time selection

### Performance Optimizations- Automatic price calculation

- Lazy bean initialization (60% startup improvement)- Booking status tracking (PENDING, CONFIRMED, COMPLETED, CANCELLED)

- HikariCP connection pooling- View booking history

- Multi-threaded Maven builds (16 cores)

- Deferred repository bootstrap**Payment Processing**

- Hibernate batch operations- Mock payment gateway simulation (95% success rate)

- Secure payment flow

---- Payment status tracking

- Automatic booking creation on success

## Features

**Refund Management** (NEW)

### 🔐 Authentication & Authorization- Request refunds for eligible bookings

- Multi-role system (USER, VENDOR, ADMIN)- Time-based refund policy (100%, 50%, or 0%)

- JWT-based authentication (24-hour token expiration)- Admin approval/rejection workflow

- BCrypt password hashing- Refund status tracking (PENDING, PROCESSING, COMPLETED, REJECTED)

- Secure session management- Automatic booking cancellation on approval



### 👤 User Management**Favorites**

- Profile creation and management- Add/remove services to favorites

- Multiple address support (HOME, WORK, OTHER)- Quick access to preferred services

- Default address selection

- Password change functionality**Address Management**

- Multiple address support

### 🔍 Service Discovery- Set default address

- Browse 25+ services across 6 cities- Address types (HOME, WORK, OTHER)

- Advanced filters (category, city, price range, rating)

- Real-time search with validation**Review & Rating System**

- Service details with vendor information- Rate services (1-5 stars)

- Write detailed reviews

### 📅 Booking System- View service reviews

- Dynamic time slot generation based on vendor availability

- Date/time selection with validation## Database Schema

- Automatic price calculation

- Status tracking (PENDING, CONFIRMED, COMPLETED, CANCELLED)- **users**: User authentication and profile (9 users: 3 test + 6 vendors)

- Booking history with detailed views- **vendors**: Service provider information (6 regional vendors)

- **services**: Service catalog (25 services across 6 cities)

### 💳 Payment Processing- **bookings**: Customer bookings (30 sample bookings with reviews)

- Mock payment gateway simulation- **payments**: Payment records

- Card validation (expiry, CVV)- **refunds**: Refund requests and status

- Payment status tracking- **reviews**: Service reviews and ratings

- Automatic booking creation on success- **addresses**: User address management

- Payment history- **favorites**: User favorites/wishlist

- **cart_items**: Shopping cart

### 💰 Refund Management- **content**: Public content (FAQ, Help)

- Request refunds for eligible bookings

- Time-based refund policy:**Regional Coverage**: Mumbai, Pune, Delhi, Bangalore, Thane, Navi Mumbai

  - 100% refund (>24 hours before booking)

  - 50% refund (12-24 hours before booking)## Setup Instructions

  - 0% refund (<12 hours before booking)

- Admin approval workflow### Prerequisites

- Automatic booking cancellation- Java 21+

- Node.js 18+

### ⭐ Reviews & Ratings### Prerequisites

- 5-star rating system with visual preview- Java 21+

- Detailed review comments- Node.js 18+

- Service-level aggregated ratings- PostgreSQL 15+

- Review submission post-booking- Maven 3.9+



### ❤️ Favorites & Cart### Quick Start (Development)

- Add/remove services to favorites

- Shopping cart functionality**Option 1: Use the startup script (Recommended)**

- Quick access to preferred services```powershell

# Windows PowerShell

---.\scripts\START_APP.ps1

```

## Quick Start

**Option 2: Manual startup**

### Prerequisites

```bash```bash

Java 21+# Backend (Terminal 1)

Node.js 18+cd backend

PostgreSQL 15+mvn clean package -DskipTests

Maven 3.9+java -jar target/bookkaro-backend-1.0.3.jar

```

# Frontend (Terminal 2)

### Database Setupcd frontend

```sqlnpm install

CREATE DATABASE bookkarodb;npm start

``````



Update `backend/src/main/resources/application.properties`:Backend runs on: `http://localhost:8081/api/v1`  

```propertiesFrontend runs on: `http://localhost:3000`

spring.datasource.url=jdbc:postgresql://localhost:5432/bookkarodb

spring.datasource.username=postgres### Fast Development Builds

spring.datasource.password=your_password

```**Incremental compile (2-3 seconds):**

```bash

### Option 1: Automated Startup (Recommended)cd backend

```powershellmvn compile -DskipTests

# Windows PowerShell```

.\scripts\START_APP.ps1

```**Full rebuild (5-7 seconds):**

```bash

### Option 2: Manual Startupcd backend

mvn clean compile -DskipTests

**Backend (Terminal 1):**```

```bash

cd backend**Create JAR (8-10 seconds):**

mvn clean package -DskipTests```bash

java -jar target/bookkaro-backend-1.0.3.jarcd backend

```.\fast-build.ps1

# OR: mvn clean package -DskipTests

**Frontend (Terminal 2):**```

```bash

cd frontend### Database Configuration

npm install

npm startCreate PostgreSQL database:

``````sql

CREATE DATABASE bookkarodb;

**Access Points:**```

- Backend API: `http://localhost:8081/api/v1`

- Frontend App: `http://localhost:3000`Update `backend/src/main/resources/application.properties`:

```properties

---spring.datasource.url=jdbc:postgresql://localhost:5432/bookkarodb

spring.datasource.username=postgres

## Documentationspring.datasource.password=your_password

```

### Essential Documentation

| Document | Description |## Deployment

|----------|-------------|

| [Quick Start Guide](docs/QUICK_START.md) | Detailed setup and configuration |### Production Build

| [API Documentation](docs/API_DOCUMENTATION.md) | Complete API reference with examples |```bash

| [Architecture](docs/ARCHITECTURE.md) | System architecture and design patterns |# Backend

| [Database Schema](docs/DATABASE_SCHEMA.md) | Database structure and relationships |cd backend

| [Production Checklist](docs/PRODUCTION_READINESS_CHECKLIST.md) | Deployment readiness guide |mvn clean package -DskipTests

| [UI/UX Guidelines](docs/UI_UX_GUIDELINES.md) | Design system and component library |# Output: target/bookkaro-backend-1.0.3.jar



---# Frontend

cd frontend

## Deploymentnpm run build

# Output: build/ directory

### Production Build```



**Backend:**### Environment Variables (Production)

```bash

cd backend**IMPORTANT**: The application uses default values for development. Override these in production:

mvn clean package -DskipTests

# Output: target/bookkaro-backend-1.0.3.jar```bash

```SPRING_PROFILES_ACTIVE=prod

SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/dbname

**Frontend:**SPRING_DATASOURCE_USERNAME=username

```bashSPRING_DATASOURCE_PASSWORD=password  # Default in dev: root (CHANGE THIS!)

cd frontendJWT_SECRET=your-super-secret-256-bit-key  # Default in dev: bookkaroSecretKey2025... (CHANGE THIS!)

npm run buildPORT=8081

# Output: build/ directory```

```

**Security**: Never use default database password or JWT secret in production. Generate a strong JWT secret using:

### Environment Variables```bash

# Generate secure 256-bit secret

**⚠️ CRITICAL**: Override these in production:openssl rand -base64 32

```

```bash

SPRING_PROFILES_ACTIVE=prod### Cloud Deployment

SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/dbname- **Railway/Render**: Auto-detected, just push to Git

SPRING_DATASOURCE_USERNAME=username- **Heroku**: Uses included `Procfile`

SPRING_DATASOURCE_PASSWORD=strong_password_here- **Docker**: See `backend/DEPLOYMENT_OPTIMIZATION.md`

JWT_SECRET=your-256-bit-secret-key- **AWS/GCP/Azure**: Java 21 runtime, 512MB RAM minimum

PORT=8081

```**Startup time**: 5-10 seconds (optimized for cloud)



**Generate Secure JWT Secret:**## Performance Optimizations

```bash

openssl rand -base64 32See detailed guides:

```- `backend/BUILD_OPTIMIZATION.md` - Compilation speed (40-60% faster)

- `backend/DEPLOYMENT_OPTIMIZATION.md` - Startup optimization (60-70% faster)

### Cloud Platforms

- ✅ **Railway/Render**: Auto-detected, push to Git**Key optimizations:**

- ✅ **Heroku**: Uses included `Procfile`- Lazy bean initialization

- ✅ **AWS/GCP/Azure**: Java 21 runtime, 512MB RAM minimum- Deferred repository bootstrap

- ✅ **Docker**: Build and deploy with included configurations- HikariCP connection pooling

- Multi-threaded Maven builds

**Startup Time**: 5-10 seconds (cloud-optimized)- Hibernate batch operations



---## Test Credentials



## Test Credentials- **User**: user@bookkaro.com / password123

- **Vendor**: vendor@bookkaro.com / password123

| Role | Email | Password |- **Admin**: admin@bookkaro.com / admin123

|------|-------|----------|

| User | user@bookkaro.com | password123 |## Project Status

| Vendor | vendor@bookkaro.com | password123 |

| Admin | admin@bookkaro.com | admin123 |**Version**: 1.0.3  

**Status**: Production Ready - Fully Optimized  

---**Last Updated**: October 22, 2025



## Project Status### Completed

- Phase 1 - User Module (All 13 features including refunds)

**Version**: 1.0.3  - Professional SLF4J logging

**Status**: ✅ Production Ready  - Modern UI/UX with consistent styling

**Last Updated**: October 24, 2025- Complete CRUD operations

- JWT authentication & authorization

### Completed Features ✅- Database with 25 services across 6 regional vendors (multi-city)

- [x] User Module (13 features including refunds)- Backend startup optimization (60% faster)

- [x] JWT Authentication & Authorization- Build compilation optimization (40% faster)

- [x] Multi-role system (USER/VENDOR/ADMIN)- Cloud deployment ready

- [x] Payment gateway simulation- Multi-role system (USER/VENDOR/ADMIN)

- [x] Refund management with admin workflow- Payment simulation with mock gateway

- [x] Dynamic vendor availability scheduling- Complete refund management system with admin approval workflow

- [x] Review system with star rating preview

- [x] Breadcrumb navigation### Pending

- [x] Advanced validation (email typo detection, card expiry)- [ ] Phase 2 - Vendor Module Testing

- [x] Performance optimization (60% faster startup)- [ ] Phase 3 - Admin Module Testing

- [x] Build optimization (40% faster compilation)- [ ] Production deployment to cloud

- [x] Cloud deployment ready- [ ] Performance monitoring dashboard



### In Progress 🔄## Documentation

- [ ] Vendor Module comprehensive testing

- [ ] Admin Module comprehensive testing- `README.md` - This file (overview and quick start)

- [ ] Production monitoring dashboard- `QUICK_START.md` - Detailed setup guide

- `STRUCTURE.md` - Professional folder structure and organization

### Planned 📋- `backend/BUILD_OPTIMIZATION.md` - Compilation speed guide

- [ ] Email notifications- `backend/DEPLOYMENT_OPTIMIZATION.md` - Startup optimization guide

- [ ] SMS booking confirmations- `docs/important/` - Complete technical documentation

- [ ] Advanced analytics dashboard  - `API_DOCUMENTATION.md` - All API endpoints

- [ ] Mobile app (React Native)  - `DATABASE_SCHEMA.md` - Database structure

  - `ARCHITECTURE.md` - System architecture

---  - `PRODUCTION_READINESS_CHECKLIST.md` - Deployment checklist



## Development Tools## Security Notes



### Fast Compilation**Development Configuration** (Change for Production):

```bash- Database password: Currently 'root' (use strong password)

# Incremental (2-3 seconds)- JWT secret: Default key (generate 256-bit secret)

cd backend && mvn compile -DskipTests- CORS: Currently allows all origins (restrict to your domain)

- Enable HTTPS/SSL for production

# Full rebuild (5-7 seconds)- Set `SPRING_PROFILES_ACTIVE=prod`

cd backend && mvn clean compile -DskipTests

## API Documentation

# Create JAR (8-10 seconds)

cd backend && .\fast-build.ps1See `docs/important/API_DOCUMENTATION.md` for complete API reference.

```

## Contributing

### Performance Features

- **Multi-threaded builds**: Utilizes all 16 CPU coresThis is a private project. Contact the repository owner for collaboration.

- **Lazy initialization**: Beans created on-demand

- **Connection pooling**: HikariCP optimized for cloud## License

- **Batch operations**: Hibernate batch inserts/updates

Private - All Rights Reserved

---

## Security Notes

### Development vs. Production

**Development (Current):**
- Database password: `root`
- JWT secret: Default key
- CORS: Allows all origins
- HTTP only

**Production (Required):**
- ✅ Strong database password (16+ characters)
- ✅ 256-bit JWT secret (generated)
- ✅ CORS restricted to your domain
- ✅ HTTPS/SSL enabled
- ✅ `SPRING_PROFILES_ACTIVE=prod`
- ✅ Environment-based secrets management

---

## Contributing

This is a private project. For collaboration inquiries, contact the repository owner.

---

## License

**Private - All Rights Reserved**

Copyright © 2025 Book-Karo. All rights reserved.

---

## Support

For technical support or questions:
- **Repository**: [Bookaro-A-quickserv-local-service-app](https://github.com/anujkdotexe/Bookaro-A-quickserv-local-service-app)
- **Issues**: GitHub Issues
- **Owner**: [@anujkdotexe](https://github.com/anujkdotexe)

---

**Built with ❤️ using Spring Boot & React**
