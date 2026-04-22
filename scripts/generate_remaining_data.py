"""
Part 2: Generate remaining tables - Bookings, Addresses, Payments, etc.
This continues from the data generated in Part 1
"""

import csv
import random
from datetime import datetime, timedelta
from faker import Faker

fake = Faker(['en_IN'])
Faker.seed(12345)
random.seed(12345)

# Load generated data
print("📥 Loading generated data...")

users = []
with open('d:/Springboard/csv files/users.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    users = list(reader)

vendors = []
with open('d:/Springboard/csv files/vendors.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    vendors = list(reader)

services = []
with open('d:/Springboard/csv files/services.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    services = list(reader)

print(f"✅ Loaded {len(users)} users, {len(vendors)} vendors, {len(services)} services")

# Get user IDs
regular_user_ids = [int(u['id']) for u in users if u['role'] == 'USER']
vendor_user_ids = [int(u['id']) for u in users if u['role'] == 'VENDOR']

BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
PAYMENT_METHODS = ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'WALLET', 'CASH']
PAYMENT_STATUSES = ['PENDING', 'PROCESSING', 'PAID', 'FAILED']

def generate_date_range(start_days_ago=365, end_days_ago=0):
    start = datetime.now() - timedelta(days=start_days_ago)
    end = datetime.now() - timedelta(days=end_days_ago)
    random_date = start + (end - start) * random.random()
    return random_date.strftime('%Y-%m-%d %H:%M:%S')

# ============================================================================
# 7. GENERATE ADDRESSES (200+ addresses for users)
# ============================================================================
print("\n📝 Generating addresses.csv (200+ addresses)...")
addresses = []
address_id = 1

# Each regular user gets 3-5 addresses
for user_id in regular_user_ids:
    user = next(u for u in users if int(u['id']) == user_id)
    num_addresses = random.randint(3, 5)
    
    for i in range(num_addresses):
        is_default = 'true' if i == 0 else 'false'
        address_types = ['HOME', 'WORK', 'OTHER']
        
        addresses.append({
            'id': address_id,
            'user_id': user_id,
            'address_type': address_types[min(i, 2)],
            'full_name': user['full_name'],
            'phone': user['phone'],
            'address_line1': user['address'],
            'address_line2': f'Near {random.choice(["Market", "Temple", "Park", "School", "Hospital"])}',
            'landmark': random.choice(['Next to ATM', 'Opposite Mall', 'Behind Temple', 'Near Station']),
            'city': user['city'],
            'state': user['state'],
            'postal_code': user['postal_code'],
            'latitude': user['latitude'],
            'longitude': user['longitude'],
            'is_default': is_default,
            'created_at': generate_date_range(365, 30),
            'updated_at': generate_date_range(365, 30)
        })
        address_id += 1

with open('d:/Springboard/csv files/addresses.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'user_id', 'address_type', 'full_name', 'phone', 'address_line1', 
                  'address_line2', 'landmark', 'city', 'state', 'postal_code', 'country', 
                  'latitude', 'longitude', 'is_default', 'created_at', 'updated_at', 'deleted_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for addr in addresses:
        row = {k: addr.get(k, '') for k in fieldnames}
        writer.writerow(row)

print(f"✅ Generated {len(addresses)} addresses")

# ============================================================================
# 8. GENERATE BOOKINGS (1000+ bookings)
# ============================================================================
print("\n📝 Generating bookings.csv (1000+ bookings)...")
bookings = []
booking_id = 1

# Each user makes 15-25 bookings
for user_id in regular_user_ids:
    user = next(u for u in users if int(u['id']) == user_id)
    num_bookings = random.randint(15, 25)
    
    for i in range(num_bookings):
        # Random service
        service = random.choice(services)
        vendor = next(v for v in vendors if int(v['id']) == int(service['vendor_id']))
        
        # User's address in same city as service
        user_addresses = [a for a in addresses if int(a['user_id']) == user_id]
        if user_addresses:
            address = random.choice(user_addresses)
        else:
            address = None
        
        # Booking details
        status = random.choices(BOOKING_STATUSES, weights=[10, 30, 50, 10])[0]
        booking_date = generate_date_range(180, 0)
        
        # Calculate prices
        service_price = float(service['price'])
        tax = round(service_price * 0.15, 2)
        discount = random.choice([0, 0, 0, 50, 100])
        total = round(service_price + tax - discount, 2)
        
        payment_method = random.choice(PAYMENT_METHODS)
        payment_status = 'PAID' if status == 'COMPLETED' else random.choice(PAYMENT_STATUSES)
        
        bookings.append({
            'id': booking_id,
            'user_id': user_id,
            'service_id': service['id'],
            'vendor_id': vendor['id'],
            'address_id': address['id'] if address else '',
            'booking_reference': f'BOOK{booking_id:06d}',
            'service_name_at_booking': service['service_name'],
            'service_price_at_booking': service['price'],
            'scheduled_at': booking_date,
            'booking_date': booking_date.split()[0],
            'booking_time': f'{random.randint(8, 20):02d}:00:00',
            'status': status,
            'price_total': str(total),
            'price_service': service['price'],
            'price_tax': str(tax),
            'price_discount': str(discount),
            'payment_method': payment_method,
            'payment_status': payment_status,
            'special_requests': random.choice(['', '', 'Please call before coming', 'Ring the bell twice']),
            'completed_at': booking_date if status == 'COMPLETED' else '',
            'created_at': booking_date,
            'updated_at': booking_date
        })
        booking_id += 1

with open('d:/Springboard/csv files/bookings.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'user_id', 'service_id', 'vendor_id', 'address_id', 'booking_reference', 
                  'service_name_at_booking', 'service_price_at_booking', 'scheduled_at', 'booking_date', 
                  'booking_time', 'time_slot', 'status', 'price_total', 'price_service', 'price_tax', 
                  'price_discount', 'payment_method', 'payment_status', 'special_requests', 
                  'cancellation_reason', 'cancelled_at', 'cancelled_by', 'completed_at', 
                  'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for booking in bookings:
        row = {k: booking.get(k, '') for k in fieldnames}
        row['created_by'] = str(booking['user_id'])
        row['updated_by'] = str(booking['user_id'])
        writer.writerow(row)

print(f"✅ Generated {len(bookings)} bookings")

# ============================================================================
# 9. GENERATE PAYMENTS (for PAID bookings)
# ============================================================================
print("\n📝 Generating payments.csv...")
payments = []
payment_id = 1

paid_bookings = [b for b in bookings if b['payment_status'] == 'PAID']

for booking in paid_bookings:
    payments.append({
        'id': payment_id,
        'booking_id': booking['id'],
        'user_id': booking['user_id'],
        'amount': booking['price_total'],
        'payment_method': booking['payment_method'],
        'payment_status': 'PAID',
        'transaction_id': f'TXN{payment_id:010d}',
        'payment_gateway': 'MockPaymentGateway',
        'gateway_response': '{"status":"success"}',
        'created_at': booking['created_at'],
        'updated_at': booking['created_at']
    })
    payment_id += 1

with open('d:/Springboard/csv files/payments.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'booking_id', 'user_id', 'amount', 'currency', 'payment_method', 
                  'payment_status', 'transaction_id', 'payment_gateway', 'gateway_response', 
                  'failed_reason', 'refund_amount', 'refund_status', 'created_at', 'updated_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for payment in payments:
        row = {k: payment.get(k, '') for k in fieldnames}
        writer.writerow(row)

print(f"✅ Generated {len(payments)} payments")

# ============================================================================
# 10. GENERATE REFUNDS (10% of completed bookings)
# ============================================================================
print("\n📝 Generating refunds.csv...")
refunds = []
refund_id = 1

completed_bookings = [b for b in bookings if b['status'] == 'COMPLETED']
refund_bookings = random.sample(completed_bookings, min(len(completed_bookings) // 10, 100))

for booking in refund_bookings:
    payment = next((p for p in payments if int(p['booking_id']) == int(booking['id'])), None)
    if payment:
        refund_statuses = ['PENDING', 'APPROVED', 'PROCESSED', 'REJECTED']
        status = random.choice(refund_statuses)
        
        refunds.append({
            'id': refund_id,
            'booking_id': booking['id'],
            'payment_id': payment['id'],
            'user_id': booking['user_id'],
            'amount': booking['price_total'],
            'reason': random.choice(['Service not satisfactory', 'Wrong service booked', 'Vendor did not show up']),
            'status': status,
            'refund_method': booking['payment_method'],
            'processed_at': generate_date_range(90, 0) if status == 'PROCESSED' else '',
            'admin_notes': '',
            'created_at': booking['created_at'],
            'updated_at': generate_date_range(90, 0)
        })
        refund_id += 1

with open('d:/Springboard/csv files/refunds.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'booking_id', 'payment_id', 'user_id', 'amount', 'reason', 'status', 
                  'refund_method', 'processed_at', 'approved_at', 'approved_by', 'rejected_at', 
                  'rejected_by', 'rejection_reason', 'admin_notes', 'created_at', 'updated_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for refund in refunds:
        row = {k: refund.get(k, '') for k in fieldnames}
        writer.writerow(row)

print(f"✅ Generated {len(refunds)} refunds")

# ============================================================================
# 11. GENERATE FAVORITES (300+ favorites)
# ============================================================================
print("\n📝 Generating favorites.csv...")
favorites = []
favorite_id = 1

for user_id in regular_user_ids:
    # Each user has 5-10 favorites
    num_favorites = random.randint(5, 10)
    user_services = random.sample(services, num_favorites)
    
    for service in user_services:
        favorites.append({
            'id': favorite_id,
            'user_id': user_id,
            'service_id': service['id'],
            'created_at': generate_date_range(180, 0)
        })
        favorite_id += 1

with open('d:/Springboard/csv files/favorites.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'user_id', 'service_id', 'created_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(favorites)

print(f"✅ Generated {len(favorites)} favorites")

# ============================================================================
# 12. GENERATE CART_ITEMS (100+ cart items)
# ============================================================================
print("\n📝 Generating cart_items.csv...")
cart_items = []
cart_id = 1

# 30% of users have items in cart
users_with_cart = random.sample(regular_user_ids, len(regular_user_ids) // 3)

for user_id in users_with_cart:
    # 2-5 items in cart
    num_items = random.randint(2, 5)
    cart_services = random.sample(services, num_items)
    
    for service in cart_services:
        cart_items.append({
            'id': cart_id,
            'user_id': user_id,
            'service_id': service['id'],
            'quantity': 1,
            'added_at': generate_date_range(30, 0)
        })
        cart_id += 1

with open('d:/Springboard/csv files/cart_items.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'user_id', 'service_id', 'quantity', 'price_at_addition', 'added_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for item in cart_items:
        row = {k: item.get(k, '') for k in fieldnames}
        writer.writerow(row)

print(f"✅ Generated {len(cart_items)} cart items")

# ============================================================================
# 13. GENERATE REMAINING TABLES
# ============================================================================

# Wallets
print("\n📝 Generating wallets.csv...")
wallets = []
for user_id in regular_user_ids:
    wallets.append({
        'id': user_id,
        'user_id': user_id,
        'balance': str(random.randint(0, 5000)),
        'currency': 'INR',
        'last_transaction_date': generate_date_range(90, 0),
        'created_at': generate_date_range(365, 30),
        'updated_at': generate_date_range(90, 0)
    })

with open('d:/Springboard/csv files/wallets.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'user_id', 'balance', 'currency', 'last_transaction_date', 'created_at', 'updated_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(wallets)

print(f"✅ Generated {len(wallets)} wallets")

# User Preferences
print("\n📝 Generating user_preferences.csv...")
user_preferences = []
for user_id in [int(u['id']) for u in users]:
    user_preferences.append({
        'id': user_id,
        'user_id': user_id,
        'email_notifications': random.choice(['true', 'true', 'false']),
        'sms_notifications': random.choice(['true', 'false']),
        'push_notifications': random.choice(['true', 'true', 'false']),
        'theme': random.choice(['light', 'light', 'dark']),
        'language': 'en',
        'created_at': generate_date_range(365, 30),
        'updated_at': generate_date_range(90, 0)
    })

with open('d:/Springboard/csv files/user_preferences.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['id', 'user_id', 'email_notifications', 'sms_notifications', 'push_notifications', 
                  'theme', 'language', 'created_at', 'updated_at']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(user_preferences)

print(f"✅ Generated {len(user_preferences)} user preferences")

print("\n" + "="*80)
print("✅ ALL CSV DATA GENERATION COMPLETE!")
print("="*80)
print(f"📊 Summary:")
print(f"   - Users: {len(users)}")
print(f"   - Vendors: {len(vendors)}")
print(f"   - Services: {len(services)}")
print(f"   - Addresses: {len(addresses)}")
print(f"   - Bookings: {len(bookings)}")
print(f"   - Payments: {len(payments)}")
print(f"   - Refunds: {len(refunds)}")
print(f"   - Favorites: {len(favorites)}")
print(f"   - Cart Items: {len(cart_items)}")
print(f"   - Wallets: {len(wallets)}")
print(f"   - User Preferences: {len(user_preferences)}")
print("="*80)
print("\n🎯 Next Steps:")
print("1. Backup current CSV files: Move 'csv files' to 'csv_backup_old'")
print("2. Import new data: Run POPULATE_MOCK_DATA.ps1")
print("3. Test filters and pages!")
