# BOOK-KARO Database Schema Documentation

**Last Updated:** December 1, 2025  
**Database:** PostgreSQL 15.13  
**Schema Version:** Latest with bug fixes  
**Status:** ✅ Production Ready

## Current Production Statistics (December 1, 2025)
- **Users:** 87 (1 admin + 26 vendors + 60 customers)
- **Services:** 580 across 6 categories with complete CRUD operations
- **Bookings:** 973 total bookings with full lifecycle tracking
- **Categories:** 6 (Electrical, Home Services, IT & Software, Logistics, Painting, Plumbing)
- **Reviews:** 762 authentic customer reviews with 5-star rating system
- **Addresses:** 226 addresses (HOME, WORK, OFFICE, OTHER types)
- **Favorites:** 488 saved services with idempotent operations
- **Payments:** 115 payment records with mock gateway integration
- **Coupons:** 24 active discount codes with usage tracking
- **Content:** 12 announcements, 8 FAQs, 6 promotional banners

## Schema Features & Optimization (Dec 1, 2025)
- ✅ **Address System**: HOME, WORK, OFFICE, OTHER with proper enum constraints
- ✅ **Booking Lifecycle**: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
- ✅ **Payment Integration**: Mock gateway with multiple payment methods
- ✅ **Review System**: 1-5 star ratings with decimal precision and comments
- ✅ **User Roles**: USER, VENDOR, ADMIN with role-based access control
- ✅ **Audit Logging**: Complete activity tracking with timestamps
- ✅ **Performance**: HikariCP connection pooling, indexed queries, lazy loading
- ✅ **Data Integrity**: Foreign key constraints and referential integrity

---

## Service Marketplace Platform - Complete System

### Database: PostgreSQL

---

**Recent Schema Updates (December 1, 2025):**
- ✅ Updated `addresses_address_type_check` constraint to include 'OFFICE' type
- ✅ Verified categories table has all 6 distinct categories
- ✅ Confirmed favorites table handles duplicates at application layer
- ✅ Services table properly linked to categories with foreign key relationships

## Entity Relationship Diagram (ERD)

```
User ────────< Booking >──────── Service ──────── Category
 │                │                   │              │
 │                │                   │              │
 │                └─── Payment        │              │
 │                │                   │              │
 │                └─── Refund         │              │
 │                                    │              │
 └────────< Review >──────────────────┘              │
 │                                                    │
 └────────< Address >                                 │
 │                                                    │
 └────────< Favorite >──── Service ──────────────────┘
 │                                                    │
 └────────< CartItem >──── Service ──────────────────┘
 │
 └────────< UserRole > (Multi-role support)

Vendor ──────< Service
 │
 └────────< VendorAvailability

SystemSettings (Platform Configuration)
AuditLog (Activity Tracking)
Notification (User Notifications)
Announcement (Platform Updates)
Banner (Promotional Content)
FAQ (Help Content)
Coupon ──────< CouponUsage
Wallet (User Wallet)
SearchAnalytics (Search Tracking)
ContactInquiry (Support Requests)
```

---

## Tables and Entities

### 1. User Table
Stores user information for authentication and profile management with multi-role support.

| Column Name         | Data Type      | Constraints                  | Description                    |
|---------------------|----------------|------------------------------|--------------------------------|
| id                  | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique user identifier         |
| email               | VARCHAR(100)   | UNIQUE, NOT NULL             | User email (login credential)  |
| password            | VARCHAR(255)   | NOT NULL                     | Encrypted password (BCrypt)    |
| full_name           | VARCHAR(100)   | NOT NULL                     | User's full name               |
| phone               | VARCHAR(20)    | NOT NULL                     | Contact phone number           |
| address             | VARCHAR(255)   |                              | User's address                 |
| profile_picture     | VARCHAR(500)   |                              | Profile picture URL            |
| city                | VARCHAR(100)   |                              | City                           |
| state               | VARCHAR(100)   |                              | State/Province                 |
| postal_code         | VARCHAR(10)    |                              | Postal code                    |
| latitude            | DOUBLE         |                              | Location latitude              |
| longitude           | DOUBLE         |                              | Location longitude             |
| role                | VARCHAR(20)    | NOT NULL                     | Primary role (USER, VENDOR, ADMIN) |
| is_active           | BOOLEAN        | DEFAULT TRUE                 | Account active status          |
| reset_token         | VARCHAR(100)   |                              | Password reset token           |
| reset_token_expiry  | TIMESTAMP      |                              | Reset token expiration         |
| last_login          | TIMESTAMP      |                              | Last login timestamp           |
| created_at          | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Account creation date          |
| updated_at          | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Last profile update            |

