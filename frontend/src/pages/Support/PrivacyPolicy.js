import React from 'react';
import { Link } from 'react-router-dom';
import './TermsOfService.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page">
      <div className="container">
        <div className="privacy-header">
          <Link to="/" className="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Home
          </Link>
          <h1>Privacy Policy</h1>
          <p className="privacy-date">Last Updated: October 20, 2025</p>
        </div>

        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Bookaro. We respect your privacy and are committed to protecting your personal data. This Privacy 
              Policy explains how we collect, use, disclose, and safeguard your information when you use our service marketplace platform.
            </p>
            <p>
              Please read this Privacy Policy carefully. By using Bookaro, you agree to the collection and use of information 
              in accordance with this policy.
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>We collect the following personal information when you register and use our Service:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
              <li><strong>Profile Information:</strong> Address, city, state, postal code</li>
              <li><strong>Booking Information:</strong> Service details, booking dates, special requests</li>
              <li><strong>Payment Information:</strong> Billing address (payment processing handled by third-party providers)</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>When you access our Service, we automatically collect:</p>
            <ul>
              <li>IP address and browser type</li>
              <li>Device information</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referral source</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use your personal information for the following purposes:</p>
            <ul>
              <li><strong>Service Provision:</strong> To facilitate bookings and connect you with service providers</li>
              <li><strong>Account Management:</strong> To create and manage your account</li>
              <li><strong>Communication:</strong> To send booking confirmations, updates, and customer support responses</li>
              <li><strong>Improvements:</strong> To analyze usage patterns and improve our Service</li>
              <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security incidents</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
              <li><strong>Marketing:</strong> To send promotional offers (with your consent, which you can withdraw anytime)</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. Information Sharing and Disclosure</h2>
            <h3>4.1 Service Providers</h3>
            <p>
              When you make a booking, we share necessary information (name, contact details, booking details) with the 
              service provider to fulfill your request.
            </p>

            <h3>4.2 Third-Party Service Providers</h3>
            <p>We may share your information with trusted third-party service providers who assist us in:</p>
            <ul>
              <li>Payment processing</li>
              <li>Data analytics</li>
              <li>Email delivery</li>
              <li>Customer support</li>
              <li>Hosting and infrastructure</li>
            </ul>

            <h3>4.3 Legal Requirements</h3>
            <p>We may disclose your information if required by law or in response to:</p>
            <ul>
              <li>Legal processes or government requests</li>
              <li>Enforcing our Terms of Service</li>
              <li>Protecting the rights, property, or safety of Bookaro, our users, or others</li>
              <li>Investigating fraud or security issues</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information, including:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure password hashing (BCrypt)</li>
              <li>JWT token-based authentication</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
            </ul>
            <p>
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive 
              to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. Your Privacy Rights</h2>
            <p>You have the following rights regarding your personal data:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information through your profile page</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Data Portability:</strong> Request your data in a machine-readable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restrict Processing:</strong> Request limitation on how we use your data</li>
            </ul>
            <p>
              To exercise these rights, please contact us at <a href="mailto:privacy@bookaro.com">privacy@bookaro.com</a>
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Authenticate your identity</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Personalize content and advertisements</li>
            </ul>
            <p>
              You can control cookie preferences through your browser settings. Note that disabling cookies may affect 
              the functionality of the Service.
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and comply with legal 
              obligations. Specifically:
            </p>
            <ul>
              <li><strong>Account Data:</strong> Retained while your account is active</li>
              <li><strong>Booking History:</strong> Retained for 7 years for accounting and legal purposes</li>
              <li><strong>Deleted Accounts:</strong> Most data deleted within 30 days, some retained for legal compliance</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>9. Children's Privacy</h2>
            <p>
              Our Service is not intended for users under the age of 18. We do not knowingly collect personal information 
              from children. If you believe we have inadvertently collected information from a child, please contact us 
              immediately.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and maintained on servers located outside your jurisdiction. We ensure 
              appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="privacy-section">
            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by:
            </p>
            <ul>
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending an email notification for material changes</li>
            </ul>
            <p>
              Your continued use of the Service after changes constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section className="privacy-section">
            <h2>12. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul>
              <li>Email: <a href="mailto:privacy@bookaro.com">privacy@bookaro.com</a></li>
              <li>Phone: <a href="tel:+15551234567">+1 (555) 123-4567</a></li>
              <li>Address: Bookaro Privacy Team, [Your Address]</li>
              <li>Or visit our <Link to="/contact">Contact Page</Link></li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>13. Your Consent</h2>
            <p>
              By using our Service, you consent to our Privacy Policy and agree to its terms. If you do not agree with 
              this policy, please do not use our Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
