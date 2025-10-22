# bookkaro Development Instructions

## CRITICAL: Operational Rules (MUST FOLLOW)

### Terminal Management - STRICT RULES
**NEVER violate these terminal rules:**

1. **Separate Terminals for Each Service** (MANDATORY)
   - Backend: ONE dedicated terminal (NEVER touch during testing)
   - Frontend: ONE dedicated terminal (NEVER touch during testing)
   - Work/Testing: SEPARATE terminal for all other commands
   - NEVER mix backend/frontend with testing commands in same terminal

2. **NO Background Jobs/Processes** (STRICTLY FORBIDDEN)
   - NEVER use `Start-Job`, `Start-Process -NoNewWindow`, or background execution
   - Reason: User needs to SEE terminal output to identify problems
   - User's feedback is critical for learning and debugging
   - Visible terminals = Better collaboration and learning

3. **Terminal Usage Pattern** (ALWAYS FOLLOW)
   ```
   Terminal 1 (pwsh): Backend ONLY
   $ cd D:\Springboard\backend
   $ java -jar target/bookkaro-backend-1.0.3.jar
   [LEAVE RUNNING - DON'T TOUCH]
   
   Terminal 2 (node/pwsh): Frontend ONLY  
   $ cd D:\Springboard\frontend
   $ npm start
   [LEAVE RUNNING - DON'T TOUCH]
   
   Terminal 3 (pwsh): Work/Testing/Git/Everything Else
   $ cd D:\Springboard
   $ mvn compile
   $ npm run build
   $ git status
   $ Invoke-RestMethod (API testing)
   [USE THIS FOR ALL OTHER COMMANDS - NEVER in Terminal 1 or 2]
   ```

   **CRITICAL: When Testing After Changes**
   - Backend/Frontend must ALREADY be running in their dedicated terminals
   - NEVER stop backend/frontend to run test commands
   - ALWAYS open NEW terminal (Terminal 3) for verification commands
   - Example: If backend running in Terminal 1, open Terminal 3 to run `mvn compile`
   - Example: If frontend running in Terminal 2, open Terminal 3 to run `npm run build`
   - This ensures you can see live server logs while testing