**Indexes:**
- `idx_email` on `email`
- `idx_location` on `latitude, longitude`
- `idx_role` on `role`

---

### 2. Service Table
Stores service offerings provided by vendors with category relationships and approval workflow.

| Column Name              | Data Type      | Constraints                  | Description                    |
|--------------------------|----------------|------------------------------|--------------------------------|
| id                       | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique service identifier      |
| vendor_id                | BIGINT         | FOREIGN KEY (Vendor.id)      | Service provider ID            |
| category_id              | BIGINT         | FOREIGN KEY (Category.id)    | Service category ID            |
| service_name             | VARCHAR(200)   | NOT NULL                     | Service name                   |
| description              | TEXT           |                              | Detailed service description   |
| category_legacy          | VARCHAR(100)   |                              | Legacy string category field   |
| price                    | DECIMAL(12,2)  | NOT NULL                     | Service price                  |
| duration_minutes         | INTEGER        |                              | Estimated service duration     |
| address                  | VARCHAR(255)   |                              | Service location               |
| city                     | VARCHAR(100)   |                              | City                           |
| state                    | VARCHAR(100)   |                              | State/Province                 |
| postal_code              | VARCHAR(20)    |                              | Postal code                    |
| latitude                 | DECIMAL(10,7)  |                              | Service location latitude      |
| longitude                | DECIMAL(10,7)  |                              | Service location longitude     |
| is_available             | BOOLEAN        | DEFAULT TRUE                 | Service availability status    |
| is_featured              | BOOLEAN        | DEFAULT FALSE                | Featured service flag          |
| approval_status          | VARCHAR(20)    | NOT NULL                     | PENDING, APPROVED, REJECTED    |
| rejection_reason         | TEXT           |                              | Admin rejection reason         |
| approval_reason          | TEXT           |                              | Admin approval reason (legacy) |
| average_rating           | DECIMAL(3,2)   | DEFAULT 0.00                 | Average rating (0-5)           |
| total_reviews            | INTEGER        | DEFAULT 0                    | Total number of reviews        |
| available_from_time      | TIME           |                              | Service available from time    |
| available_to_time        | TIME           |                              | Service available to time      |
| created_at               | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Service creation date          |
| updated_at               | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Last update                    |
| deleted_at               | TIMESTAMP      |                              | Soft delete timestamp          |

**Indexes:**
- `idx_vendor_id` on `vendor_id`
- `idx_service_type` on `service_type`
- `idx_service_location` on `latitude, longitude`
- `idx_active` on `is_active`

---

### 3. Booking Table
Stores service booking information with comprehensive tracking and payment integration.

