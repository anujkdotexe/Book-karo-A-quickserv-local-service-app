import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminFAQs.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    displayOrder: 1,
    isActive: true
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    // Extract unique categories from FAQs
    const uniqueCategories = [...new Set(faqs.map(faq => faq.category))];
    setCategories(uniqueCategories.sort());
  }, [faqs]);

  const fetchFAQs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/v1/admin/content/faqs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaqs(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.question.trim()) {
      alert('Question is required');
      return;
    }
    if (formData.question.trim().length < 10) {
      alert('Question must be at least 10 characters');
      return;
    }
    if (!formData.answer.trim()) {
      alert('Answer is required');
      return;
    }
    if (formData.answer.trim().length < 20) {
      alert('Answer must be at least 20 characters');
      return;
    }
    if (!formData.category.trim()) {
      alert('Category is required');
      return;
    }
    if (formData.displayOrder < 1) {
      alert('Display order must be at least 1');
      return;
    }
    
    if (loading) return; // Prevent double submission
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (editingFAQ) {
        await axios.put(
          `${API_BASE_URL}/api/v1/admin/content/faqs/${editingFAQ.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`${API_BASE_URL}/api/v1/admin/content/faqs`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchFAQs();
      closeModal();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert(error.response?.data?.message || 'Failed to save FAQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faq) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      displayOrder: faq.displayOrder,
      isActive: faq.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/v1/admin/content/faqs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchFAQs();
      } catch (error) {
        console.error('Error deleting FAQ:', error);
        alert('Failed to delete FAQ');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/v1/admin/content/faqs/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFAQs();
    } catch (error) {
      console.error('Error toggling FAQ status:', error);
      alert('Failed to toggle FAQ status');
    }
  };

  const openModal = () => {
    setEditingFAQ(null);
    setFormData({
      question: '',
      answer: '',
      category: categories[0] || 'General',
      displayOrder: faqs.length + 1,
      isActive: true
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFAQ(null);
  };

  const filteredFAQs = faqs.filter(
    (faq) => filterCategory === 'ALL' || faq.category === filterCategory
  );

  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  if (loading) {
    return <div className="loading">Loading FAQs...</div>;
  }

  return (
    <div className="admin-faqs">
      <div className="faqs-header">
        <h1>FAQ Management</h1>
        <button className="btn-primary" onClick={openModal}>
          + Create FAQ
        </button>
      </div>

      <div className="faqs-filters">
        <label>
          Filter by Category:
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="faqs-stats">
        <div className="stat-card">
          <div className="stat-value">{filteredFAQs.length}</div>
          <div className="stat-label">Total FAQs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filteredFAQs.filter(f => f.isActive).length}</div>
          <div className="stat-label">Active FAQs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Object.keys(groupedFAQs).length}</div>
          <div className="stat-label">Categories</div>
        </div>
      </div>

      <div className="faqs-content">
        {Object.keys(groupedFAQs).length === 0 ? (
          <div className="no-faqs">No FAQs found</div>
        ) : (
          Object.keys(groupedFAQs).sort().map((category) => (
            <div key={category} className="faq-category">
              <h2 className="category-title">
                {category} ({groupedFAQs[category].length})
              </h2>
              <div className="faq-list">
                {groupedFAQs[category]
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((faq) => (
                    <div key={faq.id} className={`faq-item ${!faq.isActive ? 'inactive' : ''}`}>
                      <div className="faq-header-row">
                        <div className="faq-order">#{faq.displayOrder}</div>
                        <div className="faq-question">{faq.question}</div>
                        <span className={`status-badge ${faq.isActive ? 'active' : 'inactive'}`}>
                          {faq.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="faq-answer">{faq.answer}</div>
                      <div className="faq-actions">
                        <button className="btn-edit" onClick={() => handleEdit(faq)}>
                          Edit
                        </button>
                        <button
                          className={`btn-toggle ${faq.isActive ? 'deactivate' : 'activate'}`}
                          onClick={() => handleToggleStatus(faq.id)}
                        >
                          {faq.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(faq.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingFAQ ? 'Edit FAQ' : 'Create FAQ'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Question *</label>
                <input
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter question"
                />
              </div>

              <div className="form-group">
                <label>Answer *</label>
                <textarea
                  name="answer"
                  value={formData.answer}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="Enter answer"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Display Order *</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingFAQ ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFAQs;
