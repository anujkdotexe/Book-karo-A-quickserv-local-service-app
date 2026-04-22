import csv
import os
from datetime import datetime

# FAQs from the customer-facing page (frontend/src/pages/Support/FAQ.js)
faqs = [
    # Getting Started
    ("How do I create an account on BOOK-KARO?", 
     "Click on 'Create Free Account' in the navigation bar, fill in your details including name, email, phone number, and address, then submit the form. You'll be automatically logged in and can start browsing services.",
     "Getting Started", 1, True),
    ("Is registration free?",
     "Yes! Registration is completely free. There are no hidden charges for creating an account or browsing services.",
     "Getting Started", 2, True),
    ("How do I book a service?",
     "Browse services by category or location, click on a service to view details, then click 'Book This Service'. Fill in your preferred date and time, and submit the booking. You'll receive a confirmation once the vendor accepts.",
     "Getting Started", 3, True),
    
    # Bookings & Payments
    ("How do I track my bookings?",
     "Navigate to 'My Bookings' from the navigation menu. You can filter bookings by status: Pending, Confirmed, Completed, or Cancelled. Click on any booking to view detailed information.",
     "Bookings & Payments", 4, True),
    ("Can I cancel a booking?",
     "Yes, you can cancel a booking before it's confirmed by the vendor. Go to 'My Bookings', click on the booking, and select 'Cancel Booking'. Once confirmed or in progress, cancellation policies may vary.",
     "Bookings & Payments", 5, True),
    ("What payment methods are accepted?",
     "Currently, payments are handled directly with service providers. Payment methods may include cash, UPI, cards, or online transfer depending on the provider's preferences.",
     "Bookings & Payments", 6, True),
    ("How does pricing work?",
     "Each service has a base price displayed on the service card. Final pricing may vary based on specific requirements, which will be confirmed by the vendor before service delivery.",
     "Bookings & Payments", 7, True),
    
    # Services & Providers
    ("What types of services are available?",
     "BOOK-KARO offers a wide range of home services including Plumbing, Electrical work, Cleaning, Carpentry, Painting, AC Repair, Appliance Repair, and more. Browse by category to see all available services.",
     "Services & Providers", 8, True),
    ("How are service providers verified?",
     "All service providers on BOOK-KARO undergo a verification process including identity checks, skill verification, and background checks. We continuously monitor provider ratings and reviews.",
     "Services & Providers", 9, True),
    ("Can I choose a specific service provider?",
     "Yes, when you view service details, you can see the provider's information, ratings, and reviews. You can choose to book with providers you trust or have worked with before.",
     "Services & Providers", 10, True),
    ("How do I rate and review a service?",
     "After a service is completed, go to 'My Bookings', click on the completed booking, and you'll see an option to write a review. Rate the service from 1-5 stars and share your experience.",
     "Services & Providers", 11, True),
    
    # Account & Profile
    ("How do I update my profile information?",
     "Go to 'My Profile' from the navigation menu, click 'Edit Profile', update your information, and click 'Save Changes'. You can update your name, phone number, and address details.",
     "Account & Profile", 12, True),
    ("Can I save multiple addresses?",
     "Yes! Go to 'My Profile' and navigate to the 'Addresses' tab. You can add multiple addresses (Home, Office, etc.) and set a default address for bookings.",
     "Account & Profile", 13, True),
    ("How do I save my favorite services?",
     "Click the heart icon on any service card or detail page to add it to your favorites. Access your saved favorites from the heart icon in the navigation bar.",
     "Account & Profile", 14, True),
    ("How do I reset my password?",
     "Currently, password reset can be requested through the Contact Us page. Future updates will include a self-service password reset option.",
     "Account & Profile", 15, True),
    
    # Safety & Support
    ("Is my personal information safe?",
     "Yes, we take data security seriously. Your personal information is encrypted and stored securely. We never share your data with third parties without your consent.",
     "Safety & Support", 16, True),
    ("What if I'm not satisfied with a service?",
     "If you're unhappy with a service, please contact us through the Help Center with your booking details. We'll work with you and the provider to resolve the issue.",
     "Safety & Support", 17, True),
    ("How do I report a problem with a provider?",
     "You can report issues through the Contact Us page or email us at support@BOOK-KARO.com. Include your booking ID and details of the issue for fastest resolution.",
     "Safety & Support", 18, True),
    ("What are the service hours?",
     "Our customer support is available Monday-Saturday, 9 AM - 6 PM IST. Service providers may have different availability, which you can check on their profile.",
     "Safety & Support", 19, True),
]

# Create CSV directory if it doesn't exist
csv_dir = r'D:\Springboard\csv files'
os.makedirs(csv_dir, exist_ok=True)

# Write to CSV
csv_file = os.path.join(csv_dir, 'faqs.csv')
with open(csv_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    # Header matching FAQ table structure
    writer.writerow(['question', 'answer', 'category', 'display_order', 'is_active'])
    
    # Write FAQ data
    for question, answer, category, order, active in faqs:
        writer.writerow([question, answer, category, order, str(active).upper()])

print(f"✅ Generated {len(faqs)} FAQs")
print(f"📁 Saved to: {csv_file}")
print("\nCategories:")
categories = {}
for _, _, cat, _, _ in faqs:
    categories[cat] = categories.get(cat, 0) + 1
for cat, count in categories.items():
    print(f"  - {cat}: {count} FAQs")