| Column Name              | Data Type      | Constraints                  | Description                    |
|--------------------------|----------------|------------------------------|--------------------------------|
| id                       | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique booking identifier      |
| user_id                  | BIGINT         | FOREIGN KEY (User.id)        | Customer ID                    |
| vendor_id                | BIGINT         | FOREIGN KEY (Vendor.id)      | Service provider ID            |
| service_id               | BIGINT         | FOREIGN KEY (Service.id)     | Booked service ID              |
| address_id               | BIGINT         | FOREIGN KEY (Address.id)     | Service delivery address       |
| booking_reference        | VARCHAR(50)    | UNIQUE                       | Unique booking reference       |
| scheduled_at             | TIMESTAMP      |                              | Scheduled service datetime     |
| booking_date             | DATE           |                              | Date of service                |
| booking_time             | TIME           |                              | Time of service                |
| time_slot                | VARCHAR(50)    |                              | Time slot description          |
| status                   | VARCHAR(20)    | NOT NULL                     | PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW |
| payment_status           | VARCHAR(20)    | NOT NULL                     | UNPAID, PAID, PARTIAL, REFUNDED, FAILED, N_A |
| price_total              | DECIMAL(10,2)  | NOT NULL                     | Total booking amount           |
| price_service            | DECIMAL(10,2)  |                              | Service price component        |
| price_tax                | DECIMAL(10,2)  |                              | Tax component                  |
| price_discount           | DECIMAL(10,2)  |                              | Discount applied               |
| payment_method           | VARCHAR(50)    |                              | Payment method used            |
| service_name_at_booking  | VARCHAR(255)   |                              | Service name at booking time   |
| service_price_at_booking | DECIMAL(10,2)  |                              | Service price at booking time  |
| special_requests         | TEXT           |                              | Customer notes/requirements    |
| cancellation_reason      | TEXT           |                              | Reason for cancellation        |
| cancelled_at             | TIMESTAMP      |                              | Cancellation timestamp         |
| cancelled_by             | BIGINT         |                              | User who cancelled             |
| completed_at             | TIMESTAMP      |                              | Completion timestamp           |
| created_at               | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Booking creation time          |
| created_by               | BIGINT         |                              | User who created booking       |
| updated_at               | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Last status update             |
| updated_by               | BIGINT         |                              | User who last updated          |
| deleted_at               | TIMESTAMP      |                              | Soft delete timestamp          |

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
Stores customer reviews and ratings for services with vendor response capability.

| Column Name     | Data Type      | Constraints                  | Description                    |
|-----------------|----------------|------------------------------|--------------------------------|
| id              | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique review identifier       |
| booking_id      | BIGINT         | FOREIGN KEY (Booking.id), UNIQUE | Related booking ID (one review per booking) |
| user_id         | BIGINT         | FOREIGN KEY (User.id)        | Reviewer (customer) ID         |
| service_id      | BIGINT         | FOREIGN KEY (Service.id)     | Reviewed service ID            |
| vendor_id       | BIGINT         | FOREIGN KEY (Vendor.id)      | Service provider ID            |
| rating          | INTEGER        | NOT NULL, CHECK (rating BETWEEN 1 AND 5) | Rating (1-5 stars) |
| comment         | TEXT           |                              | Review text                    |
| likes_count     | INTEGER        | DEFAULT 0                    | Helpful votes count            |
| is_verified     | BOOLEAN        | DEFAULT FALSE                | Verified review flag           |
| vendor_response | TEXT           |                              | Vendor response to review      |
| response_at     | TIMESTAMP      |                              | Vendor response timestamp      |
| created_at      | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Review submission time         |
| created_by      | BIGINT         |                              | User who created review        |
| updated_at      | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Last review update             |
| updated_by      | BIGINT         |                              | User who last updated          |
| deleted_at      | TIMESTAMP      |                              | Soft delete timestamp          |

**Indexes:**
- `idx_booking_id` on `booking_id`
- `idx_user_id` on `user_id`
- `idx_service_id` on `service_id`
- `idx_rating` on `rating`

**Constraints:**
- One review per booking: `UNIQUE(booking_id)`

---

### 5. Address Table
Stores multiple addresses for users with geolocation support.

| Column Name    | Data Type      | Constraints                  | Description                    |
|----------------|----------------|------------------------------|--------------------------------|
| id             | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique address identifier      |
| user_id        | BIGINT         | FOREIGN KEY (User.id)        | Address owner ID               |
| address_type   | VARCHAR(20)    | NOT NULL, ENUM               | HOME, WORK, OFFICE, OTHER      |
| address_line1  | VARCHAR(255)   | NOT NULL                     | Primary address line           |
| address_line2  | VARCHAR(255)   |                              | Secondary address line         |
| city           | VARCHAR(100)   | NOT NULL                     | City name                      |
| state          | VARCHAR(100)   | NOT NULL                     | State/Province                 |
| postal_code    | VARCHAR(20)    | NOT NULL                     | ZIP/Postal code                |
| country        | VARCHAR(100)   |                              | Country name                   |
| landmark       | VARCHAR(100)   |                              | Nearby landmark                |
| latitude       | DECIMAL(10,7)  |                              | Address latitude               |
| longitude      | DECIMAL(10,7)  |                              | Address longitude              |
| is_default     | BOOLEAN        | DEFAULT FALSE                | Default address flag           |
| is_active      | BOOLEAN        | DEFAULT TRUE                 | Address active status          |
| created_at     | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Address creation date          |
| created_by     | BIGINT         |                              | User who created address       |
| updated_at     | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Last address update            |
| updated_by     | BIGINT         |                              | User who last updated          |
| deleted_at     | TIMESTAMP      |                              | Soft delete timestamp          |

