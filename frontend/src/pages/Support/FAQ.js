import React, { useState } from 'react';
import './Support.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I create an account on BOOK-KARO?',
          answer: 'Click on "Create Free Account" in the navigation bar, fill in your details including name, email, phone number, and address, then submit the form. You\'ll be automatically logged in and can start browsing services.'
        },
        {
          question: 'Is registration free?',
          answer: 'Yes! Registration is completely free. There are no hidden charges for creating an account or browsing services.'
        },
        {
          question: 'How do I book a service?',
          answer: 'Browse services by category or location, click on a service to view details, then click "Book This Service". Fill in your preferred date and time, and submit the booking. You\'ll receive a confirmation once the vendor accepts.'
        }
      ]
    },
    {
      category: 'Bookings & Payments',
      questions: [
        {
          question: 'How do I track my bookings?',
          answer: 'Navigate to "My Bookings" from the navigation menu. You can filter bookings by status: Pending, Confirmed, Completed, or Cancelled. Click on any booking to view detailed information.'
        },
        {
          question: 'Can I cancel a booking?',
          answer: 'Yes, you can cancel a booking before it\'s confirmed by the vendor. Go to "My Bookings", click on the booking, and select "Cancel Booking". Once confirmed or in progress, cancellation policies may vary.'
        },
        {
          question: 'What payment methods are accepted?',
          answer: 'Currently, payments are handled directly with service providers. Payment methods may include cash, UPI, cards, or online transfer depending on the provider\'s preferences.'
        },
        {
          question: 'How does pricing work?',
          answer: 'Each service has a base price displayed on the service card. Final pricing may vary based on specific requirements, which will be confirmed by the vendor before service delivery.'
        }
      ]
    },
    {
      category: 'Services & Providers',
      questions: [
        {
          question: 'What types of services are available?',
          answer: 'BOOK-KARO offers a wide range of home services including Plumbing, Electrical work, Cleaning, Carpentry, Painting, AC Repair, Appliance Repair, and more. Browse by category to see all available services.'
        },
        {
          question: 'How are service providers verified?',
          answer: 'All service providers on BOOK-KARO undergo a verification process including identity checks, skill verification, and background checks. We continuously monitor provider ratings and reviews.'
        },
        {
          question: 'Can I choose a specific service provider?',
          answer: 'Yes, when you view service details, you can see the provider\'s information, ratings, and reviews. You can choose to book with providers you trust or have worked with before.'
        },
        {
          question: 'How do I rate and review a service?',
          answer: 'After a service is completed, go to "My Bookings", click on the completed booking, and you\'ll see an option to write a review. Rate the service from 1-5 stars and share your experience.'
        }
      ]
    },
    {
      category: 'Account & Profile',
      questions: [
        {
          question: 'How do I update my profile information?',
          answer: 'Go to "My Profile" from the navigation menu, click "Edit Profile", update your information, and click "Save Changes". You can update your name, phone number, and address details.'
        },
        {
          question: 'Can I save multiple addresses?',
          answer: 'Yes! Go to "My Profile" and navigate to the "Addresses" tab. You can add multiple addresses (Home, Office, etc.) and set a default address for bookings.'
        },
        {
          question: 'How do I save my favorite services?',
          answer: 'Click the heart icon on any service card or detail page to add it to your favorites. Access your saved favorites from the heart icon in the navigation bar.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Currently, password reset can be requested through the Contact Us page. Future updates will include a self-service password reset option.'
        }
      ]
    },
    {
      category: 'Safety & Support',
      questions: [
        {
          question: 'Is my personal information safe?',
          answer: 'Yes, we take data security seriously. Your personal information is encrypted and stored securely. We never share your data with third parties without your consent.'
        },
        {
          question: 'What if I\'m not satisfied with a service?',
          answer: 'If you\'re unhappy with a service, please contact us through the Help Center with your booking details. We\'ll work with you and the provider to resolve the issue.'
        },
        {
          question: 'How do I report a problem with a provider?',
          answer: 'You can report issues through the Contact Us page or email us at support@BOOK-KARO.com. Include your booking ID and details of the issue for fastest resolution.'
        },
        {
          question: 'What are the service hours?',
          answer: 'Our customer support is available Monday-Saturday, 9 AM - 6 PM IST. Service providers may have different availability, which you can check on their profile.'
        }
      ]
    }
  ];

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="support-page">
      <div className="container">
        <div className="support-container fade-in">
          <div className="support-header">
            <h1>Frequently Asked Questions</h1>
            <p>Find answers to common questions about BOOK-KARO services</p>
          </div>

          <div className="faq-container">
            {faqs.map((category, catIndex) => (
              <div key={catIndex} className="faq-category">
                <h2 className="faq-category-title">{category.category}</h2>
                <div className="faq-list">
                  {category.questions.map((faq, qIndex) => {
                    const index = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === index;
                    
                    return (
                      <div key={qIndex} className="faq-item">
                        <button
                          className="faq-question"
                          onClick={() => toggleFAQ(catIndex, qIndex)}
                          aria-expanded={isOpen}
                        >
                          <span>{faq.question}</span>
                          <svg
                            className={`faq-icon ${isOpen ? 'rotate' : ''}`}
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="faq-answer">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="support-footer">
            <p>Still have questions? <a href="/contact">Contact our support team</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
