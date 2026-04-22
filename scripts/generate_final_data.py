"""
Final Comprehensive Data Generator for BOOKKARO Platform
Generates realistic CSV data matching exact database schema
Includes required test accounts with plain passwords
"""

import csv
import random
from datetime import datetime, timedelta
from faker import Faker

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
    'Pune': {
        'state': 'Maharashtra',
        'postal_codes': range(411001, 411062),
        'lat_range': (18.45, 18.63),
        'lon_range': (73.75, 73.93),
        'areas': ['Kothrud', 'Shivajinagar', 'Hinjewadi', 'Wakad', 'Viman Nagar', 'Hadapsar', 'Kharadi', 'Aundh', 'Pimpri', 'Chinchwad']
    },
    'Bengaluru': {
        'state': 'Karnataka',
        'postal_codes': range(560001, 560110),
        'lat_range': (12.90, 13.07),
        'lon_range': (77.50, 77.70),
        'areas': ['Whitefield', 'Koramangala', 'Indiranagar', 'Jayanagar', 'HSR Layout', 'BTM Layout', 'Electronic City', 'Marathahalli', 'Yelahanka', 'JP Nagar']
    },
    'Chennai': {
        'state': 'Tamil Nadu',
        'postal_codes': range(600001, 600126),
        'lat_range': (12.90, 13.20),
        'lon_range': (80.10, 80.30),
        'areas': ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Tambaram', 'Sholinganallur', 'Porur', 'OMR', 'ECR', 'Guindy']
    },
    'Hyderabad': {
        'state': 'Telangana',
        'postal_codes': range(500001, 500096),
        'lat_range': (17.30, 17.55),
        'lon_range': (78.35, 78.57),
        'areas': ['Hitech City', 'Gachibowli', 'Madhapur', 'Kukatpally', 'Begumpet', 'Secunderabad', 'Banjara Hills', 'Jubilee Hills', 'Kondapur', 'Miyapur']
    },
    'Kolkata': {
        'state': 'West Bengal',
        'postal_codes': range(700001, 700157),
        'lat_range': (22.47, 22.65),
        'lon_range': (88.32, 88.42),
        'areas': ['Salt Lake', 'New Town', 'Park Street', 'Ballygunge', 'Alipore', 'Howrah', 'Jadavpur', 'Rajarhat', 'Behala', 'Dum Dum']
    },
    'Ahmedabad': {
        'state': 'Gujarat',
        'postal_codes': range(380001, 380061),
        'lat_range': (22.97, 23.11),
        'lon_range': (72.50, 72.68),
        'areas': ['Satellite', 'Maninagar', 'Vastrapur', 'Navrangpura', 'CG Road', 'SG Highway', 'Bopal', 'Thaltej', 'Paldi', 'Naranpura']
    },
    'Jaipur': {
        'state': 'Rajasthan',
        'postal_codes': range(302001, 302043),
        'lat_range': (26.84, 26.99),
        'lon_range': (75.73, 75.87),
        'areas': ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'C-Scheme', 'MI Road', 'Tonk Road', 'Jhotwara', 'Jagatpura', 'Sitapura', 'Sanganer']
    }
}

INDIAN_FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan', 'Reyansh',
                      'Ananya', 'Diya', 'Aadhya', 'Saanvi', 'Anvi', 'Kavya', 'Pari', 'Navya', 'Angel', 'Anika',
                      'Rahul', 'Rohan', 'Karan', 'Vikram', 'Amit', 'Raj', 'Nikhil', 'Sanjay', 'Deepak', 'Vijay',
                      'Priya', 'Neha', 'Pooja', 'Riya', 'Isha', 'Meera', 'Shreya', 'Anjali', 'Preeti', 'Rani']

INDIAN_LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Nair', 'Iyer', 'Rao',
                     'Mehta', 'Joshi', 'Agarwal', 'Chopra', 'Kapoor', 'Malhotra', 'Menon', 'Pillai', 'Krishnan', 'Bhatia',
                     'Desai', 'Shah', 'Jain', 'Sethi', 'Khanna', 'Devi', 'Banerjee', 'Chatterjee', 'Mukherjee', 'Arora']