**Indexes:**
- `idx_user_addresses` on `user_id`
- `idx_address_type` on `address_type`
- `idx_default_address` on `user_id, is_default`

**Constraints:**
- `addresses_address_type_check`: `CHECK (address_type IN ('HOME', 'WORK', 'OFFICE', 'OTHER'))`
- One default address per user: Logic enforced at application level

**Recent Updates:**
- ✅ Added 'OFFICE' to address_type check constraint (December 1, 2025)
- ✅ OFFICE addresses now fully supported in API endpoints

---

## Additional Tables

### 6. Vendor Table
Stores service provider business information.

| Column Name        | Data Type      | Constraints                  | Description                    |
|--------------------|----------------|------------------------------|--------------------------------|
| id                 | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique vendor identifier       |
| user_id            | BIGINT         | FOREIGN KEY (User.id)        | Associated user account        |
| vendor_code        | VARCHAR(50)    | UNIQUE                       | Unique vendor code             |
| business_name      | VARCHAR(255)   | NOT NULL                     | Business/company name          |
| category_id        | BIGINT         | FOREIGN KEY (Category.id)    | Primary business category      |
| primary_category   | VARCHAR(100)   |                              | Legacy category field          |
| contact_person     | VARCHAR(200)   |                              | Primary contact person         |
| phone              | VARCHAR(32)    | NOT NULL                     | Business phone number          |
| email              | VARCHAR(255)   |                              | Business email                 |
| address            | VARCHAR(255)   |                              | Business address               |
| city               | VARCHAR(100)   |                              | Business city                  |
| state              | VARCHAR(100)   |                              | Business state                 |
| postal_code        | VARCHAR(20)    |                              | Business postal code           |
| latitude           | DECIMAL(10,7)  |                              | Business location latitude     |
| longitude          | DECIMAL(10,7)  |                              | Business location longitude    |
| years_of_experience| INTEGER        |                              | Years in business              |
| availability       | VARCHAR(255)   |                              | Availability summary           |
| average_rating     | DECIMAL(3,2)   | DEFAULT 0.00                 | Average vendor rating          |
| total_reviews      | INTEGER        | DEFAULT 0                    | Total reviews received         |
| is_active          | BOOLEAN        | DEFAULT TRUE                 | Vendor active status           |
| is_verified        | BOOLEAN        | DEFAULT FALSE                | Verification status            |
| approval_status    | VARCHAR(20)    | NOT NULL                     | PENDING, APPROVED, REJECTED, SUSPENDED |
| rejection_reason   | TEXT           |                              | Admin rejection reason         |
| suspension_reason  | TEXT           |                              | Suspension reason              |
| approval_reason    | TEXT           |                              | Admin approval reason (legacy) |
| description        | TEXT           |                              | Business description           |
| created_at         | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Vendor registration date       |
| created_by         | VARCHAR(50)    |                              | Who created the record         |
| updated_at         | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP    | Last update                    |
| updated_by         | VARCHAR(50)    |                              | Who last updated               |
| deleted_at         | TIMESTAMP      |                              | Soft delete timestamp          |

### 7. Category Table
Stores service categories with hierarchical support.

