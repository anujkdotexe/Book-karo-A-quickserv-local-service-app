"""
Phase 2: Generate bookings, reviews, addresses, payments, etc.
Loads data from Phase 1 and creates comprehensive relationships
"""

import csv
import random
from datetime import datetime, timedelta
from faker import Faker

fake = Faker(['en_IN'])
Faker.seed(12345)
random.seed(12345)

INDIAN_FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan', 'Reyansh',
                      'Ananya', 'Diya', 'Aadhya', 'Saanvi', 'Anvi', 'Kavya', 'Pari', 'Navya', 'Angel', 'Anika',
                      'Rahul', 'Rohan', 'Karan', 'Vikram', 'Amit', 'Raj', 'Nikhil', 'Sanjay', 'Deepak', 'Vijay',
                      'Priya', 'Neha', 'Pooja', 'Riya', 'Isha', 'Meera', 'Shreya', 'Anjali', 'Preeti', 'Rani']

INDIAN_LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Nair', 'Iyer', 'Rao',
                     'Mehta', 'Joshi', 'Agarwal', 'Chopra', 'Kapoor', 'Malhotra', 'Menon', 'Pillai', 'Krishnan', 'Bhatia']

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
    time_delta = end_date - start_date
    random_days = random.randint(0, time_delta.days)
    random_seconds = random.randint(0, 86400)
    return start_date + timedelta(days=random_days, seconds=random_seconds)

def indian_name():
    return f"{random.choice(INDIAN_FIRST_NAMES)} {random.choice(INDIAN_LAST_NAMES)}"

print("\n📥 Loading generated data from Phase 1...")