4. **Before Testing - Checklist** (MANDATORY VERIFICATION)
   - ✓ Is backend running in Terminal 1? (Check http://localhost:8081/api/v1/services)
   - ✓ Is frontend running in Terminal 2? (Check http://localhost:3000)
   - ✓ Am I using Terminal 3 for testing? (NOT Terminal 1 or 2)
   - ✓ Have I verified backend/frontend are using LATEST code?

### Work Until Perfect Rule (ABSOLUTE)
**I will NOT stop until everything is 100% correct:**
- If tests fail: Debug and fix until ALL pass
- If bugs found: Fix immediately, don't postpone
- If mistakes made: Learn, document, never repeat
- If user points out issues: Acknowledge, fix, add rule
- NEVER leave work incomplete or "good enough"
- NEVER assume something works without verification

### Learning & Documentation Rules
1. **After Every Mistake**:
   - Acknowledge the mistake clearly
   - Explain what I did wrong
   - Document the correct approach
   - Add NEW RULE to this file to prevent repeat
   - Update this section with learnings

2. **Mistake Pattern Recognition**:
   - Track common mistakes I make
   - Create explicit rules to prevent them
   - Reference rules when making decisions
   - Review rules before major operations

3. **Continuous Improvement**:
   - This file grows with every session
   - Rules get stricter, not looser
   - Past mistakes become permanent guards
   - User feedback is GOLD - always incorporate

### Critical Lessons (Prevent Repeat Mistakes)

**Terminal Management Mistakes**:
- NEVER start backend/frontend in same terminal as testing
- NEVER use background jobs (`Start-Job`) - user can't see errors
- ALWAYS verify which process is serving before testing
- Check process start time vs JAR modification time

**Git/GitHub Mistakes**:
- NEVER commit .github/copilot-instructions.md to GitHub (internal only)
- NEVER push *_RESULTS.md, *_STATUS*.md (temporary reports)
- GitHub gets: README.md, QUICK_START.md, docs/important/, source code
- Local only: My rules, test results, status reports, archive

**React Context Provider Mistakes**:
- Hook inside provider requires its provider as parent (ToastProvider wraps AuthProvider, not inside)

**Authentication Mistakes**:
- Always include logout button when implementing auth

### Fix Verification & Testing Rules (MANDATORY)

**BEFORE claiming a fix is complete:**

1. **Code Verification Checklist**:
   - Read the ENTIRE modified file to verify changes applied correctly
   - Check for any syntax errors or typos introduced
   - Verify imports are correct and complete
   - Ensure no code was accidentally deleted or corrupted
   - Check that related files are also updated (DTOs, Services, Controllers)

2. **Build Verification** (CRITICAL):
   - ALWAYS rebuild backend after ANY Java code changes
   - Command: `mvn clean package -DskipTests`
   - Verify BUILD SUCCESS message
   - Check JAR file exists and has recent timestamp
   - Note the version number in build output

3. **Backend API Testing** (BEFORE claiming fix works):
   - Start fresh backend server (kill old processes first)
   - Wait for "Started bookkaroApplication" message
   - Test EACH fixed endpoint with real HTTP requests
   - Use Invoke-RestMethod or Invoke-WebRequest in PowerShell
   - Verify response structure matches expected format
   - Check for errors in backend console logs

4. **Frontend Integration Testing**:
   - Start fresh frontend server
   - Open browser and test the actual UI feature
   - Check browser console for JavaScript errors
   - Verify network tab shows successful API calls (200 status)
   - Test both success and error scenarios

5. **End-to-End Testing Sequence** (For Registration/Auth fixes):
   ```powershell
   # 1. Test Registration API directly
   $body = @{
       firstName = "Test"
       lastName = "User"
       email = "test$(Get-Random)@test.com"
       password = "password123"
       phone = "+1234567890"
       address = "123 Main St"
       city = "Mumbai"
       state = "Maharashtra"
       postalCode = "400001"
   } | ConvertTo-Json
   
   $response = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/register" `
       -Method POST -Body $body -ContentType "application/json"
   
   # 2. Verify response has token and user data
   $response.success  # Should be true
   $response.data.token  # Should exist
   $response.data.firstName  # Should match input
   
   # 3. Test Login with same credentials
   $loginBody = @{
       email = $response.data.email
       password = "password123"
   } | ConvertTo-Json
   
   $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" `
       -Method POST -Body $loginBody -ContentType "application/json"
   
   # 4. Verify login returns valid token
   $loginResponse.success  # Should be true
   ```

6. **Documentation Verification**:
   - Search ALL markdown files for emojis: `grep -r "🚀|✅|🐛|❤️|🏠" *.md`
   - Check port numbers in docs match application.properties
   - Verify test credentials are accurate
   - Ensure no "TODO" or "FIXME" comments in critical sections

7. **NEVER Skip Testing** (ABSOLUTE RULE):
   - If I claim "registration is fixed", I MUST test registration
   - If I claim "filtering works", I MUST test filtering with real API call
   - If I claim "emojis removed", I MUST grep search to verify
   - NEVER say "should work" or "will work" - only "VERIFIED WORKING"

8. **Test Evidence Requirements**:
   - Show the actual test command executed
   - Show the actual response received
   - Show any error messages (or confirm no errors)
   - State clearly: "TESTED AND VERIFIED" or "NOT YET TESTED"

**Fix Verification Workflow**:
```
1. Make code changes
2. Rebuild backend (mvn clean package)
3. Kill old processes
4. Start fresh backend in Terminal 1
5. Start fresh frontend in Terminal 2
6. Run PowerShell API tests in Terminal 3
7. Test in browser UI
8. Check browser console and network tab
9. Only then claim "FIX VERIFIED"
```

**Common Testing Mistakes to Avoid**:
- Testing against OLD backend version (check JAR timestamp)
- Not waiting for backend to fully start before testing
- Assuming code works without running actual test
- Only testing success case (must test error cases too)
- Not checking browser console for JavaScript errors

### Post-Change Verification Rules (CRITICAL - ALWAYS FOLLOW)

**AFTER making ANY code changes (backend OR frontend), ALWAYS:**

1. **Check for Compilation Errors** (MANDATORY):
   ```powershell
   # Terminal 3 (Work terminal) - Check both projects
   
   # Backend Check (if Java files modified)
   cd D:\Springboard\backend
   mvn clean compile
   # MUST show "BUILD SUCCESS" - fix any errors immediately
   
   # Frontend Check (if JS/CSS files modified)
   cd D:\Springboard\frontend
   npm run build
   # MUST complete without errors - fix any warnings/errors immediately
   ```

2. **Error Resolution Workflow**:
   - **If backend compilation fails**:
     - Read error message carefully (syntax, imports, missing dependencies)
     - Fix the error in the source file
     - Re-run `mvn clean compile` until BUILD SUCCESS
     - Then rebuild JAR: `mvn clean package -DskipTests`
     - Restart backend in Terminal 1
   
   - **If frontend build fails**:
     - Read error message (usually in terminal output)
     - Common issues: syntax errors, missing imports, undefined variables
     - Fix the error in the source file
     - Re-run `npm run build` until no errors
     - Check running frontend in Terminal 2 (auto-recompiles if `npm start` is running)
     - Check browser console for runtime errors

3. **Verification Checklist** (BEFORE claiming task complete):
   - ✓ Backend compiles without errors (`mvn clean compile`)
   - ✓ Frontend builds without errors (`npm run build`)
   - ✓ Backend server starts successfully (if backend changed)
   - ✓ Frontend dev server running without errors (if frontend changed)
   - ✓ Browser console shows no errors (F12 → Console tab)
   - ✓ Network tab shows API calls returning 200 status (if API changed)
   - ✓ Manual testing of changed feature confirms it works

4. **When to Run These Checks**:
   - After modifying any Java file (.java)
   - After modifying any React component (.js, .jsx)
   - After modifying any CSS file (.css)
   - After modifying any configuration file (application.properties, package.json)
   - Before committing changes to Git
   - Before claiming "task complete"

5. **Integration Testing After Major Changes**:
   ```powershell
   # If both backend AND frontend were modified:
   
   # 1. Rebuild backend
   cd D:\Springboard\backend
   mvn clean package -DskipTests
   
   # 2. Restart backend (Terminal 1)
   # Kill existing process (Ctrl+C)
   java -jar target/bookkaro-backend-1.0.2.jar
   
   # 3. Verify frontend (Terminal 2 should auto-reload)
   # If not, restart:
   cd D:\Springboard\frontend
   npm start
   
   # 4. Test the integration (Terminal 3)
   # Example: Test registration → login → browse services → create booking
   Invoke-RestMethod -Uri "http://localhost:8081/api/v1/services" -Method GET
   # Open browser: http://localhost:3000
   # Test the actual feature in UI
   ```

6. **Error Documentation**:
   - If errors found, document in session notes
   - Explain what caused the error
   - Explain how it was fixed
   - Add prevention rule if it's a new mistake pattern

**NEVER skip these checks. NEVER assume code works without verification.**

**Common Testing Mistakes to Avoid**:
- Testing against OLD backend version (check JAR timestamp)
- Not waiting for backend to fully start before testing
- Assuming code works without running actual test
- Only testing success case (must test error cases too)
- Not checking browser console for JavaScript errors
- Skipping compilation checks after "small" changes

## Project Overview
bookkaro is a three-tier service marketplace platform (Spring Boot + React + PostgreSQL) connecting customers with service providers. Currently in Phase 1 (User Module) - production-ready for customer-facing features.

## CRITICAL: Professional Code Standards

**NEVER include anything that makes code look AI-generated:**
- No emojis anywhere in code, comments, documentation, or UI
- No overly enthusiastic language or exclamation marks in professional contexts
- No "helpful" comments that sound like AI assistance
- Write code exactly as a professional human developer would
- Use standard industry terminology and conventions
- All comments should be technical and necessary, not decorative

## Development Philosophy & Principles

### Core Methodology
- **Agile Development**: Iterative development with clear deliverables, testing, and ongoing refinement
- **Production-Ready Focus**: Build with maintainability, scalability, and professional production standards
- **Phased Approach**: Three core modules developed iteratively - User (Customer), Vendor (Service Provider), Admin

### Technology Stack Restrictions (CRITICAL)
**Backend - Java-centric technologies ONLY:**
- Spring Boot 3.5.0 with REST APIs
- Spring Security for authentication/authorization
- Hibernate/JPA for ORM
- PostgreSQL 15.13 for database (MySQL acceptable alternative)

**Frontend - Java-compatible solutions:**
- React 18+ integrated via REST APIs (current implementation)
- Angular or Thymeleaf (server-side rendering) are acceptable alternatives

**Avoid:**
- Non-Java backend frameworks or tech stacks outside Java ecosystem

### Code Quality Standards
- **Best Practices**: Clean, modular code with proper documentation
- **Security**: Implement secure role-based access control (RBAC) for Admin, User, Vendor roles
- **Error Handling**: Comprehensive exception handling with meaningful messages
- **Code Comments**: Document complex logic and business rules
- **Maintainability**: Write standardized code fit for professional agile teams
- **Professional Appearance**: Code must look human-written, not AI-generated

### Copyright & Legal Compliance (CRITICAL)
- **NO Copyrighted Content**: Never use copyrighted images, fonts, icons, or UI components
- **Open-Source Only**: Use only open-source or freely licensed design elements
- **License Verification**: Verify licenses before using any external resource
- **Attribution**: Properly attribute open-source components where required

### UI/UX Requirements
- **Creative Freedom**: Exercise creativity for modern, responsive user experiences
- **Current Theme**: Deep Navy Blue, Bright Royal Blue, White, Light Gray (color codes: 1a2332, 2563eb, ffffff, e5e7eb)
- **Professional Design**: Clean, business-appropriate design without decorative elements

## UI/UX Patterns & Components

### Form Validation Pattern
**Field-level validation with real-time feedback:**
```javascript
const [fieldErrors, setFieldErrors] = useState({});

const validateForm = () => {
  const errors = {};
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  setFieldErrors(errors);
  return Object.keys(errors).length === 0;
};

// In JSX:
<input
  aria-invalid={!!fieldErrors.email}
  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
/>
{fieldErrors.email && (
  <span className="field-error" id="email-error" role="alert">
    {fieldErrors.email}
  </span>
)}
```

### Password Toggle Pattern
```javascript
const [showPassword, setShowPassword] = useState(false);

<div className="password-input-wrapper">
  <input type={showPassword ? 'text' : 'password'} />
  <button
    type="button"
    className="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? 'Hide password' : 'Show password'}
  >
    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
  </button>
</div>
```

### Unsaved Changes Warning
```javascript
const [originalData, setOriginalData] = useState({});
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

useEffect(() => {
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
  setHasUnsavedChanges(hasChanges);
}, [formData, originalData]);

useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges && isEditing) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges, isEditing]);
```

### Empty State Card Pattern
All empty states use this consistent structure:
```javascript
<div className="empty-state-card">
  <svg width="120" height="120">{/* Large icon */}</svg>
  <h2>No Items Yet</h2>
  <p>Descriptive message explaining the empty state</p>
  <div className="empty-state-benefits">
    <h3>Why use this feature?</h3>
    <ul>
      <li>Benefit point 1</li>
      <li>Benefit point 2</li>
      <li>Benefit point 3</li>
      <li>Benefit point 4</li>
    </ul>
  </div>
  <button className="btn btn-primary btn-large">
    Primary Action
  </button>
