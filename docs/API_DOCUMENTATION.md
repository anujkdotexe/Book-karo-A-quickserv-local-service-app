# BOOK-KARO API Documentation

**Last Updated:** December 3, 2025  
**Backend Version:** 1.0.4  
**Frontend Version:** 1.0.0  
**Status:** Production Ready (Dev Configuration)  
**API Endpoints:** 150+ with complete CRUD operations  
**Recent Updates:** All major bug fixes applied, system fully operational

## Base URL
```
http://localhost:8081/api/v1
```

## Authentication
All endpoints except `/auth/register` and `/auth/login` require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

**Test Credentials:**
- Admin: `admin@bookkaro.com` / `Password@123`
- User: `user@bookkaro.com` / `Password@123`
- Vendor: `mumbai@bookkaro.com` / `Password@123`

> **Note:** The system now uses bcrypt password hashing. Seed passwords are imported as hashes, and the allowed frontend origin is configured via `FRONTEND_URL`.

---

## Phase 1 - User Module Endpoints

### System Capabilities (December 3, 2025)
- **Complete Service Marketplace:** 580 services across 6 categories with advanced filtering
- **Multi-Role System:** USER, VENDOR, ADMIN with role-based access control
- **Booking Lifecycle:** Complete booking management with status tracking
- **Address System:** Multiple address types (HOME, WORK, OFFICE, OTHER) with validation
- **Review System:** 762+ authentic reviews with 5-star rating system
- **Payment Integration:** Mock gateway with multiple payment methods
- **Admin Panel:** Comprehensive platform management with analytics
- **Vendor Dashboard:** Complete business management tools
- **Content Management:** Dynamic FAQs, announcements, and banners
- **Audit System:** Complete activity tracking and logging

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
    "totalReviews": 12,
    "totalPages": 2,
    "currentPage": 0
  }
}
```

---

## Service & Category Endpoints

### Get All Categories
```http
GET /api/v1/services/categories

Response 200 OK:
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    "Electrical",
    "Home Services", 
    "IT & Software",
    "Logistics",
    "Painting",
    "Plumbing"
  ]
}
```

### Get All Services
```http
GET /api/v1/services?page=0&size=10&category=Plumbing&city=Mumbai&sortBy=averageRating&sortDir=desc

Response 200 OK:
{
  "success": true,
  "message": "Services retrieved successfully", 
  "data": {
    "content": [
      {
        "id": 1,
        "serviceName": "Professional Plumbing Service",
        "description": "Complete plumbing solutions",
        "category": "Plumbing",
        "price": 500.00,
        "priceCurrency": "INR",
        "averageRating": 4.5,
        "totalReviews": 23,
        "vendor": {
          "id": 1,
          "businessName": "Mumbai Plumbers",
          "location": "Mumbai"
        }
      }
    ],
    "totalElements": 70,
    "totalPages": 7,
    "currentPage": 0,
    "pageSize": 10
  }
}
```

### Search Services with Filters
```http
GET /api/v1/services?keyword=plumbing&category=Plumbing&city=Mumbai&minPrice=100&maxPrice=1000&page=0&size=10

Parameters:
- keyword (optional): Search term for service name/description
- category (optional): Filter by category name  
- city (optional): Filter by city
- location (optional): Filter by specific location/area
- minPrice (optional): Minimum price filter (≥ 0)
- maxPrice (optional): Maximum price filter (≥ 0) 
- minRating (optional): Minimum rating filter (0-5)
- page (default: 0): Page number (≥ 0)
- size (default: 20): Page size (≥ 1)
- sortBy (default: "averageRating"): Sort field
- sortDir (default: "desc"): Sort direction (asc/desc)

Response: Same as Get All Services
```

---

## Favorites Management

### Add to Favorites
```http
POST /api/v1/favorites/{serviceId}
Authorization: Bearer <token>

Response 200 OK:
{
  "success": true,
  "message": "Service added to favorites",
  "data": {
    "id": 1,
    "serviceName": "Professional Plumbing Service",
    "category": "Plumbing"
  }
}

Note: Adding duplicate favorites returns 200 OK (idempotent operation)
```

### Remove from Favorites  
```http
DELETE /api/v1/favorites/{serviceId}
Authorization: Bearer <token>

Response 200 OK:
{
  "success": true,
  "message": "Service removed from favorites"
}
```

### Get User Favorites
```http
GET /api/v1/favorites
Authorization: Bearer <token>

