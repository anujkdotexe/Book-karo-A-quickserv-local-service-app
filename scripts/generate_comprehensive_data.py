"""
Comprehensive Data Generator for BOOKKARO Platform
Generates realistic CSV data for all 24 tables with proper relationships
Minimum 500 records per major table with realistic Indian data
"""

import csv
import random
from datetime import datetime, timedelta
from faker import Faker
import hashlib

# Initialize Faker with Indian locale
fake = Faker(['en_IN'])
Faker.seed(12345)
random.seed(12345)

# Indian Cities with realistic postal codes and coordinates
CITIES = {
    'Mumbai': {
        'state': 'Maharashtra',
        'postal_codes': range(400001, 400104),
        'lat_range': (18.90, 19.27),
        'lon_range': (72.82, 72.98),
        'areas': ['Andheri', 'Bandra', 'Borivali', 'Dadar', 'Goregaon', 'Juhu', 'Kandivali', 'Malad', 'Powai', 'Santacruz', 'Vikhroli', 'Worli']
    },
    'Delhi': {
        'state': 'Delhi',
        'postal_codes': range(110001, 110097),
        'lat_range': (28.40, 28.88),
        'lon_range': (76.84, 77.34),
        'areas': ['Connaught Place', 'Karol Bagh', 'Lajpat Nagar', 'Nehru Place', 'Pitampura', 'Rohini', 'Saket', 'Dwarka', 'Janakpuri', 'Vasant Kunj']
    },
    'Bengaluru': {
        'state': 'Karnataka',
        'postal_codes': range(560001, 560110),
        'lat_range': (12.90, 13.07),
        'lon_range': (77.50, 77.70),
        'areas': ['Whitefield', 'Koramangala', 'Indiranagar', 'Jayanagar', 'HSR Layout', 'BTM Layout', 'Electronic City', 'Marathahalli', 'Yelahanka', 'JP Nagar']
    },
    'Pune': {
        'state': 'Maharashtra',
        'postal_codes': range(411001, 411062),
        'lat_range': (18.45, 18.63),
        'lon_range': (73.75, 73.93),
        'areas': ['Kothrud', 'Shivajinagar', 'Hinjewadi', 'Wakad', 'Viman Nagar', 'Hadapsar', 'Kharadi', 'Aundh', 'Pimpri', 'Chinchwad']
    },
    'Chennai': {
        'state': 'Tamil Nadu',
        'postal_codes': range(600001, 600126),
        'lat_range': (12.91, 13.13),
        'lon_range': (80.18, 80.30),
        'areas': ['T Nagar', 'Anna Nagar', 'Velachery', 'Adyar', 'Mylapore', 'Porur', 'Tambaram', 'Guindy', 'Nungambakkam', 'Perungudi']
    },
    'Hyderabad': {
        'state': 'Telangana',
        'postal_codes': range(500001, 500100),
        'lat_range': (17.36, 17.52),
        'lon_range': (78.36, 78.58),
        'areas': ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Kukatpally', 'Madhapur', 'HITECH City', 'Secunderabad', 'Begumpet', 'Ameerpet', 'Kondapur']
    },
    'Kolkata': {
        'state': 'West Bengal',
        'postal_codes': range(700001, 700157),
        'lat_range': (22.48, 22.65),
        'lon_range': (88.32, 88.43),
        'areas': ['Park Street', 'Salt Lake', 'Ballygunge', 'Alipore', 'Behala', 'Howrah', 'Rajarhat', 'New Town', 'Dum Dum', 'Jadavpur']
    },
    'Ahmedabad': {
        'state': 'Gujarat',
        'postal_codes': range(380001, 380061),
        'lat_range': (22.99, 23.11),
        'lon_range': (72.51, 72.64),
        'areas': ['Satellite', 'Vastrapur', 'Navrangpura', 'Bopal', 'Maninagar', 'Chandkheda', 'Gota', 'Thaltej', 'Paldi', 'SG Highway']
    }
}

