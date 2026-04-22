import React, { useState, useEffect } from 'react';
import { vendorAPI } from '../../services/vendorAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useModal } from '../../components/Modal/Modal';
import './VendorAvailability.css';

const VendorAvailability = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [formData, setFormData] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
    specialNote: ''
  });
  const modal = useModal();

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const dayLabels = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday'
  };

  useEffect(() => {
    loadAvailabilities();
  }, []);

  const loadAvailabilities = async () => {
    try {
      setLoading(true);
      const data = await vendorAPI.getAvailabilities();
      setAvailabilities(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load availabilities');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (availability = null) => {
    if (availability) {
      setEditingAvailability(availability);
      setFormData({
        dayOfWeek: availability.dayOfWeek,
        startTime: availability.startTime,
        endTime: availability.endTime,
        isAvailable: availability.isAvailable,
        specialNote: availability.specialNote || ''
      });
    } else {
      setEditingAvailability(null);
      setFormData({
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
        specialNote: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAvailability(null);
    setFormData({
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
      specialNote: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.dayOfWeek) {
      setError('Please select a day of the week');
      return;
    }
    if (!formData.startTime) {
      setError('Start time is required');
      return;
    }
    if (!formData.endTime) {
      setError('End time is required');
      return;
    }
    
    // Validate time logic
    const startTime = new Date(`2000-01-01T${formData.startTime}`);
    const endTime = new Date(`2000-01-01T${formData.endTime}`);
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }
    
    // Check minimum slot duration (e.g., 30 minutes)
    const durationMinutes = (endTime - startTime) / (1000 * 60);
    if (durationMinutes < 30) {
      setError('Availability slot must be at least 30 minutes');
      return;
    }
    
    if (loading) return; // Prevent double submission
    
    setLoading(true);
    setError('');
    try {
      if (editingAvailability) {
        await vendorAPI.updateAvailability(editingAvailability.id, formData);
      } else {
        await vendorAPI.createAvailability(formData);
      }
      await loadAvailabilities();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    modal.confirm('Are you sure you want to delete this availability slot?', {
      onConfirm: async () => {
        try {
          await vendorAPI.deleteAvailability(id);
          await loadAvailabilities();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to delete availability');
        }
      }
    });
  };

  const handleToggleStatus = async (availability) => {
    try {
      await vendorAPI.updateAvailability(availability.id, {
        ...availability,
        isAvailable: !availability.isAvailable
      });
      await loadAvailabilities();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle availability status');
    }
  };

  const getAvailabilitiesByDay = (day) => {
    return availabilities
      .filter(a => a.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getWeeklyStats = () => {
    const totalSlots = availabilities?.length || 0;
    const activeSlots = availabilities?.filter(a => a.isAvailable).length || 0;
    const totalHours = availabilities?.reduce((sum, a) => {
      if (!a.isAvailable) return sum;
      const start = new Date(`2000-01-01T${a.startTime}`);
      const end = new Date(`2000-01-01T${a.endTime}`);
      return sum + (end - start) / (1000 * 60 * 60);
    }, 0) || 0;
    return { totalSlots, activeSlots, totalHours: totalHours.toFixed(1) };
  };

  if (loading) {
    return (
      <div className="vendor-availability">
        <LoadingSpinner message="Loading availability schedule..." size="large" />
      </div>
    );
  }

  const stats = getWeeklyStats();

  return (
    <div className="vendor-availability">
      <div className="availability-header">
        <div>
          <h1>Availability Schedule</h1>
          <p>Manage your weekly availability and time slots</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="fas fa-plus"></i> Add Time Slot
        </button>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Statistics */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-icon">
            <i className="fas fa-calendar-week"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalSlots}</h3>
            <p>Total Slots</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon active">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.activeSlots}</h3>
            <p>Active Slots</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon hours">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalHours}h</h3>
            <p>Weekly Hours</p>
          </div>
        </div>
      </div>

      {/* Weekly Calendar View */}
      <div className="weekly-calendar">
        {daysOfWeek.map(day => {
          const daySlots = getAvailabilitiesByDay(day);
          return (
            <div key={day} className="day-column">
              <div className="day-header">
                <h3>{dayLabels[day]}</h3>
                <span className="slot-count">{daySlots.length} slots</span>
              </div>
              <div className="day-slots">
                {daySlots.length === 0 ? (
                  <div className="no-slots">
                    <i className="fas fa-calendar-times"></i>
                    <p>No availability set</p>
                  </div>
                ) : (
                  daySlots.map(slot => (
                    <div 
                      key={slot.id} 
                      className={`time-slot ${slot.isAvailable ? 'available' : 'unavailable'}`}
                    >
                      <div className="slot-time">
                        <i className="fas fa-clock"></i>
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                      {slot.specialNote && (
                        <div className="slot-note">
                          <i className="fas fa-sticky-note"></i>
                          <span>{slot.specialNote}</span>
                        </div>
                      )}
                      <div className="slot-actions">
                        <button
                          className={`btn-icon ${slot.isAvailable ? 'active' : 'inactive'}`}
                          onClick={() => handleToggleStatus(slot)}
                          title={slot.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                        >
                          <i className={`fas ${slot.isAvailable ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                        </button>
                        <button
                          className="btn-icon edit"
                          onClick={() => handleOpenModal(slot)}
                          title="Edit slot"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(slot.id)}
                          title="Delete slot"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAvailability ? 'Edit Time Slot' : 'Add Time Slot'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="dayOfWeek">
                    Day of Week <span className="required">*</span>
                  </label>
                  <select
                    id="dayOfWeek"
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleInputChange}
                    required
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{dayLabels[day]}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="startTime">
                    Start Time <span className="required">*</span>
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endTime">
                    End Time <span className="required">*</span>
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="specialNote">Special Note</label>
                  <textarea
                    id="specialNote"
                    name="specialNote"
                    value={formData.specialNote}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="e.g., Limited slots, advance booking required, etc."
                  />
                </div>

                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleInputChange}
                    />
                    <span>Mark as available</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i>
                  {editingAvailability ? 'Update Slot' : 'Create Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorAvailability;
