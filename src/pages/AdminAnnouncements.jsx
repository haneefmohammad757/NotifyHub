import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { IconClose } from '../components/Icons';
import './AdminAnnouncements.css';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
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
    category: 'GENERAL',
    priority: 'NORMAL',
    status: 'DRAFT',
    deadline: '',
    attachment: null,
    removeAttachment: false,
    existingAttachmentName: null,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      const data = await api.get('/announcements');
      setAnnouncements(data);
    } catch (err) {
      setError('Failed to load announcements.');
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
      category: 'GENERAL',
      priority: 'NORMAL',
      status: 'DRAFT',
      deadline: '',
      attachment: null,
      removeAttachment: false,
      existingAttachmentName: null,
    });
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(announcement) {
    setModalMode('EDIT');
    setCurrentId(announcement.id);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      category: announcement.category,
      priority: announcement.priority,
      status: announcement.status,
      deadline: announcement.deadline ? new Date(announcement.deadline).toISOString().slice(0, 16) : '',
      attachment: null,
      removeAttachment: false,
      existingAttachmentName: announcement.attachmentName || null,
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
    if (!formData.category) return setFormError('Category is required.');
    if (!formData.priority) return setFormError('Priority is required.');
    if (!formData.status) return setFormError('Status is required.');

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('category', formData.category);
      payload.append('priority', formData.priority);
      payload.append('status', formData.status);
      
      if (formData.deadline) {
        payload.append('deadline', new Date(formData.deadline).toISOString());
      }
      
      if (formData.attachment) {
        payload.append('attachment', formData.attachment);
      }
      
      if (formData.removeAttachment) {
        payload.append('removeAttachment', 'true');
      }

      if (modalMode === 'CREATE') {
        await api.upload('/announcements', 'POST', payload);
      } else {
        await api.upload(`/announcements/${currentId}`, 'PUT', payload);
      }

      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive(id) {
    if (!window.confirm('Are you sure you want to archive this announcement? It will be removed from the student feed.')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to archive announcement.');
    }
  }

  if (loading) {
    return <div className="admin-announcements">Loading announcements...</div>;
  }

  if (error) {
    return <div className="admin-announcements">{error}</div>;
  }

  return (
    <div className="admin-announcements">
      <div className="admin-announcements__header">
        <h2>Announcements</h2>
        <button className="admin-btn-primary" onClick={openCreateModal}>
          + Create Announcement
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Attachment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-table__empty">
                  No announcements found.
                </td>
              </tr>
            ) : (
              announcements.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${item.priority.toLowerCase()}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.creator?.name || 'Unknown'}</td>
                  <td>
                    {item.attachmentName ? (
                      <span className="admin-attachment-badge">📎 {item.attachmentName.substring(0, 15)}{item.attachmentName.length > 15 ? '...' : ''}</span>
                    ) : (
                      <span className="admin-text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-action-btn" onClick={() => openEditModal(item)}>
                        Edit
                      </button>
                      {item.status !== 'ARCHIVED' && (
                        <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleArchive(item.id)}>
                          Archive
                        </button>
                      )}
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
                {modalMode === 'CREATE' ? 'Create Announcement' : 'Edit Announcement'}
              </h3>
              <button className="admin-modal__close" onClick={closeModal}>
                <IconClose />
              </button>
            </div>
            
            <form className="admin-form" onSubmit={handleSubmit} noValidate>
              {formError && <div className="admin-error-banner">{formError}</div>}
              
              <div className="admin-form-group">
                <label className="admin-form-label">Title</label>
                <input
                  className="admin-form-input"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Placement Registration Open"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <textarea
                  className="admin-form-input admin-form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full announcement details..."
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Category</label>
                  <select
                    className="admin-form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="ACADEMIC">Academic</option>
                    <option value="EXAM">Exam</option>
                    <option value="PLACEMENT">Placement</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="EVENT">Event</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Priority</label>
                  <select
                    className="admin-form-input"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Status</label>
                  <select
                    className="admin-form-input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="DRAFT">Draft (Hidden)</option>
                    <option value="PUBLISHED">Published (Visible)</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Deadline (Optional)</label>
                  <input
                    className="admin-form-input"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
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
                  {isSubmitting ? 'Saving...' : 'Save Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