# Service categories with realistic services
SERVICE_CATEGORIES = {
    1: {
        'name': 'Plumbing',
        'services': [
            ('Pipe Leak Repair', 399, 60), ('Drain Cleaning', 599, 90), ('Water Heater Installation', 1499, 120),
            ('Bathroom Fitting', 2499, 180), ('Kitchen Sink Installation', 899, 90), ('Tap Repair', 299, 45),
            ('Toilet Repair', 599, 90), ('Water Tank Cleaning', 1999, 120), ('Geyser Installation', 1299, 90),
            ('Basin Installation', 799, 60)
        ]
    },
    2: {
        'name': 'Electrical',
        'services': [
            ('Wiring Installation', 1999, 180), ('Switchboard Repair', 599, 60), ('Light Fixture Setup', 499, 45),
            ('Fan Installation', 699, 60), ('AC Installation', 2499, 120), ('Electrical Fault Diagnosis', 799, 90),
            ('MCB Installation', 899, 60), ('Inverter Installation', 3499, 150), ('Home Wiring', 4999, 240),
            ('Chandelier Installation', 1499, 90)
        ]
    },
    3: {
        'name': 'Home Cleaning',
        'services': [
            ('Deep House Cleaning', 2499, 240), ('Kitchen Deep Cleaning', 1499, 120), ('Bathroom Sanitization', 899, 90),
            ('Carpet Cleaning', 1299, 120), ('Sofa Cleaning', 999, 90), ('Window Cleaning', 799, 60),
            ('Floor Polishing', 1999, 180), ('Kitchen Chimney Cleaning', 799, 60), ('Balcony Cleaning', 599, 45),
            ('Apartment Deep Cleaning', 3999, 300)
        ]
    },
    4: {
        'name': 'Painting',
        'services': [
            ('Interior Wall Painting', 4999, 480), ('Exterior Wall Painting', 6999, 600), ('Wall Texturing', 3499, 360),
            ('Waterproofing', 2999, 240), ('Wood Polishing', 1999, 180), ('Metal Painting', 1499, 120),
            ('Ceiling Painting', 2499, 240), ('Door Painting', 899, 90), ('Window Frame Painting', 799, 60),
            ('Full Room Painting', 3999, 420)
        ]
    },
    5: {
        'name': 'Carpentry',
        'services': [
            ('Custom Wardrobe', 8999, 600), ('Furniture Repair', 1299, 120), ('Door Installation', 2999, 180),
            ('Kitchen Cabinets', 15999, 720), ('Bed Frame Repair', 1499, 90), ('Table Repair', 899, 60),
            ('Shelf Installation', 1999, 120), ('Cupboard Installation', 4999, 240), ('Wooden Flooring', 12999, 600),
            ('Partition Installation', 6999, 360)
        ]
    },
    6: {
        'name': 'Appliance Repair',
        'services': [
            ('AC Repair', 899, 90), ('Refrigerator Repair', 1299, 120), ('Washing Machine Repair', 999, 90),
            ('Microwave Repair', 699, 60), ('TV Repair', 1499, 120), ('Geyser Repair', 799, 75),
            ('RO Water Purifier Service', 599, 60), ('Dishwasher Repair', 1299, 90), ('Oven Repair', 899, 75),
            ('Chimney Repair', 999, 90)
        ]
    }
}

# Realistic Indian first and last names
INDIAN_FIRST_NAMES = [
    'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Arjun', 'Pooja', 'Raj', 'Neha',
    'Karan', 'Kavya', 'Rohan', 'Divya', 'Aditya', 'Shruti', 'Siddharth', 'Meera', 'Aman', 'Riya',
    'Akash', 'Isha', 'Nikhil', 'Tanvi', 'Harsh', 'Nisha', 'Varun', 'Simran', 'Gaurav', 'Aisha',
    'Manish', 'Swati', 'Sandeep', 'Preeti', 'Suresh', 'Rekha', 'Rajesh', 'Sunita', 'Deepak', 'Anita',
    'Sanjay', 'Geeta', 'Ramesh', 'Seema', 'Ashok', 'Lata', 'Vijay', 'Rani', 'Ajay', 'Manju'
]

