import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminAnnouncements.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [filterAudience, setFilterAudience] = useState('ALL');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    announcementType: 'INFO',
    audience: 'ALL',
    startsAt: '',
    endsAt: '',
    isActive: true
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/v1/admin/content/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching announcements:', error);
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
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    if (formData.title.trim().length < 5) {
      alert('Title must be at least 5 characters');
      return;
    }
    if (!formData.content.trim()) {
      alert('Content is required');
      return;
    }
    if (formData.content.trim().length < 10) {
      alert('Content must be at least 10 characters');
      return;
    }
    if (formData.startsAt && formData.endsAt) {
      if (new Date(formData.startsAt) >= new Date(formData.endsAt)) {
        alert('Start date must be before end date');
        return;
      }
    }
    
    if (loading) return; // Prevent double submission
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (editingAnnouncement) {
        await axios.put(
          `${API_BASE_URL}/api/v1/admin/content/announcements/${editingAnnouncement.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`${API_BASE_URL}/api/v1/admin/content/announcements`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchAnnouncements();
      closeModal();
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert(error.response?.data?.message || 'Failed to save announcement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      announcementType: announcement.announcementType,
      audience: announcement.audience,
      startsAt: announcement.startsAt ? announcement.startsAt.substring(0, 16) : '',
      endsAt: announcement.endsAt ? announcement.endsAt.substring(0, 16) : '',
      isActive: announcement.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/v1/admin/content/announcements/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Failed to delete announcement');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/v1/admin/content/announcements/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      alert('Failed to toggle announcement status');
    }
  };

  const openModal = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      announcementType: 'INFO',
      audience: 'ALL',
      startsAt: '',
      endsAt: '',
      isActive: true
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
  };

  const filteredAnnouncements = announcements.filter(
    (announcement) => filterAudience === 'ALL' || announcement.audience === filterAudience
  );

  const getTypeColor = (announcementType) => {
    switch (announcementType) {
      case 'INFO': return 'type-info';
      case 'WARNING': return 'type-warning';
      case 'URGENT': return 'type-urgent';
      case 'MAINTENANCE': return 'type-maintenance';
      default: return 'type-info';
    }
  };

  if (loading) {
    return <div className="loading">Loading announcements...</div>;
  }

  return (
    <div className="admin-announcements">
      <div className="announcements-header">
        <h1>Announcements Management</h1>
        <button className="btn-primary" onClick={openModal}>
          + Create Announcement
        </button>
      </div>

      <div className="announcements-filters">
        <label>
          Filter by Priority:
          <select value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="0">Normal (0)</option>
            <option value="1">Medium (1)</option>
            <option value="2">High (2)</option>
            <option value="3">Urgent (3)</option>
          </select>
        </label>
      </div>

      <div className="announcements-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Audience</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnnouncements.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  No announcements found
                </td>
              </tr>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <tr key={announcement.id}>
                  <td>{announcement.id}</td>
                  <td>
                    <div className="announcement-title">{announcement.title}</div>
                    <div className="announcement-content">{announcement.content}</div>
                  </td>
                  <td>
                    <span className={`type-badge ${getTypeColor(announcement.announcementType)}`}>
                      {announcement.announcementType}
                    </span>
                  </td>
                  <td>{announcement.audience}</td>
                  <td>{announcement.startsAt ? new Date(announcement.startsAt).toLocaleDateString() : '-'}</td>
                  <td>{announcement.endsAt ? new Date(announcement.endsAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`status-badge ${announcement.isActive ? 'active' : 'inactive'}`}>
                      {announcement.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-edit" onClick={() => handleEdit(announcement)}>
                      Edit
                    </button>
                    <button
                      className={`btn-toggle ${announcement.isActive ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleStatus(announcement.id)}
                    >
                      {announcement.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(announcement.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter announcement title"
                />
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Enter announcement content"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select name="announcementType" value={formData.announcementType} onChange={handleInputChange} required>
                    <option value="INFO">Info</option>
                    <option value="WARNING">Warning</option>
                    <option value="URGENT">Urgent</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Audience *</label>
                  <select name="audience" value={formData.audience} onChange={handleInputChange} required>
                    <option value="ALL">All</option>
                    <option value="USERS">Users</option>
                    <option value="VENDORS">Vendors</option>
                    <option value="ADMINS">Admins</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="datetime-local"
                    name="startsAt"
                    value={formData.startsAt}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="datetime-local"
                    name="endsAt"
                    value={formData.endsAt}
                    onChange={handleInputChange}
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
                  {editingAnnouncement ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