# Service categories and types
CATEGORIES = [
    {'name': 'Plumbing', 'slug': 'plumbing-and-water', 'desc': 'Pipe repair, installations and leak detection.'},
    {'name': 'Electrical', 'slug': 'electrical-work', 'desc': 'Wiring, repair and fault fixing.'},
    {'name': 'Painting', 'slug': 'painting-and-decor', 'desc': 'Interior and exterior and specialized painting.'},
    {'name': 'Home Services', 'slug': 'home-general', 'desc': 'General home services.'},
    {'name': 'Logistics', 'slug': 'logistics', 'desc': 'Packing and moving services.'},
    {'name': 'IT & Software', 'slug': 'it-and-web', 'desc': 'IT support, networking and web dev.'}
]

SERVICE_TYPES = {
    'Plumbing': ['Pipe Repair', 'Tap Installation', 'Leak Detection', 'Bathroom Fitting', 'Kitchen Plumbing', 'Drain Cleaning', 'Water Tank Repair', 'Geyser Installation', 'Pipeline Installation', 'Septic Tank Cleaning'],
    'Electrical': ['Wiring', 'Fan Installation', 'Light Fitting', 'Switch Repair', 'Circuit Breaker', 'Electrical Fault Detection', 'AC Wiring', 'MCB Installation', 'Earthing Work', 'Electrical Maintenance'],
    'Painting': ['Interior Painting', 'Exterior Painting', 'Wall Texture', 'Waterproofing', 'Wood Polishing', 'Asian Paints', 'Nerolac Painting', 'Berger Premium', 'Wall Stencil', 'Epoxy Flooring'],
    'Home Services': ['Home Cleaning', 'Deep Cleaning', 'Sofa Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning', 'Carpet Cleaning', 'Pest Control', 'Gardening', 'AC Service', 'Refrigerator Repair'],
    'Logistics': ['Home Relocation', 'Office Moving', 'Packing Services', 'Vehicle Transportation', 'Furniture Moving', 'Interstate Moving', 'Warehouse Storage', 'Loading Unloading', 'Bike Transport', 'Car Transport'],
    'IT & Software': ['Computer Repair', 'Laptop Service', 'Network Setup', 'CCTV Installation', 'Software Installation', 'Data Recovery', 'Virus Removal', 'WiFi Setup', 'Printer Repair', 'Website Development']
}

REVIEW_TEMPLATES = {
    5: [
        "Excellent service! {name} was very professional and completed the work perfectly. Highly recommend!",
        "Outstanding work by {name}. Very punctual and the quality is top-notch. Will definitely hire again.",
        "Amazing experience! {name} did a fantastic job. Very satisfied with the service quality.",
        "Perfect service! {name} was courteous, skilled, and finished everything on time. 5 stars!",
        "Highly professional! {name} exceeded my expectations. Best service in the city!"
    ],
    4: [
        "Good service by {name}. Work was done well, minor delay but overall satisfied.",
        "Very good experience. {name} was professional and the work quality is good.",
        "Happy with the service. {name} completed the work properly. Would recommend.",
        "Nice work by {name}. Professional approach and good quality. Satisfied.",
        "Good job overall. {name} was skilled and the service was worth the price."
    ],
    3: [
        "Average service. {name} did the work but could have been more thorough.",
        "Okay experience. {name} completed the job but some improvements needed.",
        "Service was fine. {name} was professional but the quality could be better.",
        "Decent work by {name}. Nothing exceptional but job was done.",
        "Satisfactory service. {name} needs to improve attention to detail."
    ],
    2: [
        "Not very satisfied. {name} took too long and work quality was below expectations.",
        "Poor experience. {name} was unprofessional and the work needed rework.",
        "Disappointed with service. {name} did not meet expectations. Not recommended.",
        "Below average work. {name} was late and the quality was not good.",
        "Not happy. {name} needs to improve both punctuality and work quality."
    ],
    1: [
        "Very bad experience. {name} did not complete the work properly. Waste of money.",
        "Terrible service! {name} was unprofessional and the work was completely unsatisfactory.",
        "Worst experience ever. {name} did not know the job. Do not hire!",
        "Extremely disappointed. {name} caused more problems than solutions.",
        "Horrible service. {name} was rude and incompetent. Never again!"
    ]
}