INDIAN_LAST_NAMES = [
    'Sharma', 'Patel', 'Kumar', 'Singh', 'Verma', 'Gupta', 'Shah', 'Joshi', 'Reddy', 'Nair',
    'Menon', 'Iyer', 'Rao', 'Desai', 'Mehta', 'Agarwal', 'Kapoor', 'Malhotra', 'Chopra', 'Khanna',
    'Bansal', 'Jain', 'Sethi', 'Bhatia', 'Arora', 'Sinha', 'Mishra', 'Pandey', 'Tiwari', 'Dubey'
]

BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
PAYMENT_METHODS = ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'WALLET', 'CASH']
PAYMENT_STATUSES = ['PENDING', 'PROCESSING', 'PAID', 'FAILED']

# Review templates for realistic feedback
REVIEW_TEMPLATES = {
    5: [
        "Excellent service! {name} was very professional and completed the work perfectly. Highly recommended!",
        "Outstanding work by {name}. Very satisfied with the quality and punctuality. Will definitely book again!",
        "Amazing service! {name} was courteous, skilled, and finished the job on time. 5 stars!",
        "Best service I've received! {name} was thorough and professional. Absolutely worth it!",
        "Fantastic experience! {name} exceeded expectations. The work quality is top-notch!"
    ],
    4: [
        "Good service by {name}. Work was done well, just took a bit longer than expected.",
        "Happy with the service. {name} was skilled and the pricing was fair. Would recommend!",
        "Very good experience. {name} completed the work satisfactorily. Minor delays but overall great!",
        "Satisfied with {name}'s work. Professional approach and good quality. Will use again!",
        "Great service! {name} was knowledgeable and did a solid job. Slightly expensive but worth it."
    ],
    3: [
        "Average service. {name} got the job done but nothing exceptional. Acceptable for the price.",
        "Decent work by {name}. Some improvements needed but overall okay.",
        "Service was fine. {name} completed the work but could have been more thorough.",
        "It was okay. {name} did the basic job but I expected better quality.",
        "Fair service. {name} was on time but the execution could have been better."
    ],
    2: [
        "Below expectations. {name} completed the work but quality was not up to the mark.",
        "Disappointed with the service. {name} took too long and the result was mediocre.",
        "Not satisfied. {name} did finish the job but made several mistakes that needed fixing.",
        "Service needs improvement. {name} was late and the work quality was below average.",
        "Expected better. {name}'s work was hasty and required follow-up corrections."
    ],
    1: [
        "Very poor service. {name} was unprofessional and the work was substandard. Not recommended!",
        "Terrible experience. {name} damaged my property and didn't fix it properly. Avoid!",
        "Worst service ever. {name} was rude and the work quality was pathetic.",
        "Extremely disappointed. {name} took money but didn't complete the job properly.",
        "Don't waste your money! {name} provided very poor service and was unprofessional."
    ]
}

def generate_indian_name():
    """Generate realistic Indian name"""
    first = random.choice(INDIAN_FIRST_NAMES)
    last = random.choice(INDIAN_LAST_NAMES)
    return f"{first} {last}"

def generate_phone():
    """Generate Indian phone number"""
    return f"+91{random.randint(7000000000, 9999999999)}"

def generate_address_for_city(city):
    """Generate realistic address for a city"""
    city_data = CITIES[city]
    area = random.choice(city_data['areas'])
    street_num = random.randint(1, 999)
    street_names = ['Main Road', 'Link Road', 'Avenue', 'Street', 'Lane', 'Marg', 'Nagar', 'Colony']
    return f"{street_num} {area} {random.choice(street_names)}"

def generate_coordinates(city):
    """Generate coordinates within city bounds"""
    lat_range = CITIES[city]['lat_range']
    lon_range = CITIES[city]['lon_range']
    lat = round(random.uniform(lat_range[0], lat_range[1]), 4)
    lon = round(random.uniform(lon_range[0], lon_range[1]), 4)
    return lat, lon