| Column Name    | Data Type      | Constraints                  | Description                    |
|----------------|----------------|------------------------------|--------------------------------|
| id             | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique category identifier     |
| name           | VARCHAR(150)   | NOT NULL                     | Category name                  |
| slug           | VARCHAR(150)   | UNIQUE, NOT NULL             | URL-friendly category name     |
| parent_id      | BIGINT         | FOREIGN KEY (Category.id)    | Parent category (for hierarchy)|
| description    | TEXT           |                              | Category description           |
| is_active      | BOOLEAN        | DEFAULT TRUE                 | Category active status         |
| created_at     | TIMESTAMP      | NOT NULL                     | Category creation date         |
| created_by     | BIGINT         |                              | User who created category      |
| updated_at     | TIMESTAMP      |                              | Last update                    |
| updated_by     | BIGINT         |                              | User who last updated          |
| deleted_at     | TIMESTAMP      |                              | Soft delete timestamp          |

### 8. Payment Table
Stores payment transaction information.

| Column Name              | Data Type      | Constraints                  | Description                    |
|--------------------------|----------------|------------------------------|--------------------------------|
| id                       | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique payment identifier      |
| booking_id               | BIGINT         | FOREIGN KEY (Booking.id)     | Associated booking             |
| user_id                  | BIGINT         | FOREIGN KEY (User.id)        | User who made payment          |
| payment_method           | VARCHAR(50)    | NOT NULL                     | Payment method used            |
| payment_provider         | VARCHAR(50)    |                              | Payment gateway provider       |
| amount                   | DECIMAL(10,2)  | NOT NULL                     | Payment amount                 |
| currency                 | VARCHAR(3)     | DEFAULT 'INR'                | Payment currency               |
| payment_status           | VARCHAR(20)    | DEFAULT 'PENDING'            | Payment status                 |
| external_transaction_id  | VARCHAR(255)   | UNIQUE                       | Gateway transaction ID         |
| paid_at                  | TIMESTAMP      |                              | Payment completion time        |
| refunded_at              | TIMESTAMP      |                              | Refund completion time         |
| created_at               | TIMESTAMP      | NOT NULL                     | Payment creation time          |
| created_by               | BIGINT         |                              | User who created payment       |
| updated_at               | TIMESTAMP      |                              | Last update                    |
| updated_by               | BIGINT         |                              | User who last updated          |
| deleted_at               | TIMESTAMP      |                              | Soft delete timestamp          |

### 9. Refund Table
Stores refund request and processing information.

| Column Name               | Data Type      | Constraints                  | Description                    |
|---------------------------|----------------|------------------------------|--------------------------------|
| id                        | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique refund identifier       |
| payment_id                | BIGINT         | FOREIGN KEY (Payment.id)     | Associated payment             |
| booking_id                | BIGINT         | FOREIGN KEY (Booking.id)     | Associated booking             |
| amount                    | DECIMAL(10,2)  | NOT NULL                     | Refund amount                  |
| reason                    | VARCHAR(500)   |                              | Refund reason                  |
| refund_status             | VARCHAR(20)    | NOT NULL                     | PENDING, PROCESSING, COMPLETED, REJECTED |
| requested_at              | TIMESTAMP      |                              | Refund request time            |
| processed_at              | TIMESTAMP      |                              | Refund processing time         |
| processor_transaction_id  | VARCHAR(100)   |                              | Gateway refund transaction ID  |
| created_at                | TIMESTAMP      | NOT NULL                     | Refund creation time           |
| created_by                | BIGINT         |                              | User who created refund        |
| updated_at                | TIMESTAMP      |                              | Last update                    |
| updated_by                | BIGINT         |                              | User who last updated          |
| deleted_at                | TIMESTAMP      |                              | Soft delete timestamp          |

### 10. Favorite Table
Stores user favorite services.

| Column Name    | Data Type      | Constraints                  | Description                    |
|----------------|----------------|------------------------------|--------------------------------|
| id             | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique favorite identifier     |
| user_id        | BIGINT         | FOREIGN KEY (User.id)        | User who favorited             |
| service_id     | BIGINT         | FOREIGN KEY (Service.id)     | Favorited service              |
| created_at     | TIMESTAMP      |                              | Favorite creation time         |
| created_by     | BIGINT         |                              | User who created favorite      |
| updated_at     | TIMESTAMP      |                              | Last update                    |
| updated_by     | BIGINT         |                              | User who last updated          |
| deleted_at     | TIMESTAMP      |                              | Soft delete timestamp          |

