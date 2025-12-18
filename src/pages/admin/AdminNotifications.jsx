import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import { notificationsApi } from '../../services/notificationsApi.js';
import '../../styles/pages/admin-notifications.css';

function AdminNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    icon: '',
    accentIcon: '',
    isActive: true,
    priority: 0
  });

  const fetchNotifications = useCallback(async () => {
    if (!user?.isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      alert('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAddNotification = () => {
    setFormData({
      text: '',
      icon: '',
      accentIcon: '',
      isActive: true,
      priority: 0
    });
    setEditingNotification(null);
    setShowAddModal(true);
  };

  const handleEditNotification = (notification) => {
    setFormData({
      text: notification.text,
      icon: notification.icon,
      accentIcon: notification.accentIcon,
      isActive: notification.isActive,
      priority: notification.priority || 0
    });
    setEditingNotification(notification);
    setShowAddModal(true);
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification? This action cannot be undone.')) {
      return;
    }

    try {
      await notificationsApi.delete(notificationId);
      fetchNotifications(); // Refresh the list
      alert('Notification deleted successfully');
    } catch (err) {
      alert('Failed to delete notification');
      console.error('Delete error:', err);
    }
  };

  const handleToggleActive = async (notificationId) => {
    try {
      await notificationsApi.toggleActive(notificationId);
      fetchNotifications(); // Refresh the list
    } catch (err) {
      alert('Failed to toggle notification status');
      console.error('Toggle error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.text.trim() || !formData.icon.trim() || !formData.accentIcon.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingNotification) {
        await notificationsApi.update(editingNotification._id, formData);
        alert('Notification updated successfully');
      } else {
        await notificationsApi.create(formData);
        alert('Notification created successfully');
      }

      setShowAddModal(false);
      fetchNotifications(); // Refresh the list
    } catch (err) {
      alert(editingNotification ? 'Failed to update notification' : 'Failed to create notification');
      console.error('Submit error:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!user?.isAdmin) {
    return (
      <div className="admin-notifications">
        <Navbar />
        <div className="admin-notifications__container">
          <div className="admin-notifications__access-denied">
            <h2>Access Denied</h2>
            <p>You don't have permission to access this page.</p>
            <button onClick={() => navigate('/')} className="admin-notifications__back-btn">
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-notifications">
      <Navbar />

      <div className="admin-notifications__container">
        {/* Header */}
        <div className="admin-notifications__header">
          <div className="admin-notifications__header-content">
            <button onClick={handleGoBack} className="admin-notifications__back-btn">
              ← Back
            </button>
            <div>
              <h1 className="admin-notifications__title">Notification Management</h1>
              <p className="admin-notifications__subtitle">
                Manage notification messages displayed on the home page banner
              </p>
            </div>
          </div>
          <button onClick={handleAddNotification} className="admin-notifications__add-btn">
            + Add Notification
          </button>
        </div>

        {/* Stats */}
        <div className="admin-notifications__stats">
          <div className="admin-notifications__stat">
            <div className="admin-notifications__stat-number">{notifications.length}</div>
            <div className="admin-notifications__stat-label">Total Notifications</div>
          </div>
          <div className="admin-notifications__stat">
            <div className="admin-notifications__stat-number">
              {notifications.filter(n => n.isActive).length}
            </div>
            <div className="admin-notifications__stat-label">Active</div>
          </div>
          <div className="admin-notifications__stat">
            <div className="admin-notifications__stat-number">
              {notifications.filter(n => !n.isActive).length}
            </div>
            <div className="admin-notifications__stat-label">Inactive</div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="admin-notifications__loading">
            <div className="admin-notifications__loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : (
          /* Notifications List */
          <div className="admin-notifications__list">
            {notifications.length === 0 ? (
              <div className="admin-notifications__empty">
                <div className="admin-notifications__empty-icon">📢</div>
                <h3>No notifications yet</h3>
                <p>Create your first notification message</p>
                <button onClick={handleAddNotification} className="admin-notifications__empty-btn">
                  Create Notification
                </button>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification._id} className="admin-notifications__item">
                  <div className="admin-notifications__item-content">
                    <div className="admin-notifications__item-icons">
                      <span className="admin-notifications__item-icon">{notification.icon}</span>
                      <span className="admin-notifications__item-accent-icon">{notification.accentIcon}</span>
                    </div>
                    <div className="admin-notifications__item-text">
                      <p>{notification.text}</p>
                      <div className="admin-notifications__item-meta">
                        <span className="admin-notifications__item-priority">
                          Priority: {notification.priority || 0}
                        </span>
                        <span className="admin-notifications__item-date">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-notifications__item-actions">
                    <div className="admin-notifications__item-status">
                      <label className="admin-notifications__toggle">
                        <input
                          type="checkbox"
                          checked={notification.isActive}
                          onChange={() => handleToggleActive(notification._id)}
                        />
                        <span className="admin-notifications__toggle-slider"></span>
                      </label>
                      <span className={`admin-notifications__status ${notification.isActive ? 'admin-notifications__status--active' : 'admin-notifications__status--inactive'}`}>
                        {notification.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="admin-notifications__item-buttons">
                      <button
                        onClick={() => handleEditNotification(notification)}
                        className="admin-notifications__edit-btn"
                        title="Edit Notification"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="admin-notifications__delete-btn"
                        title="Delete Notification"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="admin-notifications__modal-overlay">
          <div className="admin-notifications__modal">
            <div className="admin-notifications__modal-header">
              <h2>{editingNotification ? 'Edit Notification' : 'Add New Notification'}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="admin-notifications__modal-close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-notifications__form">
              <div className="admin-notifications__form-group">
                <label className="admin-notifications__label">Notification Text *</label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  className="admin-notifications__textarea"
                  placeholder="Enter the notification message..."
                  rows="3"
                  required
                />
                <small className="admin-notifications__help">
                  This text will be displayed in the rotating notification banner
                </small>
              </div>

              <div className="admin-notifications__form-row">
                <div className="admin-notifications__form-group">
                  <label className="admin-notifications__label">Primary Icon *</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="admin-notifications__input"
                    placeholder="🚚"
                    required
                  />
                  <small className="admin-notifications__help">Emoji or icon for the start</small>
                </div>

                <div className="admin-notifications__form-group">
                  <label className="admin-notifications__label">Accent Icon *</label>
                  <input
                    type="text"
                    name="accentIcon"
                    value={formData.accentIcon}
                    onChange={handleInputChange}
                    className="admin-notifications__input"
                    placeholder="⭐"
                    required
                  />
                  <small className="admin-notifications__help">Emoji or icon for the end</small>
                </div>
              </div>

              <div className="admin-notifications__form-row">
                <div className="admin-notifications__form-group">
                  <label className="admin-notifications__label">Priority (0-10)</label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="admin-notifications__input"
                    min="0"
                    max="10"
                    placeholder="0"
                  />
                  <small className="admin-notifications__help">Higher priority shows first</small>
                </div>

                <div className="admin-notifications__form-group">
                  <label className="admin-notifications__checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Active (visible to users)
                  </label>
                </div>
              </div>

              <div className="admin-notifications__form-preview">
                <h4>Preview:</h4>
                <div className="admin-notifications__preview-banner">
                  <span className="admin-notifications__preview-icon">{formData.icon || '🚚'}</span>
                  <span className="admin-notifications__preview-text">
                    {formData.text || 'Your notification text will appear here...'}
                  </span>
                  <span className="admin-notifications__preview-icon">{formData.accentIcon || '⭐'}</span>
                </div>
              </div>

              <div className="admin-notifications__form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="admin-notifications__cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-notifications__submit-btn">
                  {editingNotification ? 'Update Notification' : 'Create Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotifications;