def random_date(start_date, end_date):
    """Generate random datetime between two dates"""
    time_delta = end_date - start_date
    random_days = random.randint(0, time_delta.days)
    random_seconds = random.randint(0, 86400)
    return start_date + timedelta(days=random_days, seconds=random_seconds)

def indian_name():
    """Generate random Indian name"""
    return f"{random.choice(INDIAN_FIRST_NAMES)} {random.choice(INDIAN_LAST_NAMES)}"

def indian_phone():
    """Generate random Indian phone number"""
    return f"+91{random.randint(7000000000, 9999999999)}"

def get_city_details(city_name):
    """Get random location details for a city"""
    city = CITIES[city_name]
    lat = round(random.uniform(city['lat_range'][0], city['lat_range'][1]), 4)
    lon = round(random.uniform(city['lon_range'][0], city['lon_range'][1]), 4)
    postal = random.choice(list(city['postal_codes']))
    area = random.choice(city['areas'])
    return {
        'state': city['state'],
        'postal_code': str(postal),
        'lat': lat,
        'lon': lon,
        'area': area
    }

print("\n🚀 Starting Final Comprehensive Data Generation for BOOKKARO...\n")

# ===================================
# STEP 1: Generate users.csv
# ===================================
print("📝 Generating users.csv with test accounts...")

users = []
user_id = 1

# Required test accounts with plain password
test_accounts = [
    {'email': 'admin@bookkaro.com', 'name': 'Admin User', 'role': 'ADMIN', 'city': 'Mumbai'},
    {'email': 'user@bookkaro.com', 'name': 'Test User', 'role': 'USER', 'city': 'Mumbai'},
    {'email': 'mumbai@bookkaro.com', 'name': 'Mumbai Vendor', 'role': 'VENDOR', 'city': 'Mumbai'},
    {'email': 'pune@bookkaro.com', 'name': 'Pune Vendor', 'role': 'VENDOR', 'city': 'Pune'}
]

for acc in test_accounts:
    city_data = get_city_details(acc['city'])
    users.append({
        'id': user_id,
        'email': acc['email'],
        'password': 'Password@123',  # Plain password as requested
        'full_name': acc['name'],
        'phone': indian_phone(),
        'address': f"{random.randint(1, 999)} {city_data['area']}",
        'city': acc['city'],
        'state': city_data['state'],
        'postal_code': city_data['postal_code'],
        'latitude': city_data['lat'],
        'longitude': city_data['lon'],
        'role': acc['role'],
        'profile_picture': '',
        'is_active': 'true',
        'reset_token': '',
        'reset_token_expiry': '',
        'created_at': datetime(2023, 11, 1, 9, 0, 0).strftime('%Y-%m-%d %H:%M:%S'),
        'created_by': 1,
        'updated_at': datetime(2023, 11, 1, 9, 0, 0).strftime('%Y-%m-%d %H:%M:%S'),
        'updated_by': 1,
        'deleted_at': ''
    })
    user_id += 1

# Generate 24 additional vendor users (total 26 vendors)
vendor_cities = list(CITIES.keys())
for i in range(24):
    city = random.choice(vendor_cities)
    city_data = get_city_details(city)
    users.append({
        'id': user_id,
        'email': f"vendor{user_id}@bookkaro.com",
        'password': 'Password@123',
        'full_name': indian_name(),
        'phone': indian_phone(),
        'address': f"{random.randint(1, 999)} {city_data['area']}",
        'city': city,
        'state': city_data['state'],
        'postal_code': city_data['postal_code'],
        'latitude': city_data['lat'],
        'longitude': city_data['lon'],
        'role': 'VENDOR',
        'profile_picture': '',
        'is_active': 'true',
        'reset_token': '',
        'reset_token_expiry': '',
        'created_at': random_date(datetime(2023, 11, 1), datetime(2025, 11, 1)).strftime('%Y-%m-%d %H:%M:%S'),
        'created_by': 1,
        'updated_at': random_date(datetime(2023, 11, 1), datetime(2025, 11, 1)).strftime('%Y-%m-%d %H:%M:%S'),
        'updated_by': 1,
        'deleted_at': ''
    })
    user_id += 1