Response 200 OK:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "serviceName": "Professional Plumbing Service",
      "category": "Plumbing",
      "price": 500.00,
      "averageRating": 4.5
    }
  ]
}
```

---

## Address Management

### Create Address
```http
POST /api/v1/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "addressType": "OFFICE",
  "addressLine1": "Suite 501, Tech Park Building",
  "addressLine2": "Block A, IT Complex",
  "city": "Mumbai",
  "state": "Maharashtra", 
  "postalCode": "400001",
  "country": "India",
  "landmark": "Near Metro Station",
  "isDefault": false
}

Response 201 Created:
{
  "success": true,
  "message": "Address created successfully",
  "data": {
    "id": 227,
    "addressType": "OFFICE",
    "addressLine1": "Suite 501, Tech Park Building",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "isDefault": false
  }
}

Address Types: HOME, WORK, OFFICE, OTHER
```

### Get User Addresses
```http
GET /api/v1/addresses
Authorization: Bearer <token>

Response 200 OK:
{
  "success": true,
  "data": [
    {
      "id": 227,
      "addressType": "OFFICE",
      "addressLine1": "Suite 501, Tech Park Building",
      "city": "Mumbai",
      "isDefault": false
    }
  ]
}
```

---

## Planned API Enhancements

### Blind Booking / Auto-Assignment
**Goal:** Hide specific vendor details and auto-assign local vendors.

#### 1. Generic Service Listing
**Endpoint:** `GET /api/v1/services/generic`
**Description:** Returns generic service categories (e.g., "Standard Plumbing") without vendor info.
**Response:**
```json
{
  "id": "generic-plumbing",
  "name": "Standard Plumbing Service",
  "basePrice": 500.00
}
```

#### 2. Auto-Assign Booking
**Endpoint:** `POST /api/v1/bookings/auto-assign`
**Description:** Creates a booking for a generic service. System automatically selects the best available vendor in the user's city.
**Body:**
```json
{
  "genericServiceId": "generic-plumbing",
  "addressId": 123,
  "scheduledTime": "..."
}
```

---

## Error Handling & Validation

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2025-12-01T10:30:00Z",
  "path": "/api/v1/endpoint"
}
```

### HTTP Status Codes
- **200 OK**: Request successful
- **201 Created**: Resource created successfully  
- **400 Bad Request**: Invalid request parameters/validation errors
- **401 Unauthorized**: Authentication required or invalid token
- **403 Forbidden**: Access denied for the resource
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists (handled gracefully for favorites)
- **500 Internal Server Error**: Unexpected server error

### Common Validation Errors
```json
// Invalid pagination parameters
{
  "success": false,
  "message": "Page number must be 0 or greater",
  "timestamp": "2025-12-01T10:30:00Z",
  "path": "/api/v1/services"
}

// Invalid price range
{
  "success": false,
  "message": "Price range is invalid. Minimum price: 0, Maximum price: 0",
  "timestamp": "2025-12-01T10:30:00Z",
  "path": "/api/v1/services"
}

// Authentication required
{
  "success": false,
  "message": "Authorization header is missing",
  "timestamp": "2025-12-01T10:30:00Z",
  "path": "/api/v1/favorites"
}
```

### Frontend Integration Notes

#### Category Dropdown Fix
The categories endpoint now returns all 6 categories. If frontend still shows only 2 categories:
1. Clear browser localStorage: `localStorage.clear()`
2. Hard refresh the page (Ctrl+F5)
3. Categories are cached in localStorage as 'categories' key

#### Filter Behavior
- All filters are optional and can be combined
- Empty/null filters are ignored
- Invalid filter values return 400 Bad Request with descriptive error
- Pagination persists across filter changes

#### Idempotent Operations
- Adding duplicate favorites returns 200 OK (no error)
- Removing non-existent favorites returns 200 OK (no error)
- This prevents UI errors from multiple rapid clicks

---

## System Information

**Backend Version**: 1.0.4 (Built: December 3, 2025)  
**Frontend Version**: 1.0.0 (React 18.2.0)  
**Database**: PostgreSQL 15.13 with HikariCP connection pooling  
**Current Data**: 87 users, 26 vendors, 580 services, 973 bookings, 762 reviews, 488 favorites, 226 addresses  
**Authentication**: JWT Bearer tokens (24h expiration, NoOp password encoder)  
**API Rate Limiting**: Not implemented (suitable for development/small scale)  
**Health Check**: `/api/v1/actuator/health` (minimal actuator endpoints)  
**Environment**: Production-ready with optimized startup and lazy initialization  
**Security**: CORS enabled, role-based access control, input validation  

### Technology Stack
**Backend:**
- Java 21 with Spring Boot 3.5.0
- Spring Security 6.x + JWT
- Hibernate/JPA with HikariCP
- PostgreSQL 15.13 driver
- Maven 3.9+ (optimized builds)

**Frontend:**  
- React 18.2.0 + React Router 6.20.0
- Axios 1.6.2 for API calls
