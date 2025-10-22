# BOOK-KARO Database Schema Documentation

## Service Marketplace Platform - Phase 1: User Module

### Database: PostgreSQL

---

## Entity Relationship Diagram (ERD)

```
User ────────< Booking >──────── Service
 │                                    │
 │                                    │
 └────────< Review >──────────────────┘
```

---

## Tables and Entities

### 1. User Table
Stores customer information for authentication and profile management.

| Column Name    | Data Type      | Constraints                  | Description                    |
|----------------|----------------|------------------------------|--------------------------------|
| id             | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique user identifier         |
| email          | VARCHAR(100)   | UNIQUE, NOT NULL             | User email (login credential)  |
| password       | VARCHAR(255)   | NOT NULL                     | Encrypted password (BCrypt)    |
| full_name      | VARCHAR(100)   | NOT NULL                     | User's full name               |
| phone          | VARCHAR(20)    | NOT NULL                     | Contact phone number           |
| address        | VARCHAR(255)   |                              | User's address                 |
| city           | VARCHAR(100)   |                              | City                           |
| state          | VARCHAR(100)   |                              | State/Province                 |
| zip_code       | VARCHAR(10)    |                              | Postal code                    |
| latitude       | DECIMAL(10,8)  |                              | Location latitude              |
| longitude      | DECIMAL(11,8)  |                              | Location longitude             |
| role           | VARCHAR(20)    | NOT NULL                     | USER, VENDOR, ADMIN            |
| is_active      | BOOLEAN        | DEFAULT TRUE                 | Account active status          |
| created_at     | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Account creation date          |
| updated_at     | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Last profile update            |

**Indexes:**
- `idx_email` on `email`
- `idx_location` on `latitude, longitude`
- `idx_role` on `role`

---

### 2. Service Table
Stores service offerings provided by vendors.

| Column Name       | Data Type      | Constraints                  | Description                    |
|-------------------|----------------|------------------------------|--------------------------------|
| id                | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique service identifier      |
| vendor_id         | BIGINT         | FOREIGN KEY (User.id)        | Service provider ID            |
| service_name      | VARCHAR(100)   | NOT NULL                     | Service name                   |
| service_type      | VARCHAR(50)    | NOT NULL                     | Category (Plumbing, Electric, etc.) |
| description       | TEXT           |                              | Detailed service description   |
| price             | DECIMAL(10,2)  | NOT NULL                     | Service price                  |
| duration_minutes  | INT            |                              | Estimated service duration     |
| address           | VARCHAR(255)   |                              | Service location               |
| city              | VARCHAR(100)   |                              | City                           |
| state             | VARCHAR(100)   |                              | State/Province                 |
| zip_code          | VARCHAR(10)    |                              | Postal code                    |
| latitude          | DECIMAL(10,8)  |                              | Service location latitude      |
| longitude         | DECIMAL(11,8)  |                              | Service location longitude     |
| is_active         | BOOLEAN        | DEFAULT TRUE                 | Service availability status    |
| average_rating    | DECIMAL(3,2)   | DEFAULT 0.00                 | Average rating (0-5)           |
| total_reviews     | INT            | DEFAULT 0                    | Total number of reviews        |
| created_at        | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Service creation date          |
| updated_at        | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Last update                    |

**Indexes:**
- `idx_vendor_id` on `vendor_id`
- `idx_service_type` on `service_type`
- `idx_service_location` on `latitude, longitude`
- `idx_active` on `is_active`

---

### 3. Booking Table
Stores service booking information.

| Column Name       | Data Type      | Constraints                  | Description                    |
|-------------------|----------------|------------------------------|--------------------------------|
| id                | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique booking identifier      |
| user_id           | BIGINT         | FOREIGN KEY (User.id)        | Customer ID                    |
| service_id        | BIGINT         | FOREIGN KEY (Service.id)     | Booked service ID              |
| booking_date      | DATE           | NOT NULL                     | Date of service                |
| booking_time      | TIME           | NOT NULL                     | Time of service                |
| status            | VARCHAR(20)    | NOT NULL                     | PENDING, CONFIRMED, COMPLETED, CANCELLED |
| total_amount      | DECIMAL(10,2)  | NOT NULL                     | Total booking amount           |
| notes             | TEXT           |                              | Customer notes/requirements    |
| created_at        | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Booking creation time          |
| updated_at        | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Last status update             |

**Indexes:**
- `idx_user_id` on `user_id`
- `idx_service_id` on `service_id`
- `idx_status` on `status`
- `idx_booking_date` on `booking_date`

**Enum Values for status:**
- `PENDING` - Awaiting vendor confirmation
- `CONFIRMED` - Vendor confirmed the booking
- `COMPLETED` - Service completed
- `CANCELLED` - Booking cancelled

---

### 4. Review Table
Stores customer reviews and ratings for services.

| Column Name    | Data Type      | Constraints                  | Description                    |
|----------------|----------------|------------------------------|--------------------------------|
| id             | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique review identifier       |
| booking_id     | BIGINT         | FOREIGN KEY (Booking.id)     | Related booking ID             |
| user_id        | BIGINT         | FOREIGN KEY (User.id)        | Reviewer (customer) ID         |
| service_id     | BIGINT         | FOREIGN KEY (Service.id)     | Reviewed service ID            |
| rating         | INT            | NOT NULL, CHECK (rating BETWEEN 1 AND 5) | Rating (1-5 stars) |
| comment        | TEXT           |                              | Review text                    |
| created_at     | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Review submission time         |
| updated_at     | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Last review update             |

**Indexes:**
- `idx_booking_id` on `booking_id`
- `idx_user_id` on `user_id`
- `idx_service_id` on `service_id`
- `idx_rating` on `rating`

**Constraints:**
- One review per booking: `UNIQUE(booking_id)`

---

## Relationships

1. **User → Booking** (One-to-Many)
   - A user can have multiple bookings
   
2. **Service → Booking** (One-to-Many)
   - A service can be booked multiple times
   
3. **Booking → Review** (One-to-One)
   - Each booking can have one review
   
4. **User → Review** (One-to-Many)
   - A user can write multiple reviews
   
5. **Service → Review** (One-to-Many)
   - A service can have multiple reviews

---

## SQL Scripts

### Create Database
```sql
CREATE DATABASE service_marketplace;
USE service_marketplace;
```

### Notes
- All timestamps use UTC timezone
- Passwords are stored using BCrypt encryption
- Location coordinates enable proximity-based service search
- Soft delete can be implemented using `is_active` flags
- Review ratings automatically update `average_rating` in Service table via triggers or application logic

