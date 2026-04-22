import csv
import os
from datetime import datetime, timedelta

# Generate valid coupons with proper date ranges
coupons = []
base_date = datetime(2025, 11, 19)  # Today

for i in range(1, 11):
    starts_at = base_date + timedelta(days=i)
    ends_at = starts_at + timedelta(days=30)  # Valid for 30 days
    
    coupons.append([
        i,
        f'PROMO{i:03d}',
        'Promotional Discount' if i <= 5 else 'Seasonal Offer',
        'FIXED' if i % 2 == 1 else 'PERCENTAGE',
        100 if i % 2 == 1 else 15,  # ₹100 off or 15% off
        500,  # min order value
        200 if i % 2 == 1 else 300,  # max discount
        starts_at.strftime('%Y-%m-%d %H:%M:%S'),
        ends_at.strftime('%Y-%m-%d %H:%M:%S'),
        1000,  # usage limit
        2,     # per user limit
        'true',
        base_date.strftime('%Y-%m-%d %H:%M:%S'),
        1,
        base_date.strftime('%Y-%m-%d %H:%M:%S'),
        1
    ])

# Write to CSV
csv_file = r'D:\Springboard\csv files\coupons.csv'
with open(csv_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'code', 'description', 'discount_type', 'discount_value', 
                     'min_order_value', 'max_discount_amount', 'starts_at', 'ends_at', 
                     'usage_limit', 'per_user_limit', 'is_active', 'created_at', 
                     'created_by', 'updated_at', 'updated_by'])
    writer.writerows(coupons)

print(f"✅ Generated {len(coupons)} coupons with valid date ranges")
print(f"📁 Saved to: {csv_file}")
print(f"\nSample coupon:")
print(f"  Code: {coupons[0][1]}")
print(f"  Starts: {coupons[0][7]}")
print(f"  Ends: {coupons[0][8]}")
