import React from 'react';
import { Link } from 'react-router-dom';
import './TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-page">
      <div className="container">
        <div className="terms-header">
          <Link to="/" className="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Home
          </Link>
          <h1>Terms of Service</h1>
          <p className="terms-date">Last Updated: October 20, 2025</p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Bookaro ("the Service"), you accept and agree to be bound by the terms and 
              provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Service Description</h2>
            <p>
              Bookaro is a service marketplace platform that connects customers with service providers. We facilitate 
              bookings for various services including but not limited to home services, repairs, cleaning, and professional services.
            </p>
            <p>
              Bookaro acts as an intermediary platform and is not directly responsible for the quality or delivery of 
              services provided by third-party vendors.
            </p>
          </section>

          <section className="terms-section">
            <h2>3. User Accounts</h2>
            <h3>3.1 Registration</h3>
            <p>
              To use certain features of the Service, you must register for an account. You agree to provide accurate, 
              current, and complete information during registration and to update such information to keep it accurate.
            </p>
            <h3>3.2 Account Security</h3>
            <p>
              You are responsible for safeguarding your password and for all activities that occur under your account. 
              You agree to notify us immediately of any unauthorized use of your account.
            </p>
            <h3>3.3 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account if you violate these Terms of Service or engage 
              in fraudulent or illegal activities.
            </p>
          </section>

          <section className="terms-section">
            <h2>4. Booking and Payments</h2>
            <h3>4.1 Booking Process</h3>
            <p>
              When you make a booking through Bookaro, you enter into a direct contract with the service provider. 
              Bookaro facilitates the transaction but is not a party to the service agreement.
            </p>
            <h3>4.2 Pricing</h3>
            <p>
              All prices displayed are in Indian Rupees (Rs.) unless otherwise stated. Service providers set their own 
              prices, and Bookaro may charge a service fee for facilitating bookings.
            </p>
            <h3>4.3 Cancellation Policy</h3>
            <p>
              Cancellation policies vary by service provider. Please review the specific cancellation terms before making 
              a booking. Bookaro is not responsible for refunds related to service provider cancellations.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Post or transmit any harmful, offensive, or inappropriate content</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Use automated systems to access the Service without our permission</li>
              <li>Impersonate another person or entity</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>6. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Bookaro and are protected 
              by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any of 
              our content without our express written permission.
            </p>
          </section>

          <section className="terms-section">
            <h2>7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Bookaro shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages resulting from:
            </p>
            <ul>
              <li>Your use or inability to use the Service</li>
              <li>Unauthorized access to or alteration of your data</li>
              <li>Acts or omissions of third-party service providers</li>
              <li>Any other matter relating to the Service</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>8. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. 
              We do not guarantee that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Privacy Policy</h2>
            <p>
              Your use of the Service is also governed by our <Link to="/privacy">Privacy Policy</Link>. Please review 
              our Privacy Policy to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          <section className="terms-section">
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. We will provide notice of significant 
              changes by posting the new Terms on this page and updating the "Last Updated" date.
            </p>
            <p>
              Your continued use of the Service after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="terms-section">
            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to 
              its conflict of law provisions.
            </p>
          </section>

          <section className="terms-section">
            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul>
              <li>Email: <a href="mailto:support@bookaro.com">support@bookaro.com</a></li>
              <li>Phone: <a href="tel:+15551234567">+1 (555) 123-4567</a></li>
              <li>Or visit our <Link to="/contact">Contact Page</Link></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
