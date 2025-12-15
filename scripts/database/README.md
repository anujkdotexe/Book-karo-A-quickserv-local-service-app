# Database Scripts

## Working Scripts

### POPULATE_MOCK_DATA.ps1
**Purpose**: Main script to reset and reload database from CSV files  
**Usage**: `.\POPULATE_MOCK_DATA.ps1`  
**What it does**:
- Backs up current database
- Recreates schema (if needed)
- Loads all CSV data
- Restarts backend

### LOAD_ALL_CSV.ps1
**Purpose**: Load CSV data into existing database  
**Usage**: `.\LOAD_ALL_CSV.ps1`  
**What it does**:
- Loads data from `csv files/` directory
- Preserves existing schema
- Reports success/failure for each table

### FIX_SCHEMA_FOR_CSV.sql
**Purpose**: Recreate database schema with CSV-compatible column order  
**Usage**: `psql -U postgres -d bookkarodb -f FIX_SCHEMA_FOR_CSV.sql`  
**When to use**: When schema needs to be rebuilt from scratch

### reset_user_account.sql
**Purpose**: Reset a specific user account password/status  

### FIX_SEQUENCES.ps1 (NEW)
**Purpose**: Fix database sequence issues that cause duplicate key errors  
**Usage**: `.\FIX_SEQUENCES.ps1`  
**When to use**: 
- When you get "duplicate key value violates unique constraint" errors
- After loading CSV data
- After manual database inserts
**What it does**:
- Resets all table sequences to correct values
- Prevents "cart_items_pkey", "users_pkey", etc. violations
- Safe to run multiple times

### fix_all_sequences.sql
**Purpose**: SQL script to reset all database sequences  
**Usage**: `psql -U postgres -d bookkarodb -f fix_all_sequences.sql`  
**Alternative to**: FIX_SEQUENCES.ps1 (if you prefer direct SQL)

## Current Data Status (October 31, 2025)

Successfully loaded:
- 100 Users
- 7 Categories
- 6 Vendors
- 7 Services

## CSV Files Location

All CSV files are in: `d:\Springboard\csv files\`

## Database Connection

- Host: localhost
- Port: 5432
- Database: bookkarodb
- User: postgres
- Password: root

# Database Scripts (OLD - DO NOT USE)

## Overview
This directory contains scripts for managing mock test data in the BookKaro database.

## Files

### POPULATE_MOCK_DATA.ps1
Main script for populating the database with comprehensive test data from CSV files.

## Usage

### 1. Initial Population (Fresh Import)
Clears all existing data and imports mock data from CSV files:
```powershell
.\POPULATE_MOCK_DATA.ps1
```

This will:
- Create a timestamped backup of current data
- Clear all existing data from 21 tables
- Reset all sequences to start from 1
- Import data from CSV files in correct dependency order
- Verify row counts
- Display summary

### 2. Restore from Latest Backup
Restore database to the last saved state:
```powershell
.\POPULATE_MOCK_DATA.ps1 -RestoreFromBackup
```

### 3. Create Backup Only
Create a backup without making any changes:
```powershell
.\POPULATE_MOCK_DATA.ps1 -CreateBackupOnly
```

### 4. Custom Backup Path
Specify a different backup location:
```powershell
.\POPULATE_MOCK_DATA.ps1 -BackupPath "C:\MyBackups"
```

## Import Order

Data is imported in the following order to respect foreign key constraints:

1. **users** - Base user accounts
2. **categories** - Service categories (hierarchical)
3. **vendors** - Vendor profiles (references users)
4. **addresses** - User and booking addresses
5. **user_roles** - Multi-role support
6. **user_preferences** - User settings
7. **wallets** - User wallet balances
8. **vendor_availabilities** - Vendor schedules
9. **services** - Service offerings (references vendors, categories)
10. **coupons** - Discount coupons
11. **announcements** - System announcements
12. **banners** - Promotional banners
13. **faqs** - FAQ entries
14. **favorites** - User favorite services
15. **cart_items** - Shopping cart
16. **bookings** - Service bookings (references users, services)
17. **reviews** - Service reviews (references bookings, services)
18. **coupon_usages** - Coupon usage tracking
19. **payments** - Payment transactions (references bookings)
20. **refunds** - Refund requests (references payments)
21. **audit_logs** - System audit trail

## Mock Data Details

### User Accounts
- **Total**: 102 users
- **Roles**: USER, VENDOR, ADMIN
- **Test Accounts**:
  - User: user@bookkaro.com / UserPass123
  - Admin: admin@bookkaro.com / AdminPass123
  - Vendors: mumbai@bookkaro.com, pune@bookkaro.com, etc. / VendorPass123

### Vendors
- 6 vendor businesses across major cities
- All vendors are APPROVED
- Include ratings, reviews, and availability schedules

### Services
- Multiple services per vendor
- Linked to categories
- Include pricing, duration, descriptions

### Bookings
- Complete booking lifecycle examples
- Various statuses: PENDING, CONFIRMED, COMPLETED, CANCELLED
- Include addresses and time slots

### Payments & Refunds
- Payment records for bookings
- Various payment statuses
- Refund requests with different statuses

## Backup Management

Backups are stored in: `d:\Springboard\database_backups\`

Backup file format: `mock_data_backup_YYYYMMDD_HHMMSS.sql`

Backups are created automatically before any data manipulation.

## Troubleshooting

### Connection Issues
If you get connection errors:
1. Verify PostgreSQL is running
2. Check credentials in script (default: postgres/admin)
3. Ensure database 'bookkarodb' exists

### Import Failures
If import fails for specific tables:
1. Check CSV file format (UTF-8 encoding, proper headers)
2. Verify foreign key dependencies are satisfied
3. Check for data type mismatches
4. Review PostgreSQL error messages

### Sequence Reset Issues
If IDs don't start from 1 after import:
- Script automatically resets all sequences
- If manual reset needed: `ALTER SEQUENCE table_name_id_seq RESTART WITH 1;`

## CSV File Requirements

All CSV files must:
- Be in UTF-8 encoding
- Have headers matching table column names exactly
- Use comma (,) as delimiter
- Use empty string for NULL values
- Be located in: `d:\Springboard\csv files\`

## Safety Features

1. **Automatic Backups**: Created before any destructive operation
2. **Transaction Safety**: Uses PostgreSQL transactions
3. **Error Handling**: Stops on errors, prevents partial imports
4. **Verification**: Row counts displayed after import

## Examples

### Daily Testing Setup
```powershell
# Start fresh for the day
.\POPULATE_MOCK_DATA.ps1
```

### After Making Changes
```powershell
# Restore to known good state
.\POPULATE_MOCK_DATA.ps1 -RestoreFromBackup
```

### Before Production Deployment
```powershell
# Create backup for safekeeping
.\POPULATE_MOCK_DATA.ps1 -CreateBackupOnly
```

## Notes

- Script uses `psql` COPY command for efficient bulk import
- All operations are idempotent (can be run multiple times safely)
- Existing data is backed up before being cleared
- Foreign key constraints are temporarily disabled during import for performance