def generate_date_range(start_days_ago=365, end_days_ago=0):
    """Generate random datetime within range"""
    start = datetime.now() - timedelta(days=start_days_ago)
    end = datetime.now() - timedelta(days=end_days_ago)
    random_date = start + (end - start) * random.random()
    return random_date.strftime('%Y-%m-%d %H:%M:%S')

def bcrypt_hash(password):
    """Simple password hash (in production use proper BCrypt)"""
    return f"$2a$10${hashlib.sha256(password.encode()).hexdigest()[:53]}"

print("🚀 Starting Comprehensive Data Generation for BOOKKARO...")
print("=" * 80)

# ============================================================================
# 1. GENERATE USERS (500+ records)
# ============================================================================
print("\n📝 Generating users.csv (500+ users)...")

users = []
user_id = 1

# Add 3 main accounts (MUST KEEP)
users.append({
    'id': user_id, 'email': 'admin@bookkaro.com', 'password': bcrypt_hash('Password@123'),
    'full_name': 'Admin User', 'phone': '+919876543210',
    'address': '123 Admin Office, Bandra', 'city': 'Mumbai', 'state': 'Maharashtra',
    'postal_code': '400050', 'latitude': '19.0596', 'longitude': '72.8295',
    'role': 'ADMIN', 'is_active': 'true', 'created_at': generate_date_range(730, 700)
})
user_id += 1

users.append({
    'id': user_id, 'email': 'user@bookkaro.com', 'password': bcrypt_hash('Password@123'),
    'full_name': 'Test User', 'phone': '+919876543211',
    'address': '456 User Home, Andheri', 'city': 'Mumbai', 'state': 'Maharashtra',
    'postal_code': '400053', 'latitude': '19.1136', 'longitude': '72.8697',
    'role': 'USER', 'is_active': 'true', 'created_at': generate_date_range(730, 700)
})
user_id += 1

users.append({
    'id': user_id, 'email': 'vendor@bookkaro.com', 'password': bcrypt_hash('Password@123'),
    'full_name': 'Test Vendor', 'phone': '+919876543212',
    'address': '789 Vendor Shop, Worli', 'city': 'Mumbai', 'state': 'Maharashtra',
    'postal_code': '400018', 'latitude': '19.0176', 'longitude': '72.8164',
    'role': 'VENDOR', 'is_active': 'true', 'created_at': generate_date_range(730, 700)
})
user_id += 1

# Add 25 vendor users (for 25 vendors) - minimal vendors, maximum services per vendor
vendor_user_ids = []
for i in range(25):
    city = random.choice(list(CITIES.keys()))
    city_data = CITIES[city]
    lat, lon = generate_coordinates(city)
    
    users.append({
        'id': user_id,
        'email': f'vendor{i+1}@bookkaro.com',
        'password': bcrypt_hash('vendor123'),
        'full_name': generate_indian_name(),
        'phone': generate_phone(),
        'address': generate_address_for_city(city),
        'city': city,
        'state': city_data['state'],
        'postal_code': str(random.choice(list(city_data['postal_codes']))),
        'latitude': str(lat),
        'longitude': str(lon),
        'role': 'VENDOR',
        'is_active': 'true',
        'created_at': generate_date_range(365, 30)
    })
    vendor_user_ids.append(user_id)
    user_id += 1

# Add 50 regular users - minimal users, they will create maximum bookings
regular_user_ids = []
for i in range(50):
    city = random.choice(list(CITIES.keys()))
    city_data = CITIES[city]
    lat, lon = generate_coordinates(city)
    
    users.append({
        'id': user_id,
        'email': f'user{i+1}@example.com',
        'password': bcrypt_hash('user123'),
        'full_name': generate_indian_name(),
        'phone': generate_phone(),
        'address': generate_address_for_city(city),
        'city': city,
        'state': city_data['state'],
        'postal_code': str(random.choice(list(city_data['postal_codes']))),
        'latitude': str(lat),
        'longitude': str(lon),
        'role': 'USER',
        'is_active': 'true',  # All active for maximum bookings
        'created_at': generate_date_range(365, 0)
    })
    regular_user_ids.append(user_id)
    user_id += 1