</div>
```

**CSS for empty states:**
```css
.empty-state-card {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-xl);
  background-color: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  max-width: 700px;
  margin: 0 auto;
}

.empty-state-benefits li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--royal-blue);
  font-weight: bold;
  font-size: 1.2rem;
}
```

### Error Message Card Pattern
For service failures and errors:
```javascript
{error && (
  <div className="error-message-card" role="alert">
    <svg width="48" height="48">{/* Alert icon */}</svg>
    <h3>Unable to Load Services</h3>
    <p>{error}</p>
    <button onClick={retryFunction} className="btn btn-primary">
      Try Again
    </button>
  </div>
)}
```

### No Results Pattern
For search/filter with zero results:
```javascript
<div className="no-results-card">
  <svg width="64" height="64">{/* Search icon */}</svg>
  <h2>No Services Found</h2>
  <p>We couldn't find any services matching your search criteria.</p>
  <div className="no-results-suggestions">
    <h3>Try these tips:</h3>
    <ul>
      <li>Check your spelling and try different keywords</li>
      <li>Select a different city or remove location filters</li>
      <li>Adjust your price range or rating filters</li>
      <li>Try browsing all categories</li>
    </ul>
  </div>
  <div className="no-results-actions">
    <button onClick={clearFilters} className="btn btn-primary">
      Clear All Filters
    </button>
    <Link to="/contact" className="btn btn-outline">
      Request a Service
    </Link>
  </div>
