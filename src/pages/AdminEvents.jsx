import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { IconClose } from '../components/Icons';
import './AdminAnnouncements.css'; // Reusing admin component styles

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' | 'EDIT'
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    attachment: null,
    removeAttachment: false,
    existingAttachmentName: null,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const data = await api.get('/events');
      setEvents(data);
    } catch (err) {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setModalMode('CREATE');
    setCurrentId(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      venue: '',
      attachment: null,
      removeAttachment: false,
      existingAttachmentName: null,
    });
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(event) {
    setModalMode('EDIT');
    setCurrentId(event.id);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      venue: event.venue || '',
      attachment: null,
      removeAttachment: false,
      existingAttachmentName: event.attachmentName || null,
    });
    setFormError('');
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('File size must be under 5MB.');
        e.target.value = null;
        return;
      }
      setFormData(prev => ({ ...prev, attachment: file, removeAttachment: false }));
    }
  }

  function removeSelectedFile() {
    if (fileInputRef.current) fileInputRef.current.value = null;
    setFormData(prev => ({ ...prev, attachment: null }));
  }

  function removeExistingFile() {
    setFormData(prev => ({ ...prev, existingAttachmentName: null, removeAttachment: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    
    // Frontend validation
    if (!formData.title.trim()) return setFormError('Title is required.');
    if (!formData.description.trim()) return setFormError('Description is required.');
    if (!formData.date) return setFormError('Event date is required.');
    if (!formData.venue.trim()) return setFormError('Location is required.');

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('date', new Date(formData.date).toISOString());
      payload.append('venue', formData.venue);
      
      if (formData.startTime) payload.append('startTime', formData.startTime);
      if (formData.endTime) payload.append('endTime', formData.endTime);
      
      if (formData.attachment) {
        payload.append('attachment', formData.attachment);
      }
      
      if (formData.removeAttachment) {
        payload.append('removeAttachment', 'true');
      }

      if (modalMode === 'CREATE') {
        await api.upload('/events', 'POST', payload);
      } else {
        await api.upload(`/events/${currentId}`, 'PUT', payload);
      }

      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to delete event.');
    }
  }

  if (loading) {
    return <div className="admin-announcements">Loading events...</div>;
  }

  if (error) {
    return <div className="admin-announcements">{error}</div>;
  }

  return (
    <div className="admin-announcements">
      <div className="admin-announcements__header">
        <h2>Events</h2>
        <button className="admin-btn-primary" onClick={openCreateModal}>
          + Create Event
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Attachment</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-table__empty">
                  No events found.
                </td>
              </tr>
            ) : (
              events.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>
                    {item.startTime || 'TBD'} {item.endTime ? `- ${item.endTime}` : ''}
                  </td>
                  <td>{item.venue}</td>
                  <td>
                    {item.attachmentName ? (
                      <span className="admin-attachment-badge">📎 {item.attachmentName.substring(0, 15)}{item.attachmentName.length > 15 ? '...' : ''}</span>
                    ) : (
                      <span className="admin-text-muted">-</span>
                    )}
                  </td>
                  <td>{item.creator?.name || 'Unknown'}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-action-btn" onClick={() => openEditModal(item)}>
                        Edit
                      </button>
                      <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">
                {modalMode === 'CREATE' ? 'Create Event' : 'Edit Event'}
              </h3>
              <button className="admin-modal__close" onClick={closeModal}>
                <IconClose />
              </button>
            </div>
            
            <form className="admin-form" onSubmit={handleSubmit} noValidate>
              {formError && <div className="admin-error-banner">{formError}</div>}
              
              <div className="admin-form-group">
                <label className="admin-form-label">Event Title</label>
                <input
                  className="admin-form-input"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Annual Tech Symposium"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <textarea
                  className="admin-form-input admin-form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event details, schedule, requirements..."
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Date</label>
                  <input
                    className="admin-form-input"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Venue / Location</label>
                  <input
                    className="admin-form-input"
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g., Main Auditorium"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Start Time (Optional)</label>
                  <input
                    className="admin-form-input"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">End Time (Optional)</label>
                  <input
                    className="admin-form-input"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Attachment (Image or PDF)</label>
                
                {formData.existingAttachmentName ? (
                  <div className="admin-attachment-preview">
                    <span className="admin-attachment-name">📎 {formData.existingAttachmentName}</span>
                    <button type="button" className="admin-attachment-remove" onClick={removeExistingFile}>Remove</button>
                  </div>
                ) : formData.attachment ? (
                  <div className="admin-attachment-preview">
                    <span className="admin-attachment-name">📎 {formData.attachment.name}</span>
                    <button type="button" className="admin-attachment-remove" onClick={removeSelectedFile}>Remove</button>
                  </div>
                ) : (
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="admin-form-input admin-file-input"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFileChange}
                  />
                )}
                <div className="admin-form-help">Max size 5MB. JPG, PNG, WEBP, or PDF.</div>
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-secondary" onClick={closeModal} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