**Unique Constraint**: (user_id, service_id) - Prevents duplicate favorites

### 11. CartItem Table
Stores shopping cart items for users.

| Column Name    | Data Type      | Constraints                  | Description                    |
|----------------|----------------|------------------------------|--------------------------------|
| id             | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique cart item identifier    |
| user_id        | BIGINT         | FOREIGN KEY (User.id)        | Cart owner                     |
| service_id     | BIGINT         | FOREIGN KEY (Service.id)     | Service in cart                |
| quantity       | INTEGER        | NOT NULL                     | Quantity of service            |
| added_at       | TIMESTAMP      |                              | When item was added to cart    |
| is_active      | BOOLEAN        | DEFAULT TRUE                 | Cart item active status        |
| created_at     | TIMESTAMP      | NOT NULL                     | Cart item creation time        |
| created_by     | BIGINT         |                              | User who created cart item     |
| updated_at     | TIMESTAMP      |                              | Last update                    |
| updated_by     | BIGINT         |                              | User who last updated          |
| deleted_at     | TIMESTAMP      |                              | Soft delete timestamp          |

### 12. SystemSettings Table
Stores platform-wide configuration settings.

| Column Name    | Data Type      | Constraints                  | Description                    |
|----------------|----------------|------------------------------|--------------------------------|
| id             | BIGINT         | PRIMARY KEY, AUTO_INCREMENT  | Unique setting identifier      |
| setting_key    | VARCHAR(255)   | UNIQUE, NOT NULL             | Setting key name               |
| setting_value  | TEXT           |                              | Setting value                  |
| setting_type   | VARCHAR(50)    |                              | TEXT, NUMBER, EMAIL, PHONE, JSON |
| description    | VARCHAR(255)   |                              | Setting description            |
| category       | VARCHAR(100)   |                              | CONTACT, PRICING, GENERAL, etc.|
| is_public      | BOOLEAN        | DEFAULT FALSE                | Public access flag             |
| created_at     | TIMESTAMP      |                              | Setting creation time          |
| updated_at     | TIMESTAMP      |                              | Last update                    |

---

## Relationships

1. **User → Booking** (One-to-Many)
   - A user can have multiple bookings
   
2. **User → Address** (One-to-Many)
   - A user can have multiple addresses (home, work, office, etc.)
   
3. **User → Vendor** (One-to-One)
   - A user can be associated with one vendor profile
   
4. **User → UserRole** (One-to-Many)
   - Multi-role support: users can have multiple roles
   
5. **Vendor → Service** (One-to-Many)
   - A vendor can offer multiple services
   
6. **Category → Service** (One-to-Many)
   - A category can contain multiple services
   
7. **Service → Booking** (One-to-Many)
   - A service can be booked multiple times
   
8. **Booking → Review** (One-to-One)
   - Each booking can have one review
   
9. **Booking → Payment** (One-to-One)
   - Each booking has one payment record
   
10. **Payment → Refund** (One-to-Many)
    - A payment can have multiple refund attempts
    
11. **User → Favorite** (One-to-Many)
    - A user can favorite multiple services
    
12. **User → CartItem** (One-to-Many)
    - A user can have multiple items in cart
    
13. **Address → Booking** (One-to-Many)
    - An address can be used for multiple bookings

---

## SQL Scripts

### Create Database
```sql
CREATE DATABASE service_marketplace;
USE service_marketplace;
```

### Database Performance & Optimization

**Connection Pool Settings:**
```properties
# Development Configuration
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
```

**Schema Management:**
- **Mode**: `validate` (production-safe, no auto schema changes)
- **DDL Auto**: `none` (manual migration control)
- **SQL Logging**: Disabled for performance