</div>
```

### Design System Tokens
**CSS Custom Properties (use these consistently):**
```
Colors:
  navy-blue: 1e3a8a
  royal-blue: 2563eb
  light-gray: f3f4f6
  border-color: e5e7eb
  text-primary: 1f2937
  text-secondary: 6b7280

Spacing:
  spacing-xs: 4px
  spacing-sm: 8px
  spacing-md: 16px
  spacing-lg: 24px
  spacing-xl: 32px
  spacing-2xl: 48px

Border Radius:
  radius-sm: 4px
  radius-md: 8px
  radius-lg: 12px
  radius-xl: 16px
  radius-full: 9999px

Shadows:
  shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
  shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
  shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
```

### Button Variants
```css
.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--transition-normal);
}

.btn-primary {
  background-color: var(--royal-blue);
  color: white;
  border: none;
}

.btn-outline {
  background-color: white;
  color: var(--royal-blue);
  border: 2px solid var(--royal-blue);
}

.btn-large {
  padding: var(--spacing-md) var(--spacing-2xl);
  font-size: 1.1rem;
  font-weight: 600;
}
```

## Critical Architecture Decisions

### Vendor-Service Separation (IMPORTANT)
- **Vendors** and **Services** are SEPARATE entities with distinct tables
- One vendor can provide multiple services (Vendor 1:N Service relationship)
- Service.vendor_id references Vendor.id (NOT User.id)
- **Multi-City Regional Setup**: 6 vendors across 6 major Indian cities
- **No CSV Data Loader**: Data is generated programmatically via ComprehensiveDataInitializer
- Data loads ONCE when `serviceRepository.count() < 20`, then persists permanently

### Data Initialization System (DEPLOYMENT CRITICAL)
**Current Implementation**:
1. **DataInitializer** (@Order(1)):
   - Creates 3 test user accounts (USER, VENDOR, ADMIN)
   - Email: user@bookkaro.com, vendor@bookkaro.com, admin@bookkaro.com
   - Password: password123 (admin123 for admin)

2. **ComprehensiveDataInitializer** (@Order(3)):
   - Creates 6 regional vendors (one per city)
   - Cities: Mumbai, Pune, Delhi, Bangalore, Thane, Navi Mumbai
   - Each vendor has User account with VENDOR role for login
   - Total: 25 services across 6 vendors
   - Vendor credentials: [city]@bookkaro.com / vendor123
   - Example: mumbai@bookkaro.com, pune@bookkaro.com, delhi@bookkaro.com

3. **BookingReviewInitializer** (@Order(3)):
   - Creates 30 sample bookings for test user
   - Various statuses: PENDING, CONFIRMED, COMPLETED, CANCELLED
   - Includes reviews for completed bookings

**Data Summary**:
- 9 users total (3 test accounts + 6 vendor accounts)
- 6 vendors (regional coverage across major Indian cities)
- 25 services (5+4+5+4+2+5 across vendors)
- 30 sample bookings with reviews

**When deploying to production (Railway, Render, Heroku, etc.)**:
- No CSV files needed - all data generated programmatically
- On first startup with empty database, all initializers run automatically
- Check: `if (serviceRepository.count() < 20)` - runs if services < 20
- Subsequent restarts skip initialization
- All data stored in PostgreSQL - survives restarts forever

**File**: `backend/src/main/java/com/bookkaro/config/ComprehensiveDataInitializer.java`
- Active: `@Configuration` with `@Bean @Order(3)` CommandLineRunner
- Generates vendors + services programmatically (no external files)

### Database Schema Management (PRODUCTION CRITICAL)
```properties
spring.jpa.hibernate.ddl-auto=validate  # NEVER change to create-drop/update
```
- **validate**: Production-safe mode - only validates schema, makes NO changes
- Data persists permanently in PostgreSQL (bookkarodb)
- Schema changes require manual migrations (never auto-applied)
- Database: PostgreSQL 15.13 on localhost:5432, user: postgres, password: root

### Authentication & Role-Based Access Control (RBAC)
- **JWT Authentication**: 24-hour token expiration with BCrypt password encryption
- **Token Flow**: Stored in localStorage (frontend), validated via JwtAuthenticationFilter (backend)
- **Three Roles**: USER, VENDOR, ADMIN (enum in User.UserRole)
  
**Endpoint Security Pattern:**
```java
// Public endpoints (no authentication required)
.requestMatchers("/auth/**", "/services/**").permitAll()

