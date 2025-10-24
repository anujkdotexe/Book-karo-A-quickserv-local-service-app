# BOOK-KARO Quick Start Guide

## Prerequisites
- Java 21+ installed
- Node.js 18+ installed
- PostgreSQL 15+ running
- Maven 3.9+ installed

## Start the Application

### Option 1: Automated Startup (Recommended)
```powershell
cd D:\Springboard
.\scripts\START_APP.ps1
```
This script starts both backend and frontend automatically.

### Option 2: Manual Startup

#### 1. Start Backend (Terminal 1)
```powershell
cd D:\Springboard\backend

# Fast build + run (8-10 seconds)
mvn clean package -DskipTests
java -jar target/bookkaro-backend-1.0.3.jar

# OR for development (with hot reload)
mvn spring-boot:run
```
**Wait for**: "Started bookkaroApplication" message (~5-10 seconds)  
**Backend URL**: http://localhost:8081/api/v1

#### 2. Start Frontend (Terminal 2)
```powershell
cd D:\Springboard\frontend
npm install  # Only needed first time
npm start
```
**Opens**: http://localhost:3000 automatically  
**Build time**: ~10-15 seconds

---

## Development Workflow

### Fast Compilation (During Development)

**Incremental compile (2-3 seconds):**
```powershell
cd D:\Springboard\backend
mvn compile -DskipTests
# OR use the script:
.\quick-compile.ps1
```

**Full rebuild (5-7 seconds):**
```powershell
cd D:\Springboard\backend
mvn clean compile -DskipTests
```

**Create new JAR (8-10 seconds):**
```powershell
cd D:\Springboard\backend
mvn clean package -DskipTests
# OR use the script:
.\fast-build.ps1
```

### Performance Tips
- Use incremental compile (`mvn compile`) when changing 1-2 files
- Use full compile (`mvn clean compile`) when switching branches
- Backend uses lazy initialization - first request may be slower
- Multi-threaded builds (16 cores) enabled automatically

---

## Quick Test Flow

### Login
1. Go to http://localhost:3000/login
2. Email: `user@bookkaro.com`
3. Password: `password123`
4. Click Login

### Test New Features

#### Favorites
1. Navigate to **Services** (navbar)
2. Click the **heart icon** on any service card
3. Navigate to **Favorites** (navbar)
4. See your saved service
5. Click heart icon to remove

#### Addresses
1. Navigate to **Addresses** (navbar)
2. Click **"Add New Address"**
3. Fill the form:
   - Type: HOME
   - Address Line 1: "123 Main St"
   - City: "Mumbai"
   - State: "Maharashtra"
   - Postal Code: "400001"
   - Check "Set as Default"
4. Click **Save**
5. See your address in the grid

---

## Key URLs

| Feature | URL |
|---------|-----|
| Home | http://localhost:3000 |
| Services | http://localhost:3000/services |
| Favorites | http://localhost:3000/favorites |
| Addresses | http://localhost:3000/addresses |
| My Bookings | http://localhost:3000/bookings |
| Profile | http://localhost:3000/profile |
| Cart | http://localhost:3000/cart |
| **Request Refund** | http://localhost:3000/refunds/request/:bookingId |
| **Admin Refunds** | http://localhost:3000/admin/refunds |

---

## Test Credentials

**Standard Test Accounts**:
| Role | Email | Password |
|------|-------|----------|
| User | user@bookkaro.com | password123 |
| Vendor | vendor@bookkaro.com | password123 |
| Admin | admin@bookkaro.com | admin123 |

**Regional Vendor Accounts** (6 cities):
| City | Email | Password | Services |
|------|-------|----------|----------|
| Mumbai | mumbai@bookkaro.com | vendor123 | 5 services |
| Pune | pune@bookkaro.com | vendor123 | 4 services |
| Delhi | delhi@bookkaro.com | vendor123 | 5 services |
| Bangalore | bangalore@bookkaro.com | vendor123 | 4 services |
| Thane | thane@bookkaro.com | vendor123 | 2 services |
| Navi Mumbai | navimumbai@bookkaro.com | vendor123 | 5 services |

**Total**: 9 user accounts, 6 vendors, 25 services across 6 cities

---

## Verify Database

```powershell
$env:PGPASSWORD='root'
psql -U postgres -d bookkarodb

# Inside psql:
\dt                          # List all tables
SELECT COUNT(*) FROM addresses;
SELECT COUNT(*) FROM favorites;
SELECT COUNT(*) FROM services;
```

---

## Common Issues & Solutions

### Backend Startup Issues

**Backend won't start / Takes too long:**
```powershell
# 1. Check if port 8081 is in use
netstat -ano | findstr :8081

# 2. Verify PostgreSQL is running
Get-Service postgresql*

# 3. Check database connection
psql -U postgres -d bookkarodb

# 4. Use production profile for faster startup
$env:SPRING_PROFILES_ACTIVE='prod'
java -jar target/bookkaro-backend-1.0.3.jar
```

**Database connection errors:**
- Verify PostgreSQL is running on port 5432
- Check credentials in `application.properties`
- Ensure database `bookkarodb` exists

**Compilation errors:**
```powershell
# Clean Maven cache and rebuild
mvn clean
mvn clean package -DskipTests
```

### Frontend Issues

**Frontend won't start:**
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Clean install
cd D:\Springboard\frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

**Build warnings:**
- ESLint warnings about useEffect dependencies are safe to ignore
- They prevent infinite loops in React hooks

**CORS errors:**
- Backend must be running on port 8081
- Check CORS configuration in `SecurityConfig.java`

### Database Issues