# Generate 50 regular users
for i in range(50):
    city = random.choice(list(CITIES.keys()))
    city_data = get_city_details(city)
    users.append({
        'id': user_id,
        'email': f"user{user_id}@bookkaro.com",
        'password': 'Password@123',
        'full_name': indian_name(),
        'phone': indian_phone(),
        'address': f"{random.randint(1, 999)} {city_data['area']}",
        'city': city,
        'state': city_data['state'],
        'postal_code': city_data['postal_code'],
        'latitude': city_data['lat'],
        'longitude': city_data['lon'],
        'role': 'USER',
        'profile_picture': '',
        'is_active': 'true',
        'reset_token': '',
        'reset_token_expiry': '',
        'created_at': random_date(datetime(2023, 11, 1), datetime(2025, 11, 1)).strftime('%Y-%m-%d %H:%M:%S'),
        'created_by': 1,
        'updated_at': random_date(datetime(2023, 11, 1), datetime(2025, 11, 1)).strftime('%Y-%m-%d %H:%M:%S'),
        'updated_by': 1,
        'deleted_at': ''
    })
    user_id += 1

with open('d:/Springboard/csv files/users.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'email', 'password', 'full_name', 'phone', 'address', 'city', 'state', 'postal_code', 'latitude', 'longitude', 'role', 'profile_picture', 'is_active', 'reset_token', 'reset_token_expiry', 'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at'])
    writer.writeheader()
    writer.writerows(users)

print(f"✅ Generated {len(users)} users (4 test accounts + 24 vendors + 50 regular users)")

# ===================================
# STEP 2: Generate user_roles.csv
# ===================================
print("📝 Generating user_roles.csv...")

user_roles = []
for user in users:
    user_roles.append({
        'id': user['id'],
        'user_id': user['id'],
        'role_name': user['role'],
        'granted_at': user['created_at'],
        'granted_by': 1,
        'is_active': 'true',
        'created_at': user['created_at'],
        'updated_at': user['updated_at']
    })

with open('d:/Springboard/csv files/user_roles.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'user_id', 'role_name', 'granted_at', 'granted_by', 'is_active', 'created_at', 'updated_at'])
    writer.writeheader()
    writer.writerows(user_roles)

print(f"✅ Generated {len(user_roles)} user roles")

# ===================================
# STEP 3: Generate categories.csv
# ===================================
print("📝 Generating categories.csv...")

categories = []
for i, cat in enumerate(CATEGORIES, 1):
    categories.append({
        'id': i,
        'name': cat['name'],
        'slug': cat['slug'],
        'parent_id': '',
        'description': cat['desc'],
        'is_active': 'true',
        'created_at': datetime(2025, 11, 7, 12, 0, 0).strftime('%Y-%m-%d %H:%M:%S'),
        'created_by': 1,
        'updated_at': datetime(2025, 11, 7, 12, 0, 0).strftime('%Y-%m-%d %H:%M:%S'),
        'updated_by': 1,
        'deleted_at': ''
    })

with open('d:/Springboard/csv files/categories.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'name', 'slug', 'parent_id', 'description', 'is_active', 'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at'])
    writer.writeheader()
    writer.writerows(categories)

print(f"✅ Generated {len(categories)} categories")

# ===================================
# STEP 4: Generate vendors.csv
# ===================================
print("📝 Generating vendors.csv...")

vendor_users = [u for u in users if u['role'] == 'VENDOR']
vendors = []
vendor_id = 1

for vendor_user in vendor_users:
    category = random.choice(categories)
    vendors.append({
        'id': vendor_id,
        'user_id': vendor_user['id'],
        'business_name': f"{vendor_user['full_name']} Services",
        'vendor_code': f"VEND{str(vendor_id).zfill(4)}",
        'primary_category': category['name'],
        'category_id': category['id'],
        'description': f"Professional {category['name']} services in {vendor_user['city']}",
        'contact_person': vendor_user['full_name'],
        'email': vendor_user['email'],
        'phone': vendor_user['phone'],
        'address': vendor_user['address'],
        'city': vendor_user['city'],
        'state': vendor_user['state'],
        'postal_code': vendor_user['postal_code'],
        'location': '',
        'latitude': vendor_user['latitude'],
        'longitude': vendor_user['longitude'],
        'years_of_experience': random.randint(2, 20),
        'availability': 'Mon-Sat 9AM-6PM',
        'approval_status': 'APPROVED',
        'approval_reason': '',
        'rejection_reason': '',
        'suspension_reason': '',
        'is_verified': 'true',
        'is_active': 'true',
        'average_rating': '0.00',
        'total_reviews': '0',
        'created_at': vendor_user['created_at'],
        'created_by': vendor_user['id'],
        'updated_at': vendor_user['updated_at'],
        'updated_by': vendor_user['id'],
        'deleted_at': ''
    })
    vendor_id += 1

with open('d:/Springboard/csv files/vendors.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'user_id', 'business_name', 'vendor_code', 'primary_category', 'category_id', 'description', 'contact_person', 'email', 'phone', 'address', 'city', 'state', 'postal_code', 'location', 'latitude', 'longitude', 'years_of_experience', 'availability', 'approval_status', 'approval_reason', 'rejection_reason', 'suspension_reason', 'is_verified', 'is_active', 'average_rating', 'total_reviews', 'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at'])
    writer.writeheader()
    writer.writerows(vendors)

print(f"✅ Generated {len(vendors)} vendors")

# ===================================
# STEP 5: Generate services.csv (500+ services, 20-25 per vendor)
# ===================================
print("📝 Generating services.csv (500+ services)...")

services = []
service_id = 1

for vendor in vendors:
    vendor_category = next(cat for cat in categories if cat['id'] == vendor['category_id'])
    service_types = SERVICE_TYPES[vendor_category['name']]
    
    # Each vendor gets 20-25 services
    num_services = random.randint(20, 25)
    for _ in range(num_services):
        service_type = random.choice(service_types)
        base_price = random.choice([299, 399, 499, 599, 699, 799, 999, 1299, 1499, 1999])
        
        services.append({
            'id': service_id,
            'vendor_id': vendor['id'],
            'category_id': vendor['category_id'],
            'service_name': service_type,
            'description': f"Professional {service_type} service in {vendor['city']}",
            'price': f"{base_price}.00",
            'duration': random.choice([30, 45, 60, 90, 120]),
            'unit': 'mins',
            'availability_status': 'AVAILABLE',
            'city': vendor['city'],
            'state': vendor['state'],
            'postal_code': vendor['postal_code'],
            'latitude': vendor['latitude'],
            'longitude': vendor['longitude'],
            'is_active': 'true',
            'average_rating': '',
            'total_reviews': '',
            'total_bookings': '',
            'created_at': random_date(datetime(2023, 11, 1), datetime(2025, 11, 1)).strftime('%Y-%m-%d %H:%M:%S'),
            'created_by': vendor['user_id'],
            'updated_at': random_date(datetime(2023, 11, 1), datetime(2025, 11, 1)).strftime('%Y-%m-%d %H:%M:%S'),
            'updated_by': vendor['user_id'],
            'deleted_at': ''
        })
        service_id += 1

with open('d:/Springboard/csv files/services.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'vendor_id', 'category_id', 'service_name', 'description', 'price', 'duration', 'unit', 'availability_status', 'city', 'state', 'postal_code', 'latitude', 'longitude', 'is_active', 'average_rating', 'total_reviews', 'total_bookings', 'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at'])
    writer.writeheader()
    writer.writerows(services)

print(f"✅ Generated {len(services)} services")

print(f"\n✅ Phase 1 Complete: Users ({len(users)}), Vendors ({len(vendors)}), Services ({len(services)}) generated!")
print("📌 All test accounts use password: Password@123")
print("📌 Ready for Phase 2: bookings, reviews, addresses, etc.")