# Write users.csv
with open('d:/Springboard/csv files/users.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'email', 'password', 'full_name', 'phone', 'address', 'city', 'state', 
                  'postal_code', 'latitude', 'longitude', 'role', 'profile_picture', 'is_active', 
                  'reset_token', 'reset_token_expiry', 'created_at', 'created_by', 'updated_at', 
                  'updated_by', 'deleted_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for user in users:
        row = {k: user.get(k, '') for k in fieldnames}
        if 'created_at' in user:
            row['created_by'] = '1'
            row['updated_at'] = user['created_at']
            row['updated_by'] = '1'
        writer.writerow(row)

print(f"✅ Generated {len(users)} users")

print(f"✅ Generated {len(users)} users (3 main accounts + 25 vendors + 50 regular users)")

# ============================================================================
# 2. GENERATE USER_ROLES (78 records)
# ============================================================================
print("\n📝 Generating user_roles.csv...")
user_roles = []
role_id = 1

# Admin role
user_roles.append({'user_id': 1, 'role': 'ADMIN'})

# Test user role
user_roles.append({'user_id': 2, 'role': 'USER'})

# Test vendor role
user_roles.append({'user_id': 3, 'role': 'VENDOR'})

# Vendor roles
for vendor_id in vendor_user_ids:
    user_roles.append({'user_id': vendor_id, 'role': 'VENDOR'})

# Regular user roles
for user_id in regular_user_ids:
    user_roles.append({'user_id': user_id, 'role': 'USER'})

with open('d:/Springboard/csv files/user_roles.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['user_id', 'role'])
    writer.writeheader()
    writer.writerows(user_roles)

print(f"✅ Generated {len(user_roles)} user roles")

# ============================================================================
# 3. GENERATE CATEGORIES (6 records)
# ============================================================================
print("\n📝 Generating categories.csv...")
categories = []
for cat_id, cat_data in SERVICE_CATEGORIES.items():
    categories.append({
        'id': cat_id,
        'name': cat_data['name'],
        'description': f'Professional {cat_data["name"]} services',
        'icon': f'{cat_data["name"].lower()}.svg',
        'is_active': 'true',
        'display_order': cat_id,
        'created_at': generate_date_range(730, 700),
        'updated_at': generate_date_range(730, 700)
    })

with open('d:/Springboard/csv files/categories.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'name', 'description', 'icon', 'is_active', 'display_order', 'parent_category_id', 
                  'created_at', 'updated_at', 'deleted_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for cat in categories:
        row = {k: cat.get(k, '') for k in fieldnames}
        writer.writerow(row)

print(f"✅ Generated {len(categories)} categories")

# ============================================================================
# 4. GENERATE VENDORS (25 records - mapped to vendor users)
# ============================================================================
print("\n📝 Generating vendors.csv...")
vendors = []
vendor_id = 1

# Test vendor (id=3)
test_vendor_user = users[2]  # vendor@bookkaro.com
vendors.append({
    'id': vendor_id,
    'user_id': 3,
    'business_name': 'Test Vendor Services',
    'vendor_code': f'VEND{vendor_id:04d}',
    'primary_category': 'Plumbing',
    'category_id': 1,
    'description': 'Professional plumbing services in Mumbai',
    'contact_person': test_vendor_user['full_name'],
    'email': test_vendor_user['email'],
    'phone': test_vendor_user['phone'],
    'address': test_vendor_user['address'],
    'city': test_vendor_user['city'],
    'state': test_vendor_user['state'],
    'postal_code': test_vendor_user['postal_code'],
    'latitude': test_vendor_user['latitude'],
    'longitude': test_vendor_user['longitude'],
    'years_of_experience': 10,
    'availability': 'Mon-Sat 9AM-6PM',
    'approval_status': 'APPROVED',
    'is_verified': 'true',
    'is_active': 'true',
    'average_rating': '4.5',
    'total_reviews': 0,
    'created_at': test_vendor_user['created_at']
})
vendor_id += 1

# Generate vendors for vendor users
for v_user_id in vendor_user_ids:
    vendor_user = users[v_user_id - 1]  # users list is 0-indexed
    category = random.choice(list(SERVICE_CATEGORIES.values()))
    
    vendors.append({
        'id': vendor_id,
        'user_id': v_user_id,
        'business_name': f'{vendor_user["full_name"]} {category["name"]} Services',
        'vendor_code': f'VEND{vendor_id:04d}',
        'primary_category': category['name'],
        'category_id': [k for k, v in SERVICE_CATEGORIES.items() if v == category][0],
        'description': f'Professional {category["name"].lower()} services in {vendor_user["city"]}',
        'contact_person': vendor_user['full_name'],
        'email': vendor_user['email'],
        'phone': vendor_user['phone'],
        'address': vendor_user['address'],
        'city': vendor_user['city'],
        'state': vendor_user['state'],
        'postal_code': vendor_user['postal_code'],
        'latitude': vendor_user['latitude'],
        'longitude': vendor_user['longitude'],
        'years_of_experience': random.randint(2, 20),
        'availability': 'Mon-Sat 9AM-6PM',
        'approval_status': random.choice(['APPROVED', 'APPROVED', 'APPROVED', 'PENDING']),
        'is_verified': random.choice(['true', 'true', 'true', 'false']),
        'is_active': 'true',
        'average_rating': str(round(random.uniform(3.5, 5.0), 2)),
        'total_reviews': 0,
        'created_at': vendor_user['created_at']
    })
    vendor_id += 1

with open('d:/Springboard/csv files/vendors.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'user_id', 'business_name', 'vendor_code', 'primary_category', 'category_id', 
                  'description', 'contact_person', 'email', 'phone', 'address', 'city', 'state', 
                  'postal_code', 'location', 'latitude', 'longitude', 'years_of_experience', 
                  'availability', 'approval_status', 'approval_reason', 'rejection_reason', 
                  'suspension_reason', 'is_verified', 'is_active', 'average_rating', 'total_reviews', 
                  'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for vendor in vendors:
        row = {k: vendor.get(k, '') for k in fieldnames}
        row['created_by'] = '1'
        row['updated_at'] = vendor['created_at']
        row['updated_by'] = '1'
        writer.writerow(row)

print(f"✅ Generated {len(vendors)} vendors")

# ============================================================================
# 5. GENERATE SERVICES (500+ records - 20-25 services per vendor)
# ============================================================================
print("\n📝 Generating services.csv (500+ services)...")
services = []
service_id = 1

for vendor in vendors:
    vendor_city = vendor['city']
    # Each vendor offers 20-25 services
    num_services = random.randint(20, 25)
    
    for i in range(num_services):
        category_id = random.randint(1, 6)
        category_data = SERVICE_CATEGORIES[category_id]
        service_info = random.choice(category_data['services'])
        
        services.append({
            'id': service_id,
            'vendor_id': vendor['id'],
            'service_name': service_info[0],
            'category': category_data['name'],
            'category_id': category_id,
            'description': f'{service_info[0]} by {vendor["business_name"]} - Expert service with quality guarantee',
            'price': str(service_info[1]),
            'duration_minutes': service_info[2],
            'address': vendor['address'],
            'city': vendor_city,  # SAME city as vendor
            'state': vendor['state'],
            'postal_code': vendor['postal_code'],
            'latitude': vendor['latitude'],
            'longitude': vendor['longitude'],
            'available_from_time': '09:00:00',
            'available_to_time': '18:00:00',
            'is_available': random.choice(['true', 'true', 'true', 'false']),
            'is_featured': random.choice(['true', 'false', 'false', 'false']),
            'approval_status': 'APPROVED',
            'average_rating': '0',  # Will be calculated from reviews
            'total_reviews': 0,
            'is_active': 'true',
            'created_at': generate_date_range(365, 30),
            'updated_at': generate_date_range(365, 30)
        })
        service_id += 1

with open('d:/Springboard/csv files/services.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'vendor_id', 'service_name', 'category', 'category_id', 'category_legacy', 
                  'description', 'price', 'duration_minutes', 'address', 'city', 'state', 'postal_code', 
                  'latitude', 'longitude', 'available_from_time', 'available_to_time', 'is_available', 
                  'is_featured', 'approval_status', 'approval_reason', 'rejection_reason', 
                  'average_rating', 'total_reviews', 'is_active', 'created_at', 'updated_at', 'deleted_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for service in services:
        row = {k: service.get(k, '') for k in fieldnames}
        writer.writerow(row)

print(f"✅ Generated {len(services)} services")

# ============================================================================
# 6. GENERATE REVIEWS (40-60 per service = 20,000-30,000 reviews!)
# ============================================================================
print("\n📝 Generating reviews.csv (40-60 per service = 20,000+ reviews)...")
reviews = []
review_id = 1

# Track ratings per service for calculating averages
service_ratings = {}

for service in services:
    # Each service gets 40-60 reviews
    num_reviews = random.randint(40, 60)
    service_reviews = []
    
    for i in range(num_reviews):
        # Reviewer is random user
        reviewer_id = random.choice(regular_user_ids + [2])  # Include test user
        reviewer = users[reviewer_id - 1]
        
        # Rating follows realistic distribution (more 4-5 stars)
        rating = random.choices([1, 2, 3, 4, 5], weights=[5, 10, 15, 35, 35])[0]
        
        # Generate realistic review comment
        reviewer_name = reviewer['full_name'].split()[0]
        comment_template = random.choice(REVIEW_TEMPLATES[rating])
        comment = comment_template.format(name=service['service_name'])
        
        review_date = generate_date_range(180, 0)
        
        reviews.append({
            'id': review_id,
            'user_id': reviewer_id,
            'service_id': service['id'],
            'booking_id': '',  # Can be linked later
            'rating': rating,
            'comment': comment,
            'reviewer_name': reviewer['full_name'],
            'helpful_count': random.randint(0, 50),
            'is_verified_booking': random.choice(['true', 'true', 'false']),
            'created_at': review_date,
            'updated_at': review_date
        })
        
        service_reviews.append(rating)
        review_id += 1
    
    # Calculate average rating for service
    avg_rating = round(sum(service_reviews) / len(service_reviews), 2)
    service_ratings[service['id']] = {
        'average_rating': str(avg_rating),
        'total_reviews': len(service_reviews)
    }

with open('d:/Springboard/csv files/reviews.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'user_id', 'service_id', 'booking_id', 'vendor_id', 'rating', 'comment', 
                  'reviewer_name', 'helpful_count', 'is_verified_booking', 'created_at', 'created_by', 
                  'updated_at', 'updated_by', 'deleted_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for review in reviews:
        row = {k: review.get(k, '') for k in fieldnames}
        row['created_by'] = str(review['user_id'])
        row['updated_by'] = str(review['user_id'])
        writer.writerow(row)

print(f"✅ Generated {len(reviews)} reviews")

# Update services with review stats
print("\n📝 Updating services.csv with review statistics...")
for service in services:
    if service['id'] in service_ratings:
        service['average_rating'] = service_ratings[service['id']]['average_rating']
        service['total_reviews'] = service_ratings[service['id']]['total_reviews']

# Rewrite services.csv with updated stats
with open('d:/Springboard/csv files/services.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'vendor_id', 'service_name', 'category', 'category_id', 'category_legacy', 
                  'description', 'price', 'duration_minutes', 'address', 'city', 'state', 'postal_code', 
                  'latitude', 'longitude', 'available_from_time', 'available_to_time', 'is_available', 
                  'is_featured', 'approval_status', 'approval_reason', 'rejection_reason', 
                  'average_rating', 'total_reviews', 'is_active', 'created_at', 'updated_at', 'deleted_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for service in services:
        row = {k: service.get(k, '') for k in fieldnames}
        writer.writerow(row)

print("✅ Services updated with review statistics")

# Continue with bookings, addresses, etc. in next part...
print("\n✅ Phase 1 Complete: Users, Vendors, Services, Reviews generated!")
print(f"   - Users: {len(users)}")
print(f"   - Vendors: {len(vendors)}")  
print(f"   - Services: {len(services)}")
print(f"   - Reviews: {len(reviews)}")
print("=" * 80)