// Protected endpoints (JWT required, role-based access)
.anyRequest().authenticated()
```

**Role Permissions (Current Implementation):**
- USER: Profile management, service browsing, booking creation, reviews
- VENDOR: (Phase 2) Service management, booking acceptance, revenue tracking
- ADMIN: (Phase 3) User/vendor approval, platform analytics

**Security Best Practices Applied:**
- Passwords hashed with BCrypt (never stored in plaintext)
- JWT tokens include user ID, email, role
- Auto-logout on 401 (unauthorized) responses
- CORS configured for specific origins only

## Development Workflows

### Backend Build & Run
```bash
# Development (port 8080, auto-restart)
cd backend
mvn spring-boot:run

# Production JAR (port 8081)
cd backend
mvn clean package -DskipTests
java -jar target/bookkaro-backend-1.0.0.jar
```

**Context path**: `/api/v1` (e.g., `http://localhost:8081/api/v1/services`)

### Frontend Setup
```bash
cd frontend
npm install
npm start  # Runs on port 3000
```

### Database Verification
```bash
$env:PGPASSWORD='root'
psql -U postgres -d bookkarodb -c "SELECT COUNT(*) FROM vendors; SELECT COUNT(*) FROM services;"
```

## Project-Specific Patterns

### Standard API Response Format
All endpoints return:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```
Use ApiResponse.success() and ApiResponse.error() static factory methods.

### DTO Naming Convention
- Request DTOs: *Request.java (e.g., LoginRequest, BookingRequest)
- Response DTOs: *Response.java or *Dto.java (e.g., AuthResponse, ServiceDto)
- Always map entities to DTOs in controllers - never expose entities directly

### Security Configuration Pattern
```java
// Public endpoints (no auth)
.requestMatchers("/auth/**", "/services/**").permitAll()

