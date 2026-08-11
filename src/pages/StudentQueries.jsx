import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/EmptyState';
import './StudentQueries.css';

const IconHelp = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function StudentQueries() {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchQueries();
    const intervalId = setInterval(() => fetchQueries(true), 10000);
    return () => clearInterval(intervalId);
  }, [user]);

  const fetchQueries = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await api.get('/queries');
      
      // Filter so students ONLY see their own queries
      const myQueries = (data || []).filter(q => {
        if (!user) return true;
        if (q.studentId && user.id) return q.studentId === user.id;
        if (q.student?.id && user.id) return q.student.id === user.id;
        if (q.student?.email && user.email) return q.student.email === user.email;
        return true;
      });

      setQueries(myQueries);
      setError(null);
    } catch (err) {
      setError('Failed to load queries.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    if (!subject.trim() || !message.trim()) {
      setFormError('Subject and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      const newQuery = await api.post('/queries', { subject, message });
      setQueries([newQuery, ...queries]);
      setSubject('');
      setMessage('');
      await fetchQueries(true); // refresh immediately but silently
      setShowForm(false);
    } catch (err) {
      if (err.status === 409) {
        setFormError("You've already submitted an identical query recently. Please wait before submitting it again.");
      } else {
        setFormError(err.message || 'Unable to submit your query.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="student-queries">
        <EmptyState title="Loading queries..." description="Please wait while we fetch your data." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-queries">
        <EmptyState title="Error" description={error} />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="btn btn--primary" onClick={() => fetchQueries(false)}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-queries">
      <div className="student-queries__header">
        <h1 className="student-queries__title">Ask &amp; Get Answers</h1>
        {!showForm && (
          <button className="btn btn--primary" onClick={() => setShowForm(true)}>
            Ask a Query
          </button>
        )}
      </div>

      {showForm && (
        <div className="student-queries__form-card">
          <h2 className="student-queries__form-title">Raise a New Query</h2>
          <form onSubmit={handleSubmit}>
            {formError && <div className="form-error">{formError}</div>}
            
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                className="form-input"
                type="text"
                placeholder="Brief summary of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={100}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Description</label>
              <textarea
                id="message"
                className="form-input"
                rows="5"
                placeholder="Explain your issue here in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                required
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setShowForm(false)} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Query'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && queries.length === 0 ? (
        <div style={{ marginTop: '2rem' }}>
          <EmptyState 
            title="No queries yet"
            description="Need help with something? Submit a query to the administration."
          />
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn--primary" onClick={() => setShowForm(true)}>Ask a Query</button>
          </div>
        </div>
      ) : (
        <div className="student-queries__list">
          {queries.map((q) => (
            <div className="query-card" key={q.id}>
              <div className="query-card__header">
                <div className="query-card__header-left">
                  <h3 className="query-card__subject">{q.subject}</h3>
                  <div className="query-card__meta">
                    Submitted on {new Date(q.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`query-status query-status--${q.status.toLowerCase()}`}>
                    {q.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="query-card__body">
                <div className="query-card__label">Your Message</div>
                <div className="query-card__message">
                  {q.message}
                </div>
              </div>
              
              {q.response && (
                <div className="query-card__response-wrapper">
                  <div className="query-card__label query-card__label--response">
                    <IconHelp /> Admin Response
                  </div>
                  <div className="query-card__response">
                    {q.response}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
