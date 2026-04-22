import React, { useState, useEffect, useCallback } from 'react';
import { contentAPI } from '../../services/api';
import { useModal } from '../../components/Modal/Modal';
import './AdminAnnouncements.css';

const AdminAnnouncements = () => {
  const modal = useModal();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    announcementType: 'INFO',
    audience: 'ALL',
    priority: 0,
    startsAt: '',
    endsAt: '',
    isActive: true
  });

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contentAPI.getAllAnnouncements();
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError(error.response?.data?.message || 'Failed to load announcements');
      modal.error('Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [modal]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

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
      modal.error('Title is required');
      return;
    }
    if (formData.title.trim().length < 5) {
      modal.error('Title must be at least 5 characters');
      return;
    }
    if (!formData.content.trim()) {
      modal.error('Content is required');
      return;
    }
    if (formData.content.trim().length < 10) {
      modal.error('Content must be at least 10 characters');
      return;
    }
    if (formData.startsAt && formData.endsAt) {
      if (new Date(formData.startsAt) >= new Date(formData.endsAt)) {
        modal.error('Start date must be before end date');
        return;
      }
    }
    
    if (loading) return; // Prevent double submission
    
    setLoading(true);
    try {
      if (editingAnnouncement) {
        await contentAPI.updateAnnouncement(editingAnnouncement.id, formData);
        modal.success('Announcement updated successfully');
      } else {
        await contentAPI.createAnnouncement(formData);
        modal.success('Announcement created successfully');
      }
      await fetchAnnouncements();
      closeModal();
    } catch (error) {
      console.error('Error saving announcement:', error);
      modal.error(error.response?.data?.message || 'Failed to save announcement. Please try again.');
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
      priority: announcement.priority || 0,
      startsAt: announcement.startsAt ? announcement.startsAt.substring(0, 16) : '',
      endsAt: announcement.endsAt ? announcement.endsAt.substring(0, 16) : '',
      isActive: announcement.isActive
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    modal.confirm('Are you sure you want to delete this announcement?', {
      onConfirm: async () => {
        try {
          await contentAPI.deleteAnnouncement(id);
          modal.success('Announcement deleted successfully');
          await fetchAnnouncements();
        } catch (error) {
          console.error('Error deleting announcement:', error);
          modal.error(error.response?.data?.message || 'Failed to delete announcement');
        }
      }
    });
  };

  const handleToggleStatus = async (id) => {
    try {
      await contentAPI.toggleAnnouncementStatus(id);
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      modal.error(error.response?.data?.message || 'Failed to toggle announcement status');
    }
  };

  const handleResendNotifications = (announcement) => {
    modal.confirm(
      `Resend notifications for "${announcement.title}" to ${announcement.audience === 'ALL' ? 'all users' : announcement.audience.toLowerCase()}?`,
      {
        onConfirm: async () => {
          try {
            await contentAPI.resendAnnouncementNotifications(announcement.id);
            modal.success('Notifications sent successfully');
          } catch (error) {
            console.error('Error resending notifications:', error);
            modal.error(error.response?.data?.message || 'Failed to send notifications');
          }
        }
      }
    );
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
    (announcement) => filterPriority === 'ALL' || announcement.priority === parseInt(filterPriority)
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
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
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
              <th>Priority</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnnouncements.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>
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
                  <td>
                    <span className={`priority-badge priority-${announcement.priority || 0}`}>
                      {announcement.priority || 0}
                    </span>
                  </td>
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
                    <button 
                      className="btn-resend"
                      onClick={() => handleResendNotifications(announcement)}
                      title="Resend notifications to target audience"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      Resend
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

              <div className="form-group">
                <label>Priority *</label>
                <select name="priority" value={formData.priority} onChange={handleInputChange} required>
                  <option value="0">Normal (0)</option>
                  <option value="1">Medium (1)</option>
                  <option value="2">High (2)</option>
                  <option value="3">Urgent (3)</option>
                </select>
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