// Protected endpoints (JWT required)
.anyRequest().authenticated()
```

### Service Layer Transaction Management
Use @Transactional on service methods that modify data:
```java
@Transactional
public BookingDto createBooking(BookingRequest request) { ... }
```

## Common Integration Points

### Frontend → Backend API
```javascript
// API base: http://localhost:8081/api/v1
// JWT automatically added via axios interceptor in api.js
import { serviceAPI, bookingAPI, reviewAPI } from '../services/api';

// All API calls return response.data.data (nested structure)
const services = await serviceAPI.searchServices(category, city, page, size);
```

### Backend Validation Pattern
```java
// Use javax.validation annotations
@NotBlank(message = "Email is required")
@Email(message = "Invalid email format")
private String email;

// Controllers use @Valid
public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request)
```

### Error Handling Convention
- Global exception handler: GlobalExceptionHandler.java
- Custom exceptions in exception/ package
- Always return ApiResponse with meaningful error messages

## Data Initialization

### Test Data & Initialization

**DataInitializer.java** (@Order 1):
- 3 test users: user@bookkaro.com, vendor@bookkaro.com, admin@bookkaro.com
- Passwords: password123 (user/vendor), admin123 (admin)
- All Mumbai-based test accounts

**ComprehensiveDataInitializer.java** (@Order 3):
- 6 regional vendors across 6 cities
- Cities: Mumbai, Pune, Delhi, Bangalore, Thane, Navi Mumbai
- Vendor logins: [city]@bookkaro.com / vendor123
- Examples: mumbai@bookkaro.com, pune@bookkaro.com, delhi@bookkaro.com
- 25 services total (5+4+5+4+2+5 distribution)

**BookingReviewInitializer.java** (@Order 3):
- 30 sample bookings for user@bookkaro.com
- Mix of statuses: PENDING, CONFIRMED, COMPLETED, CANCELLED
- Reviews included for completed bookings

**Total Data**: 9 users, 6 vendors, 25 services, 30 sample bookings

## Key Files & Their Purpose

| File | Purpose | Critical Notes |
|------|---------|----------------|
| SecurityConfig.java | JWT + CORS setup | Frontend origin: http://localhost:3000 |
| DataInitializer.java | Creates 3 test users + 1 vendor + 3 services | @Order(1) - runs first |
| CSVDataLoader.java | Loads 150 vendors from CSV | @Order(2) - runs after DataInitializer |
| mumbai_vendors_150.csv | 150 Mumbai service vendors | Tracked in Git, loaded on first startup |
| application.properties | Database + server config | ddl-auto=validate (never change) |
| api.js (frontend) | Axios instance with JWT interceptor | Auto-redirects to /login on 401 |
| AuthContext.js (frontend) | Global auth state management | Stores token + user in localStorage |

## Phase Status & Boundaries

### Phase 1 - User Module (PRODUCTION READY) ✅
**Delivered Features (Iteratively Tested & Verified):**
- User registration/login with JWT authentication
- Show/hide password toggle with field-level validation
- Profile management with unsaved changes warning
- Service browsing/search (by category, location, with pagination)
- Enhanced error and no-results messaging with helpful suggestions
- Service details with improved UI and prominent booking CTA
- Booking creation with date/time selection
- Booking status tracking (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- Review & rating system (1-5 stars with comments)
- Favorites toggle on service cards
- Enhanced empty states for Bookings, Favorites, and Addresses pages
- Comprehensive support pages (FAQ, Help Center, Contact)

**Recent UI/UX Enhancements (October 2025)**:
1. **Login Page**: Password visibility toggle, field validation, specific error messages
2. **Profile Page**: Field-level errors, unsaved changes indicator with browser warning
3. **Support Pages**: FAQ with accordion UI, Help Center with topics, Contact form
4. **Service Search**: Error card with "Try Again" button, no-results with suggestions list
5. **Service Detail**: Fixed layout overflow, prominent booking card, proper text wrapping
6. **Empty States**: Beautiful cards with icons, benefits lists, and CTAs across 3 pages
7. **Favorites**: Toggle heart icon on service cards, add/remove functionality working

**Test Credentials:**
- User: user@bookkaro.com / password123
- Vendor: vendor@bookkaro.com / password123
- Admin: admin@bookkaro.com / admin123

### Phase 2 - Vendor Module (NOT STARTED)
**DO NOT implement vendor features unless explicitly requested:**
- Vendor dashboard and analytics
- Service management (create, update, delete services)
- Booking acceptance/rejection workflow
- Revenue tracking and reporting
- Customer communication tools

### Phase 3 - Admin Module (NOT STARTED)
**DO NOT implement admin features unless explicitly requested:**
- User and vendor approval workflows
- Platform-wide analytics and reporting
- Content moderation tools
- System configuration management

**Agile Principle**: Each phase follows complete cycles:
1. Requirements analysis
2. Implementation
3. Testing
4. Refinement
5. Production deployment

Only proceed to next phase when current phase is fully tested and production-ready.

## Testing & Verification

### Manual Testing Script
See test_user_module.ps1 for PowerShell script testing all 9 user features.

### Production Readiness
See documentation/PRODUCTION_READINESS_CHECKLIST.md for deployment checklist.

**Security TODOs** (not critical for development):
- Change database password from 'root'
- Update JWT secret from default key
- Configure production CORS domain
- Enable HTTPS/SSL

## When Making Changes

### Code Quality Checklist
1. **Follow Java Best Practices**:
   - Use meaningful variable/method names
   - Keep methods focused (single responsibility)
   - Add JavaDoc for public APIs
   - Use Lombok annotations to reduce boilerplate
   - Follow Spring Boot conventions

2. **Security Considerations**:
   - Never expose entities directly (always use DTOs)
   - Validate all user inputs with @Valid annotations
   - Hash passwords with BCrypt (never plaintext)
   - Check role permissions before sensitive operations
   - Update SecurityConfig for new endpoint access rules

3. **Database Changes**:
   - Schema modifications: Temporarily change ddl-auto=update, test, manual migration, revert to validate
   - Never change ddl-auto to create-drop (data loss)
   - Check documentation/DATABASE_SCHEMA.md before adding tables/columns
   - Use indexes for frequently queried columns

4. **API Development**:
   - All endpoints return ApiResponse<T> wrapper
   - Update SecurityConfig permitAll/authenticated rules for new endpoints
   - Create separate DTOs (never expose entities)
   - Add @Transactional to service methods that modify data
   - Document new endpoints in documentation/API_DOCUMENTATION.md

5. **Frontend Integration**:
   - Update corresponding service in api.js for new backend endpoints
   - Handle loading states and error messages
   - Validate forms before API calls
   - Store sensitive data (tokens) securely in localStorage

6. **Testing & Verification**:
   - Test all CRUD operations manually
   - Verify role-based access control
   - Check database persistence (data survives restart)
   - Ensure error messages are user-friendly
   - Update test_user_module.ps1 for new features

### Common Patterns to Follow

**Controller Pattern:**
```java
@RestController
@RequestMapping("/api/v1/resource")
@RequiredArgsConstructor
public class ResourceController {
    private final ResourceService service;
    
    @PostMapping
    public ResponseEntity<ApiResponse<ResourceDto>> create(@Valid @RequestBody ResourceRequest request) {
        ResourceDto result = service.create(request);
        return ResponseEntity.ok(ApiResponse.success("Resource created", result));
    }
}
```

**Service Pattern:**
```java
@Service
@RequiredArgsConstructor
@Transactional
public class ResourceService {
    private final ResourceRepository repository;
    
    public ResourceDto create(ResourceRequest request) {
        // Business logic here
        Resource entity = repository.save(resource);
        return mapToDto(entity);
    }
}
```

**Exception Handling:**
```java
// Custom exceptions in exception/ package
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

// Global handler catches and returns ApiResponse
@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(404)
        .body(ApiResponse.error(ex.getMessage(), null));
}
```

## Documentation References
- Architecture: documentation/ARCHITECTURE.md
- API Endpoints: documentation/API_DOCUMENTATION.md
- Database Schema: documentation/DATABASE_SCHEMA.md
- Production Checklist: documentation/PRODUCTION_READINESS_CHECKLIST.md
