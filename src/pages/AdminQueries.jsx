import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './AdminQueries.css';

// SVG Icons
const IconMessage = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function AdminQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  
  // Form state
  const [status, setStatus] = useState('OPEN');
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const data = await api.get('/queries');
      setQueries(data);
      setError(null);
    } catch (err) {
      setError('Failed to load queries.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (query) => {
    setSelectedQuery(query);
    setStatus(query.status);
    setResponse(query.response || '');
    setFormError(null);
  };

  const closeModal = () => {
    setSelectedQuery(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const updated = await api.put(`/queries/${selectedQuery.id}`, { status, response });
      setQueries(queries.map(q => q.id === updated.id ? updated : q));
      closeModal();
    } catch (err) {
      setFormError(err.message || 'Failed to update query.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this query?')) return;
    try {
      await api.delete(`/queries/${id}`);
      setQueries(queries.filter(q => q.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete query.');
    }
  };

  if (loading) {
    return <div className="page-loading">Loading student queries...</div>;
  }

  if (error) {
    return (
      <div className="page-error">
        <p>{error}</p>
        <button className="btn btn--primary" onClick={fetchQueries}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="admin-queries">
      <div className="admin-queries__header">
        <h1 className="admin-queries__title">Student Queries</h1>
      </div>
      
      {queries.length === 0 ? (
        <div className="query-empty">No student queries yet.</div>
      ) : (
        <div className="admin-queries__table-container">
          <table className="admin-queries__table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q) => (
                <tr key={q.id}>
                  <td>
                    <div>{q.student?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.student?.email}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{q.subject}</td>
                  <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-badge--${q.status.toLowerCase()}`}>
                      {q.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="admin-queries__actions">
                      <button className="btn-icon" onClick={() => openModal(q)} aria-label="Respond">
                        <IconMessage />
                      </button>
                      <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(q.id)} aria-label="Delete">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedQuery && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Respond to Query</h2>
              <button className="modal-close" onClick={closeModal}><IconClose /></button>
            </div>
            
            <div className="modal-body">
              <div className="query-detail-group">
                <div className="query-detail-label">Student</div>
                <div className="query-detail-value">{selectedQuery.student?.name} ({selectedQuery.student?.email})</div>
              </div>
              
              <div className="query-detail-group">
                <div className="query-detail-label">Subject</div>
                <div className="query-detail-value" style={{ fontWeight: 600 }}>{selectedQuery.subject}</div>
              </div>
              
              <div className="query-detail-group">
                <div className="query-detail-label">Message</div>
                <div className="query-detail-value" style={{ whiteSpace: 'pre-wrap' }}>{selectedQuery.message}</div>
              </div>

              <form onSubmit={handleSubmit} className="query-response-area">
                {formError && <div className="form-error">{formError}</div>}
                
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="form-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="response">Admin Response</label>
                  <textarea
                    id="response"
                    className="form-input"
                    rows="5"
                    placeholder="Type your response here..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn btn--secondary" onClick={closeModal} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn--primary" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Response'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