**Current Table Sizes (December 1, 2025):**
- **users**: 87 records (multi-role system with user_roles junction table)
- **vendors**: 26 records (across 7 cities with approval workflow)
- **services**: 580 records (6 categories with vendor relationships)
- **bookings**: 973 records (complete lifecycle with payment integration)
- **reviews**: 762 records (authentic feedback with vendor responses)
- **addresses**: 226 records (4 address types with geolocation)
- **favorites**: 488 records (user preferences with unique constraints)
- **cart_items**: Active shopping cart items
- **payments**: 115 records (transaction history with gateway integration)
- **refunds**: Refund requests and processing records
- **categories**: 6 records (hierarchical service categories)
- **coupons**: 24 records (discount system with usage tracking)
- **coupon_usages**: Coupon usage history
- **announcements**: 12 records (platform updates)
- **faqs**: 8 records (help content)
- **banners**: 6 records (promotional content)
- **notifications**: User notification system
- **audit_logs**: Extensive activity tracking
- **system_settings**: Dynamic platform configuration
- **vendor_availabilities**: Vendor schedule management
- **wallets**: User wallet system
- **search_analytics**: Search behavior tracking
- **contact_inquiries**: Customer support requests
- **user_preferences**: User preference settings

### Database Constraints and Indexes

**Primary Indexes:**
- `idx_email` on users(email)
- `idx_role` on users(role)
- `idx_location` on users(latitude, longitude)
- `idx_services_vendor` on services(vendor_id)
- `idx_services_category` on services(category_id)
- `idx_services_city` on services(city)
- `idx_services_price` on services(price)
- `idx_services_approval_status` on services(approval_status)
- `idx_bookings_user` on bookings(user_id)
- `idx_bookings_vendor` on bookings(vendor_id)
- `idx_bookings_service` on bookings(service_id)
- `idx_bookings_status` on bookings(status)
- `idx_booking_id` on reviews(booking_id)
- `idx_vendors_user` on vendors(user_id)
- `idx_vendors_category` on vendors(category_id)

**Unique Constraints:**
- users(email) - Unique email addresses
- services.booking_reference - Unique booking references
- reviews(booking_id) - One review per booking
- favorites(user_id, service_id) - Prevent duplicate favorites
- vendors.vendor_code - Unique vendor codes
- categories.slug - Unique category slugs
- payments.external_transaction_id - Unique transaction IDs
- system_settings.setting_key - Unique setting keys

**Enum Constraints:**
- addresses.address_type: HOME, WORK, OFFICE, OTHER
- bookings.status: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
- bookings.payment_status: UNPAID, PAID, PARTIAL, REFUNDED, FAILED, N_A
- services.approval_status: PENDING, APPROVED, REJECTED
- vendors.approval_status: PENDING, APPROVED, REJECTED, SUSPENDED
- refunds.refund_status: PENDING, PROCESSING, COMPLETED, REJECTED
- reviews.rating: CHECK (rating BETWEEN 1 AND 5)

### System Notes
- **Multi-Role Support**: Users can have multiple roles via user_roles junction table
- **Soft Delete**: Implemented using deleted_at timestamps across all entities
- **Audit Trail**: created_at, updated_at, created_by, updated_by on all tables
- **Geolocation**: Latitude/longitude support for proximity-based searches
- **Password Security**: BCrypt encryption with Spring Security
- **Payment Integration**: Mock gateway with real transaction tracking
- **Approval Workflows**: Services and vendors require admin approval
- **Review System**: One review per booking with vendor response capability
- **Address Validation**: City matching between service and delivery address
- **Cart Persistence**: Shopping cart items stored in database
- **Refund Policy**: Time-based refund calculations with admin approval
- **Category Hierarchy**: Support for parent-child category relationships
- **Vendor Scheduling**: Detailed availability management
- **System Configuration**: Dynamic settings with public/private access control

**Performance Optimizations:**
- Connection pooling with HikariCP (max 5 connections)
- Lazy loading for entity relationships
- Indexed columns for frequent queries
- Pagination support for large result sets
- Query optimization with proper JOIN strategies

*Last Updated: December 1, 2025 - PostgreSQL 15.13*  
*Production System: 87 users, 26 vendors, 580 services, 973 bookings, 762 reviews, 488 favorites, 226 addresses*  
*24+ Tables with complete relationships, constraints, and indexes*  
*Multi-role system with comprehensive audit trail and soft delete support*

