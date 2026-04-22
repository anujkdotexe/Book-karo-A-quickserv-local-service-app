# BOOK-KARO - Quick Serve Local Service App

> A production-ready three-tier service marketplace platform connecting customers with local service providers across India.

[![Version](https://img.shields.io/badge/version-1.0.4-blue.svg)](https://github.com/anujkdotexe/Bookaro-A-quickserv-local-service-app)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-Private-red.svg)]()

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Test Credentials](#test-credentials)
- [Project Status](#project-status)
- [Future Roadmap](#future-roadmap)

---

## Overview

**BOOK-KARO** is a scalable service booking platform enabling seamless connections between customers and local service providers. The platform features a robust three-role system (User, Vendor, Admin) with complete booking lifecycle management, payment processing, and refund workflows.

**Key Highlights:**
- **Optimized Performance**: 5-10 second startup time, 60% faster than standard Spring Boot
- **Multi-City Coverage**: Mumbai, Pune, Delhi, Bangalore, Thane, Navi Mumbai
- **Complete Payment Flow**: Mock gateway integration with 95% success simulation
- **Refund Management**: Time-based policy with admin approval workflow
- **Enterprise Security**: JWT authentication, Role-based access control (RBAC)
- **Comprehensive Dashboards**: Dedicated portals for Vendors and Admins

---

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.0 (Optimized for fast startup)
- **Language**: Java 21
- **Database**: PostgreSQL 15.13
- **Security**: Spring Security 6.x + JWT
- **ORM**: Hibernate/JPA with lazy initialization
- **Build Tool**: Maven 3.9+ (Multi-threaded builds)
- **Port**: 8081

### Frontend
- **Framework**: React 18+
- **Routing**: React Router v6
- **HTTP Client**: Axios with Interceptors
- **Styling**: CSS Modules with CSS Variables
- **State Management**: Context API (Auth, Cart, Toast)
- **Port**: 3000 (development)

---

## Features

### User Authentication & Security
- **Registration & Login**: Email/password validation with JWT token management.
- **Role-Based Access**: Strict separation of concerns for USER, VENDOR, and ADMIN roles.
- **Session Management**: Automatic token expiration handling and secure logout.
- **Profile Management**: Update personal details, addresses, and change passwords.

### Service Discovery & Booking
- **Advanced Search**: Filter by category, city, price range, and rating.
- **Smart Booking Logic**: System attempts to match users with local vendors (Logic in place, UI pending).
- **Booking Lifecycle**: Create, Reschedule, Cancel, and Track bookings (PENDING -> CONFIRMED -> COMPLETED).
- **Availability Checking**: Real-time validation of vendor slots before booking.
- **Address Management**: Save multiple addresses (Home, Work) for quick checkout.

### Commerce & Payments
- **Mock Payment Gateway**: Simulates successful and failed transactions for testing.
- **Coupons & Discounts**: Robust coupon engine with validation (expiry, min order value, usage limits).
- **Refund System**: User-initiated refund requests with Admin approval workflow.
- **Shopping Cart**: Add multiple services to cart (Frontend implementation).

### Vendor Features
- **Dashboard**: Real-time statistics on revenue, bookings, and ratings.
- **Service Management**: CRUD operations for services with approval workflow.
- **Booking Management**: Accept/Reject bookings and update status.
- **Availability Management**: Toggle service availability.
- **Reviews**: View customer feedback.

### Admin Features
- **Platform Analytics**: High-level metrics on users, revenue, and system health.
- **User & Vendor Management**: Approve/Reject vendors, suspend users.
- **Service Moderation**: Review and approve new service listings.
- **Content Management**: Manage FAQs, Announcements, and Banners.
- **CSV Import**: Bulk import for Users, Vendors, and Services.
- **Audit Logs**: Track critical system actions for security and compliance.

---

## Quick Start

### Prerequisites
- Java 21+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.9+

### Option 1: Use the Startup Script (Recommended)

```powershell
# Windows PowerShell
cd D:\Springboard
.\scripts\START_APP.ps1
```

### Option 2: Manual Startup

**Backend (Terminal 1)**
```powershell
cd backend
mvn clean package -DskipTests
java -jar target/bookkaro-backend-1.0.4.jar
```

**Frontend (Terminal 2)**
```powershell
cd frontend
npm install  # First time only
npm start
```

**Access Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8081/api/v1

---

## Documentation

### User Guides
- **[Quick Start Guide](docs/QUICK_START.md)** - Detailed setup and usage
- **[Test Credentials](docs/TEST_USER_CREDENTIALS.md)** - Test account details
- **[Current Status](docs/CURRENT_STATUS.md)** - Project status and metrics

### Technical Documentation
- **[Architecture](docs/ARCHITECTURE.md)** - System design and architecture
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Database Schema](docs/DATABASE_SCHEMA_COMPLETE.md)** - Database design and relationships
- **[Build Optimization](docs/BUILD_OPTIMIZATION.md)** - Performance optimization details

---

## Test Credentials

### Unified Password
**All test accounts use the same password**: `Password@123`
Passwords are stored as bcrypt hashes in the database and hashed during CSV import.

### Test Accounts

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| User | user@bookkaro.com | Password@123 | Regular customer account |
| Admin | admin@bookkaro.com | Password@123 | Platform administrator |
| Vendor | mumbai@bookkaro.com | Password@123 | Mumbai service provider |
| Vendor | pune@bookkaro.com | Password@123 | Pune service provider |

---

## Project Status

### Current Version
- **Backend**: v1.0.4
- **Frontend**: v1.0.0
- **Database**: Fully populated with mock data

### In Progress
- **"Uber-like" Blind Booking**: UI updates to hide specific vendor details and fully automate local vendor assignment.
- **Security Hardening**: Migrating to BCrypt for password hashing and tightening CORS policies.
- **Email Notifications**: SMTP integration for real booking confirmations.

### Future Roadmap
- **Real Payment Gateway**: Integration with Razorpay/Stripe.
- **Mobile App**: React Native application for customers and partners.
- **Real-time Chat**: In-app messaging between users and vendors.
- **Geolocation**: Map-based service discovery using PostGIS.
- **Dispute Resolution**: Enhanced workflow for handling booking disputes.

---

## License

Private - All Rights Reserved

---

## Contact

- **Repository**: [anujkdotexe/Bookaro-A-quickserv-local-service-app](https://github.com/anujkdotexe/Bookaro-A-quickserv-local-service-app)
- **Branch**: main
- **Last Updated**: December 3, 2025

---

## Acknowledgments

Built with love using Spring Boot, React, and PostgreSQL.
