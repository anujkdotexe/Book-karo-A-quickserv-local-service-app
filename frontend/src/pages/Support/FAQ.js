import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Support.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api/v1';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/public/content/faqs`);
      const faqData = response.data.data;
      
      // Group FAQs by category
      const grouped = faqData.reduce((acc, faq) => {
        if (!acc[faq.category]) {
          acc[faq.category] = [];
        }
        acc[faq.category].push({
          question: faq.question,
          answer: faq.answer
        });
        return acc;
      }, {});
      
      // Convert to array format matching the original structure
      const categorizedFaqs = Object.keys(grouped).map(category => ({
        category,
        questions: grouped[category]
      }));
      
      setFaqs(categorizedFaqs);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs. Please try again later.');
      setLoading(false);
    }
  };

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return <LoadingSpinner message="Loading FAQs..." fullScreen />;
  }

  if (error) {
    return (
      <div className="support-page">
        <div className="container">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchFAQs} className="btn btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

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