**"Table doesn't exist" error:**
```powershell
# Set to update mode temporarily
# Edit application.properties:
spring.jpa.hibernate.ddl-auto=update

# Restart backend, then change back to:
spring.jpa.hibernate.ddl-auto=validate
```

**Data not persisting:**
- Check `spring.jpa.hibernate.ddl-auto` is NOT `create-drop`
- Verify PostgreSQL service is running

---

## Performance Optimization

### Backend Startup Time

**Current optimizations** (already applied):
- ✅ Lazy initialization enabled
- ✅ Deferred repository bootstrap
- ✅ HikariCP connection pool optimized
- ✅ Logging levels reduced
- ✅ Multi-threaded Maven builds

**Expected startup time**:
- Development: 8-12 seconds
- Production: 5-10 seconds
- Cloud deployment: 5-10 seconds

**To improve further**:
```bash
# Use production profile
SPRING_PROFILES_ACTIVE=prod java -jar target/bookkaro-backend-1.0.3.jar

# Increase JVM memory (if you have 8GB+ RAM)
java -Xms512m -Xmx1024m -jar target/bookkaro-backend-1.0.3.jar
```

### Build Optimization

See `backend/BUILD_OPTIMIZATION.md` for detailed guide.

**Quick commands**:
```powershell
# Fastest (2-3s) - Incremental
mvn compile -DskipTests

# Fast (5-7s) - Clean build
mvn clean compile -DskipTests

# Normal (8-10s) - Create JAR
mvn clean package -DskipTests
```

---

## What to Test

### Must Test (Phase 1 - User Features)
- [ ] User Registration & Login
- [ ] Profile management
- [ ] Service browsing with filters
- [ ] Service details page
- [ ] Create booking
- [ ] View bookings
- [ ] Add/remove favorites
- [ ] Address management (add, edit, delete, set default)
- [ ] Submit reviews and ratings

### Vendor Features (Phase 2)
- [ ] Login as vendor@bookkaro.com
- [ ] View vendor dashboard
- [ ] Manage services (add, edit, delete)
- [ ] Accept/reject bookings
- [ ] View revenue stats

### Admin Features (Phase 3)
- [ ] Login as admin@bookkaro.com
- [ ] View admin dashboard
- [ ] Manage users (role changes, activate/deactivate)
- [ ] Approve/reject vendors
- [ ] Approve/reject services
- [ ] Toggle featured services

### Performance Testing
- [ ] Backend startup time (should be 5-10 seconds)
- [ ] First API request response time
- [ ] Frontend build time (should be ~15 seconds)
- [ ] Page load times

---

## Additional Resources

**Documentation:**
- `README.md` - Project overview
- `backend/BUILD_OPTIMIZATION.md` - Compilation speed guide
- `backend/DEPLOYMENT_OPTIMIZATION.md` - Startup optimization
- `docs/important/API_DOCUMENTATION.md` - All API endpoints
- `docs/important/DATABASE_SCHEMA.md` - Database structure
- `docs/important/ARCHITECTURE.md` - System architecture

**Scripts:**
- `START_APP.ps1` - Automated startup
- `backend/fast-build.ps1` - Quick JAR build
- `backend/quick-compile.ps1` - Incremental compile

**Health Check:**
- Backend: http://localhost:8081/api/v1/actuator/health
- Should return: `{"status":"UP"}`

---

## Production Deployment

See `backend/DEPLOYMENT_OPTIMIZATION.md` for complete guide.

**Quick checklist:**
1. Set environment variables:
   ```bash
   SPRING_PROFILES_ACTIVE=prod
   SPRING_DATASOURCE_URL=jdbc:postgresql://...
   SPRING_DATASOURCE_PASSWORD=your-secure-password  # Don't use default "root"
   JWT_SECRET=your-256-bit-secret  # Generate with: openssl rand -base64 32
   ```
2. Build optimized JAR: `mvn clean package -DskipTests`
3. Allocate minimum 512MB RAM
4. Configure health check endpoint
5. Set connection timeout to 30+ seconds

**Expected cloud startup**: 5-10 seconds 🚀
- [ ] Mobile view (resize browser to < 768px)
- [ ] Heart icons sync across pages
- [ ] Navigation links work
- [ ] Logout clears favorites/addresses state

---

## Full Documentation

| Document | Purpose |
|----------|---------|
| `TESTING_GUIDE.md` | Complete test cases (49 total) |
| `IMPLEMENTATION_SUMMARY.md` | Feature overview & statistics |
| `CODE_QUALITY_CHECKLIST.md` | Quality verification |
| `PHASE_1_COMPLETION_REPORT.md` | Executive summary |

---

## Quick Commands

```powershell
# Rebuild backend
cd backend
mvn clean package -DskipTests

# Check backend is running
Invoke-WebRequest -Uri "http://localhost:8081/api/v1/services" -Method GET

# Check frontend is running
Invoke-WebRequest -Uri "http://localhost:3000" -Method GET

# View database tables
psql -U postgres -d bookkarodb -c "\dt"

# Count records
psql -U postgres -d bookkarodb -c "SELECT COUNT(*) FROM services;"
```

---

## Success Indicators

[WORKING] Backend logs show: "Started bookkaroApplication"  
[WORKING] Frontend shows: "Compiled successfully!"  
[WORKING] No console errors in browser  
[WORKING] Can login with test credentials  
[WORKING] Can create address  
[WORKING] Can favorite a service  
[WORKING] Heart icons turn red when clicked  

---

## Ready to Test!

**All features implemented and ready for testing.**

Follow **TESTING_GUIDE.md** for comprehensive test coverage.
