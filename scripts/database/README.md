# Database Scripts

This directory contains automated utility scripts for managing the PostgreSQL database for Bookaro.

## Scripts

### 1. LOAD_DATABASE.ps1
**Purpose**: Loads seed data and schema tables from `csv files/` into the PostgreSQL database.  
**Usage**:
```powershell
.\LOAD_DATABASE.ps1
```
**Functionality**:
- Connects to the configured PostgreSQL instance (`bookkarodb`).
- Sets up tables and relationships if missing.
- Loads seed records from CSV files in relational order (users, categories, vendors, services, bookings, etc.).
- Verifies record insertion counts and table integrity.

### 2. FIX_SEQUENCES.ps1
**Purpose**: Resynchronizes PostgreSQL table sequences with table primary keys.  
**Usage**:
```powershell
.\FIX_SEQUENCES.ps1
```
**When to run**:
- After running CSV imports that insert explicit primary key IDs.
- If receiving `duplicate key value violates unique constraint` errors upon creating new users, cart items, or bookings.

## Database Connection Settings

Default local connection properties (configurable via environment variables or `.env`):
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `bookkarodb`
- **User**: `postgres`
- **CSV Data Source**: `..\csv files\`
