# BOOK-KARO API Documentation

## Base URL
```
http://localhost:8081/api/v1
```

## Authentication
All endpoints except `/auth/register` and `/auth/login` require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Phase 1 - User Module Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001"
}

Response 201 Created:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200 OK:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    }
  }
}
```

### User Profile

#### Get Profile
```http
GET /api/v1/users/profile
Authorization: Bearer <token>

Response 200 OK:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001"
  }
}
```

#### Update Profile
```http
PUT /api/v1/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "456 Oak Ave",
  "city": "New York",
  "state": "NY",
  "postalCode": "10002"
}

Response 200 OK:
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

### Service Search

#### Search Services
```http
GET /api/v1/services/search?category=plumbing&city=New York&page=0&size=10
Authorization: Bearer <token>

Response 200 OK:
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "serviceName": "Professional Plumbing",
        "description": "Expert plumbing services",
        "category": "Plumbing",
        "price": 75.00,
        "duration": 60,
        "vendor": {
          "id": 2,
          "firstName": "Jane",
          "lastName": "Smith",
          "rating": 4.8
        }
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

#### Get Service Details
```http
GET /api/v1/services/1
Authorization: Bearer <token>

Response 200 OK:
{
  "success": true,
  "data": {
    "id": 1,
    "serviceName": "Professional Plumbing",
    "description": "Expert plumbing services for residential and commercial properties",
    "category": "Plumbing",
    "price": 75.00,
    "duration": 60,
    "vendor": {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "phone": "+1234567891",
      "rating": 4.8,
      "totalReviews": 45
    },
    "reviews": [...]
  }
}
```

### Bookings

#### Create Booking
```http
POST /api/v1/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceId": 1,
  "bookingDate": "2025-10-20",
  "bookingTime": "10:00:00",
  "notes": "Please bring necessary tools"
}

Response 201 Created:
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "serviceId": 1,
    "bookingDate": "2025-10-20",
    "bookingTime": "10:00:00",
    "status": "PENDING",
    "totalAmount": 75.00
  }
}
```

#### Get User Bookings
```http
GET /api/v1/bookings/my-bookings?page=0&size=10
Authorization: Bearer <token>

Response 200 OK:
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "service": {
          "id": 1,
          "serviceName": "Professional Plumbing"
        },
        "vendor": {
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "bookingDate": "2025-10-20",
        "bookingTime": "10:00:00",
        "status": "CONFIRMED",
        "totalAmount": 75.00
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1
  }
}
```

#### Get Booking Details
```http
GET /api/v1/bookings/1
Authorization: Bearer <token>

Response 200 OK:
{
  "success": true,
  "data": {
    "id": 1,
    "service": { ... },
    "vendor": { ... },
    "bookingDate": "2025-10-20",
    "bookingTime": "10:00:00",
    "status": "CONFIRMED",
    "totalAmount": 75.00,
    "notes": "Please bring necessary tools",
    "createdAt": "2025-10-15T10:30:00"
  }
}
```

### Reviews

#### Create Review
```http
POST /api/v1/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": 1,
  "rating": 5,
  "comment": "Excellent service! Very professional and quick."
}

Response 201 Created:
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": 1,
    "rating": 5,
    "comment": "Excellent service! Very professional and quick.",
    "createdAt": "2025-10-21T14:30:00"
  }
}
```

#### Get Service Reviews
```http
GET /api/v1/reviews/service/1?page=0&size=10
Authorization: Bearer <token>

Response 200 OK:
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Excellent service! Very professional and quick.",
        "user": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2025-10-21T14:30:00"
      }
    ],
    "averageRating": 4.8,
    "totalReviews": 45
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ],
  "timestamp": "2025-10-15T10:30:00"
}
```

### Common HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---
Last Updated: October 22, 2025
# BOOK-KARO - Service Marketplace Platform

## Overview
BOOK-KARO is a robust, scalable, and production-ready web application for a service marketplace platform. It connects customers with service providers, enabling seamless service discovery, booking, and reviews.

## Project Structure
```
BOOK-KARO/
├── backend/          # Spring Boot REST API
├── frontend/         # React application
├── docs/             # Project documentation
└── README.md
```

## Technology Stack
- **Backend:** Java 21, Spring Boot 3.5.0, Spring Security, Hibernate (JPA), PostgreSQL 15.13
- **Frontend:** React 18+, React Router, Axios
- **Authentication:** JWT with Spring Security
- **Database:** PostgreSQL

## Current Phase
Phase 1 - User Module (Customer Side) - Production Ready

## Getting Started
See `/docs/important` folder for detailed setup and API documentation.

## Brand Colors
- Deep Navy Blue: `#1e3a8a`
- Bright Royal Blue: `#2563eb`
- White: `#ffffff`
- Light Gray: `#f3f4f6`