# Load users
users = []
with open('d:/Springboard/csv files/users.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    users = list(reader)

# Load vendors
vendors = []
with open('d:/Springboard/csv files/vendors.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    vendors = list(reader)

# Load services
services = []
with open('d:/Springboard/csv files/services.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    services = list(reader)

print(f"✅ Loaded {len(users)} users, {len(vendors)} vendors, {len(services)} services")

# Filter regular users
regular_users = [u for u in users if u['role'] == 'USER']

# ===================================
# STEP 1: Generate addresses.csv (200+ addresses)
# ===================================
print("\n📝 Generating addresses.csv (200+ addresses)...")

addresses = []
address_id = 1

for user in users:
    num_addresses = random.randint(2, 4)
    for i in range(num_addresses):
        addresses.append({
            'id': address_id,
            'user_id': user['id'],
            'address_line1': f"{random.randint(1, 999)} {user['address'].split()[-1]}",
            'address_line2': '',
            'landmark': random.choice(['Near Metro', 'Near Mall', 'Near Park', 'Near Hospital', '']),
            'city': user['city'],
            'state': user['state'],
            'postal_code': user['postal_code'],
            'address_type': random.choice(['HOME', 'WORK', 'OTHER']),
            'is_default': 'true' if i == 0 else 'false',
            'latitude': user['latitude'],
            'longitude': user['longitude'],
            'is_active': 'true',
            'created_at': random_date(datetime(2023, 11, 1), datetime(2025, 11, 1)).strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': '',
            'deleted_at': ''
        })
        address_id += 1

with open('d:/Springboard/csv files/addresses.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'user_id', 'address_line1', 'address_line2', 'landmark', 'city', 'state', 'postal_code', 'address_type', 'is_default', 'latitude', 'longitude', 'is_active', 'created_at', 'updated_at', 'deleted_at'])
    writer.writeheader()
    writer.writerows(addresses)

print(f"✅ Generated {len(addresses)} addresses")

# ===================================
# STEP 2: Generate bookings.csv (1000+ bookings)
# ===================================
print("📝 Generating bookings.csv (1000+ bookings)...")

bookings = []
booking_id = 1

for user in regular_users:
    num_bookings = random.randint(15, 25)
    for _ in range(num_bookings):
        service = random.choice(services)
        vendor = next(v for v in vendors if v['id'] == service['vendor_id'])
        booking_date = random_date(datetime(2023, 11, 1), datetime(2025, 11, 15))
        
        status_choices = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
        status_weights = [0.05, 0.10, 0.80, 0.05]
        status = random.choices(status_choices, weights=status_weights)[0]
        
        bookings.append({
            'id': booking_id,
            'user_id': user['id'],
            'service_id': service['id'],
            'vendor_id': vendor['id'],
            'booking_date': booking_date.strftime('%Y-%m-%d'),
            'booking_time': f"{random.randint(9, 18):02d}:00:00",
            'status': status,
            'total_amount': service['price'],
            'payment_status': 'PAID' if status == 'COMPLETED' else 'PENDING',
            'booking_notes': '',
            'cancellation_reason': 'Customer request' if status == 'CANCELLED' else '',
            'address_id': random.choice([a['id'] for a in addresses if a['user_id'] == user['id']]),
            'created_at': booking_date.strftime('%Y-%m-%d %H:%M:%S'),
            'created_by': user['id'],
            'updated_at': booking_date.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_by': user['id'],
            'deleted_at': ''
        })
        booking_id += 1

with open('d:/Springboard/csv files/bookings.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'user_id', 'service_id', 'vendor_id', 'booking_date', 'booking_time', 'status', 'total_amount', 'payment_status', 'booking_notes', 'cancellation_reason', 'address_id', 'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at'])
    writer.writeheader()
    writer.writerows(bookings)

print(f"✅ Generated {len(bookings)} bookings")

# ===================================
# STEP 3: Generate reviews.csv (40-60 per service)
# ===================================
print("📝 Generating reviews.csv (40-60 per service = 20,000+ reviews)...")

reviews = []
review_id = 1

# Get completed bookings
completed_bookings = [b for b in bookings if b['status'] == 'COMPLETED']

for service in services:
    service_bookings = [b for b in completed_bookings if b['service_id'] == service['id']]
    
    # Generate 40-60 reviews per service
    num_reviews = random.randint(40, 60)
    
    for i in range(num_reviews):
        if service_bookings:
            booking = random.choice(service_bookings)
        else:
            # If no completed bookings for this service, create a dummy booking reference
            booking = {'id': booking_id, 'user_id': random.choice(regular_users)['id'], 'vendor_id': service['vendor_id']}
            booking_id += 1
        
        rating = random.choices([1, 2, 3, 4, 5], weights=[0.02, 0.03, 0.10, 0.30, 0.55])[0]
        reviewer_name = indian_name()
        review_text = random.choice(REVIEW_TEMPLATES[rating]).format(name=service['service_name'])
        
        review_date = random_date(datetime(2024, 1, 1), datetime(2025, 11, 15))
        
        reviews.append({
            'id': review_id,
            'booking_id': booking['id'],
            'user_id': booking['user_id'],
            'service_id': service['id'],
            'vendor_id': booking['vendor_id'],
            'rating': rating,
            'review_text': review_text,
            'reviewer_name': reviewer_name,
            'is_verified': 'true',
            'helpful_count': random.randint(0, 50),
            'created_at': review_date.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': review_date.strftime('%Y-%m-%d %H:%M:%S'),
            'deleted_at': ''
        })
        review_id += 1

with open('d:/Springboard/csv files/reviews.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'booking_id', 'user_id', 'service_id', 'vendor_id', 'rating', 'review_text', 'reviewer_name', 'is_verified', 'helpful_count', 'created_at', 'updated_at', 'deleted_at'])
    writer.writeheader()
    writer.writerows(reviews)

print(f"✅ Generated {len(reviews)} reviews")

# Update services with review statistics
print("📝 Updating services.csv with review statistics...")

service_stats = {}
for review in reviews:
    sid = review['service_id']
    if sid not in service_stats:
        service_stats[sid] = {'count': 0, 'total_rating': 0}
    service_stats[sid]['count'] += 1
    service_stats[sid]['total_rating'] += int(review['rating'])

for service in services:
    sid = service['id']
    if sid in service_stats:
        avg_rating = round(service_stats[sid]['total_rating'] / service_stats[sid]['count'], 2)
        service['average_rating'] = f"{avg_rating:.2f}"
        service['total_reviews'] = str(service_stats[sid]['count'])
        service['total_bookings'] = str(len([b for b in bookings if b['service_id'] == sid]))

with open('d:/Springboard/csv files/services.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'vendor_id', 'category_id', 'service_name', 'description', 'price', 'duration', 'unit', 'availability_status', 'city', 'state', 'postal_code', 'latitude', 'longitude', 'is_active', 'average_rating', 'total_reviews', 'total_bookings', 'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at'])
    writer.writeheader()
    writer.writerows(services)

print("✅ Services updated with review statistics")

# Update vendors with review statistics
print("📝 Updating vendors.csv with review statistics...")

vendor_stats = {}
for review in reviews:
    vid = review['vendor_id']
    if vid not in vendor_stats:
        vendor_stats[vid] = {'count': 0, 'total_rating': 0}
    vendor_stats[vid]['count'] += 1
    vendor_stats[vid]['total_rating'] += int(review['rating'])

for vendor in vendors:
    vid = vendor['id']
    if vid in vendor_stats:
        avg_rating = round(vendor_stats[vid]['total_rating'] / vendor_stats[vid]['count'], 2)
        vendor['average_rating'] = f"{avg_rating:.2f}"
        vendor['total_reviews'] = str(vendor_stats[vid]['count'])

with open('d:/Springboard/csv files/vendors.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'user_id', 'business_name', 'vendor_code', 'primary_category', 'category_id', 'description', 'contact_person', 'email', 'phone', 'address', 'city', 'state', 'postal_code', 'location', 'latitude', 'longitude', 'years_of_experience', 'availability', 'approval_status', 'approval_reason', 'rejection_reason', 'suspension_reason', 'is_verified', 'is_active', 'average_rating', 'total_reviews', 'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at'])
    writer.writeheader()
    writer.writerows(vendors)

print("✅ Vendors updated with review statistics")

# ===================================
# STEP 4: Generate payments.csv
# ===================================
print("📝 Generating payments.csv...")

payments = []
payment_id = 1

paid_bookings = [b for b in bookings if b['payment_status'] == 'PAID']

for booking in paid_bookings:
    payments.append({
        'id': payment_id,
        'booking_id': booking['id'],
        'user_id': booking['user_id'],
        'amount': booking['total_amount'],
        'payment_method': random.choice(['CARD', 'UPI', 'WALLET', 'NETBANKING']),
        'payment_status': 'SUCCESS',
        'transaction_id': f"TXN{random.randint(100000000, 999999999)}",
        'payment_gateway': random.choice(['RAZORPAY', 'PAYTM', 'PHONEPE']),
        'payment_date': booking['created_at'],
        'metadata': '',
        'created_at': booking['created_at'],
        'updated_at': booking['updated_at']
    })
    payment_id += 1

with open('d:/Springboard/csv files/payments.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'booking_id', 'user_id', 'amount', 'payment_method', 'payment_status', 'transaction_id', 'payment_gateway', 'payment_date', 'metadata', 'created_at', 'updated_at'])
    writer.writeheader()
    writer.writerows(payments)

print(f"✅ Generated {len(payments)} payments")

# ===================================
# STEP 5: Generate refunds.csv
# ===================================
print("📝 Generating refunds.csv...")

refunds = []
refund_id = 1

cancelled_bookings = [b for b in bookings if b['status'] == 'CANCELLED'][:50]

for booking in cancelled_bookings:
    payment = next((p for p in payments if p['booking_id'] == booking['id']), None)
    if payment:
        refunds.append({
            'id': refund_id,
            'booking_id': booking['id'],
            'payment_id': payment['id'],
            'refund_amount': payment['amount'],
            'refund_status': random.choice(['PENDING', 'APPROVED', 'PROCESSED']),
            'refund_reason': booking['cancellation_reason'],
            'refund_method': payment['payment_method'],
            'refund_transaction_id': f"REF{random.randint(100000000, 999999999)}",
            'requested_at': booking['updated_at'],
            'processed_at': random_date(datetime.strptime(booking['updated_at'], '%Y-%m-%d %H:%M:%S'), datetime(2025, 11, 15)).strftime('%Y-%m-%d %H:%M:%S'),
            'created_at': booking['updated_at'],
            'updated_at': booking['updated_at']
        })
        refund_id += 1

with open('d:/Springboard/csv files/refunds.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'booking_id', 'payment_id', 'refund_amount', 'refund_status', 'refund_reason', 'refund_method', 'refund_transaction_id', 'requested_at', 'processed_at', 'created_at', 'updated_at'])
    writer.writeheader()
    writer.writerows(refunds)

print(f"✅ Generated {len(refunds)} refunds")

# ===================================
# STEP 6: Generate favorites.csv
# ===================================
print("📝 Generating favorites.csv...")

favorites = []
favorite_id = 1

for user in regular_users:
    num_favorites = random.randint(5, 15)
    user_services = random.sample(services, min(num_favorites, len(services)))
    
    for service in user_services:
        favorites.append({
            'id': favorite_id,
            'user_id': user['id'],
            'service_id': service['id'],
            'created_at': random_date(datetime(2024, 1, 1), datetime(2025, 11, 1)).strftime('%Y-%m-%d %H:%M:%S')
        })
        favorite_id += 1

with open('d:/Springboard/csv files/favorites.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'user_id', 'service_id', 'created_at'])
    writer.writeheader()
    writer.writerows(favorites)

print(f"✅ Generated {len(favorites)} favorites")

# ===================================
# STEP 7: Generate cart_items.csv
# ===================================
print("📝 Generating cart_items.csv...")

cart_items = []
cart_id = 1

for user in random.sample(regular_users, min(20, len(regular_users))):
    num_cart = random.randint(1, 5)
    user_services = random.sample(services, min(num_cart, len(services)))
    
    for service in user_services:
        cart_items.append({
            'id': cart_id,
            'user_id': user['id'],
            'service_id': service['id'],
            'quantity': 1,
            'added_at': random_date(datetime(2025, 11, 1), datetime(2025, 11, 15)).strftime('%Y-%m-%d %H:%M:%S'),
            'created_at': random_date(datetime(2025, 11, 1), datetime(2025, 11, 15)).strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': ''
        })
        cart_id += 1

with open('d:/Springboard/csv files/cart_items.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'user_id', 'service_id', 'quantity', 'added_at', 'created_at', 'updated_at'])
    writer.writeheader()
    writer.writerows(cart_items)

print(f"✅ Generated {len(cart_items)} cart items")

# ===================================
# STEP 8: Generate wallets.csv
# ===================================
print("📝 Generating wallets.csv...")

wallets = []
wallet_id = 1

for user in users:
    wallets.append({
        'id': wallet_id,
        'user_id': user['id'],
        'balance': f"{random.randint(0, 5000)}.00",
        'currency': 'INR',
        'last_transaction_date': random_date(datetime(2024, 1, 1), datetime(2025, 11, 1)).strftime('%Y-%m-%d %H:%M:%S'),
        'is_active': 'true',
        'created_at': user['created_at'],
        'updated_at': user['updated_at']
    })
    wallet_id += 1

with open('d:/Springboard/csv files/wallets.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'user_id', 'balance', 'currency', 'last_transaction_date', 'is_active', 'created_at', 'updated_at'])
    writer.writeheader()
    writer.writerows(wallets)

print(f"✅ Generated {len(wallets)} wallets")

# ===================================
# STEP 9: Generate user_preferences.csv
# ===================================
print("📝 Generating user_preferences.csv...")

user_prefs = []
pref_id = 1

for user in users:
    user_prefs.append({
        'id': pref_id,
        'user_id': user['id'],
        'theme': random.choice(['light', 'dark']),
        'language': 'en',
        'notifications_enabled': random.choice(['true', 'false']),
        'email_notifications': random.choice(['true', 'false']),
        'sms_notifications': random.choice(['true', 'false']),
        'created_at': user['created_at'],
        'updated_at': user['updated_at']
    })
    pref_id += 1

with open('d:/Springboard/csv files/user_preferences.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'user_id', 'theme', 'language', 'notifications_enabled', 'email_notifications', 'sms_notifications', 'created_at', 'updated_at'])
    writer.writeheader()
    writer.writerows(user_prefs)

print(f"✅ Generated {len(user_prefs)} user preferences")

print("\n" + "="*60)
print("✅ PHASE 2 COMPLETE - ALL DATA GENERATED!")
print("="*60)
print(f"📊 Summary:")
print(f"   • Addresses: {len(addresses)}")
print(f"   • Bookings: {len(bookings)}")
print(f"   • Reviews: {len(reviews)}")
print(f"   • Payments: {len(payments)}")
print(f"   • Refunds: {len(refunds)}")
print(f"   • Favorites: {len(favorites)}")
print(f"   • Cart Items: {len(cart_items)}")
print(f"   • Wallets: {len(wallets)}")
print(f"   • User Preferences: {len(user_prefs)}")
print("\n🎯 Ready to import into database!")
