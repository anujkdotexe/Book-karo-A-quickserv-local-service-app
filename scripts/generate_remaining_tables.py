"""
Generate remaining tables: refunds, coupon_usages, audit_logs
"""

import csv
import random
from datetime import datetime, timedelta

random.seed(12345)

def random_date(start_date, end_date):
    time_delta = end_date - start_date
    random_days = random.randint(0, time_delta.days)
    random_seconds = random.randint(0, 86400)
    return start_date + timedelta(days=random_days, seconds=random_seconds)

print("\n🚀 Generating Remaining Tables Data...\n")

# Load existing data
payments = []
with open('d:/Springboard/csv files/payments.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    payments = list(reader)

bookings = []
with open('d:/Springboard/csv files/bookings.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    bookings = list(reader)

users = []
with open('d:/Springboard/csv files/users.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    users = list(reader)

coupons = []
with open('d:/Springboard/csv files/coupons.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    coupons = list(reader)

print(f"✅ Loaded {len(payments)} payments, {len(bookings)} bookings, {len(users)} users, {len(coupons)} coupons")

# ===================================
# GENERATE: refunds.csv
# ===================================
print("\n📝 Generating refunds.csv...")
refunds = []
refund_id = 1

# Get cancelled bookings that have payments
cancelled_bookings = [b for b in bookings if b['status'] == 'CANCELLED']
cancelled_with_payment = []

for booking in cancelled_bookings:
    payment = next((p for p in payments if p['booking_id'] == booking['id']), None)
    if payment:
        cancelled_with_payment.append({'booking': booking, 'payment': payment})

# Create refunds for ~60% of cancelled bookings with payments
for item in random.sample(cancelled_with_payment, min(30, len(cancelled_with_payment))):
    booking = item['booking']
    payment = item['payment']
    
    refund_date = random_date(
        datetime.strptime(payment['created_at'], '%Y-%m-%d %H:%M:%S'),
        datetime(2025, 11, 15)
    )
    
    refunds.append({
        'id': refund_id,
        'payment_id': payment['id'],
        'booking_id': booking['id'],
        'refund_amount': payment['amount'],
        'refund_method': payment['payment_method'],
        'refund_status': random.choice(['PENDING', 'APPROVED', 'PROCESSED', 'PROCESSED', 'PROCESSED']),
        'refund_reason': booking['cancellation_reason'] or 'Customer request',
        'refund_transaction_id': f"REF{str(refund_id).zfill(8)}",
        'initiated_by': booking['user_id'],
        'approved_by': '1',
        'processed_at': refund_date.strftime('%Y-%m-%d %H:%M:%S'),
        'created_at': refund_date.strftime('%Y-%m-%d %H:%M:%S'),
        'updated_at': refund_date.strftime('%Y-%m-%d %H:%M:%S')
    })
    refund_id += 1

with open('d:/Springboard/csv files/refunds.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'payment_id', 'booking_id', 'refund_amount', 'refund_method', 'refund_status', 'refund_reason', 'refund_transaction_id', 'initiated_by', 'approved_by', 'processed_at', 'created_at', 'updated_at'])
    writer.writeheader()
    writer.writerows(refunds)

print(f"✅ Generated {len(refunds)} refunds")

# ===================================
# GENERATE: coupon_usages.csv
# ===================================
print("📝 Generating coupon_usages.csv...")
coupon_usages = []
usage_id = 1

# Get completed bookings
completed_bookings = [b for b in bookings if b['status'] == 'COMPLETED']

# Randomly assign coupons to ~20% of bookings
for booking in random.sample(completed_bookings, min(200, len(completed_bookings) // 5)):
    coupon = random.choice(coupons)
    
    coupon_usages.append({
        'id': usage_id,
        'coupon_id': coupon['id'],
        'user_id': booking['user_id'],
        'booking_id': booking['id'],
        'discount_applied': booking['price_discount'],
        'used_at': booking['created_at'],
        'created_at': booking['created_at']
    })
    usage_id += 1

with open('d:/Springboard/csv files/coupon_usages.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'coupon_id', 'user_id', 'booking_id', 'discount_applied', 'used_at', 'created_at'])
    writer.writeheader()
    writer.writerows(coupon_usages)

print(f"✅ Generated {len(coupon_usages)} coupon usages")

# ===================================
# GENERATE: audit_logs.csv
# ===================================
print("📝 Generating audit_logs.csv...")
audit_logs = []
log_id = 1

ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']
ENTITIES = ['User', 'Vendor', 'Service', 'Booking', 'Payment', 'Review']

# Generate audit logs for various actions
for user in users:
    # Login/logout logs
    num_sessions = random.randint(5, 15)
    for _ in range(num_sessions):
        login_time = random_date(datetime(2024, 1, 1), datetime(2025, 11, 15))
        
        audit_logs.append({
            'id': log_id,
            'performed_by': user['id'],
            'action': 'LOGIN',
            'entity_type': 'User',
            'entity_id': user['id'],
            'old_values': '',
            'new_values': f'{{"ip_address": "192.168.1.{random.randint(1, 255)}"}}',
            'ip_address': f"192.168.1.{random.randint(1, 255)}",
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'created_at': login_time.strftime('%Y-%m-%d %H:%M:%S')
        })
        log_id += 1
        
        if random.random() > 0.3:  # 70% logout
            logout_time = login_time + timedelta(minutes=random.randint(10, 180))
            audit_logs.append({
                'id': log_id,
                'performed_by': user['id'],
                'action': 'LOGOUT',
                'entity_type': 'User',
                'entity_id': user['id'],
                'old_values': '',
                'new_values': '',
                'ip_address': f"192.168.1.{random.randint(1, 255)}",
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at': logout_time.strftime('%Y-%m-%d %H:%M:%S')
            })
            log_id += 1

# Add logs for booking actions
for booking in random.sample(bookings, min(200, len(bookings))):
    audit_logs.append({
        'id': log_id,
        'performed_by': booking['user_id'],
        'action': 'CREATE',
        'entity_type': 'Booking',
        'entity_id': booking['id'],
        'old_values': '',
        'new_values': f'{{"status": "{booking["status"]}", "amount": "{booking["price_total"]}"}}',
        'ip_address': f"192.168.1.{random.randint(1, 255)}",
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'created_at': booking['created_at']
    })
    log_id += 1

with open('d:/Springboard/csv files/audit_logs.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'performed_by', 'action', 'entity_type', 'entity_id', 'old_values', 'new_values', 'ip_address', 'user_agent', 'created_at'])
    writer.writeheader()
    writer.writerows(audit_logs)

print(f"✅ Generated {len(audit_logs)} audit logs")

print("\n" + "="*60)
print("✅ REMAINING TABLES GENERATION COMPLETE!")
print("="*60)
print(f"📊 Summary:")
print(f"   • Refunds: {len(refunds)}")
print(f"   • Coupon Usages: {len(coupon_usages)}")
print(f"   • Audit Logs: {len(audit_logs)}")
print("\n🎯 Ready to import!")
