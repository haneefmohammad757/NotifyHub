import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import './AuthPage.css';

/* Icons */
const IconMail = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="M22 7l-10 7L2 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="3" />
    <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" />
    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
    <polyline points="12 5 19 12 12 19" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconUser = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
    <circle cx="10" cy="7" r="4" />
  </svg>
);

const IconId = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <line x1="15" y1="8" x2="17" y2="8" />
    <line x1="15" y1="12" x2="17" y2="12" />
    <line x1="7" y1="16" x2="17" y2="16" />
  </svg>
);

const IconAcademic = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [year, setYear] = useState('1st Year');
  const [department, setDepartment] = useState('CSE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const cleanedRoll = rollNo.trim().toUpperCase();

    if (!trimmedName || !trimmedEmail || !cleanedRoll || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    const ROLL_NO_REGEX = /^[0-9]{2}[A-Z0-9]{8}$/;
    if (!ROLL_NO_REGEX.test(cleanedRoll)) {
      setError('Invalid Roll Number format. Example: 21891A0501 (Expected 10-character code).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setSubmitting(true);
    try {
      await register(trimmedName, trimmedEmail, password, cleanedRoll, year, department);
      navigate('/student', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-split-page">
      <div className="auth-bg-overlay" />

      <div className="auth-split-container">
        
        {/* Left Panel */}
        <div className="auth-left-panel">
          <div className="auth-left-header">
            <Logo to="/" showTagline={false} />
            <span className="auth-tagline-pills">CONNECT • INFORM • EMPOWER</span>
          </div>

          <div className="auth-hero-content">
            <h1 className="auth-hero-title">
              Join Your Campus <br />
              <span className="gradient-highlight">Notification Hub.</span>
            </h1>

            <p className="auth-hero-subtitle">
              Register your student profile to automatically receive targeted circulars, event alerts, and query updates filtered for your department and year.
            </p>

            <div className="auth-quote-card">
              <span className="quote-mark">“</span>
              <p>Never miss a crucial exam deadline, placement drive, or campus announcement again.</p>
            </div>
          </div>

          {/* 4 Feature Cards */}
          <div className="auth-feature-grid">
            <div className="feature-mini-card">
              <div className="feature-mini-icon yellow">🔔</div>
              <div>
                <h4>Real-Time Notifications</h4>
                <p>Instant updates</p>
              </div>
            </div>

            <div className="feature-mini-card">
              <div className="feature-mini-icon red">📅</div>
              <div>
                <h4>Events & Calendars</h4>
                <p>Never miss out</p>
              </div>
            </div>

            <div className="feature-mini-card">
              <div className="feature-mini-icon cyan">💬</div>
              <div>
                <h4>Student Queries</h4>
                <p>Get answers fast</p>
              </div>
            </div>

            <div className="feature-mini-card">
              <div className="feature-mini-icon orange">📢</div>
              <div>
                <h4>Announcements</h4>
                <p>Stay in the loop</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Glass Register Card */}
        <div className="auth-right-panel">
          <div className="auth-glass-card" style={{ maxWidth: '480px' }}>
            
            <div className="auth-card-title-box">
              <div className="auth-card-emoji">🚀</div>
              <h2 className="auth-card-title">
                Create <span className="blue-gradient-text">Account</span>
              </h2>
              <p className="auth-card-subtitle">
                Fill in your student credentials to get started
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="auth-error-banner" role="alert">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-name">Full Name</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><IconUser /></span>
                  <input
                    id="reg-name"
                    className="auth-input"
                    type="text"
                    placeholder="e.g. Yash Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-email">Email Address</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><IconMail /></span>
                  <input
                    id="reg-email"
                    className="auth-input"
                    type="email"
                    placeholder="student@notifyhub.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Roll Number */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-roll">
                  Roll Number <span style={{ fontWeight: 'normal', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>(Format: 21891A0501)</span>
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><IconId /></span>
                  <input
                    id="reg-roll"
                    className="auth-input"
                    type="text"
                    placeholder="e.g. 21891A0501"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Year & Department Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="reg-year">Academic Year</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><IconAcademic /></span>
                    <select
                      id="reg-year"
                      className="auth-input"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      style={{ appearance: 'none', cursor: 'pointer' }}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="reg-dept">Department</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><IconAcademic /></span>
                    <select
                      id="reg-dept"
                      className="auth-input"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={{ appearance: 'none', cursor: 'pointer' }}
                    >
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="MECH">MECH</option>
                      <option value="CIVIL">CIVIL</option>
                      <option value="IT">IT</option>
                      <option value="AI&DS">AI&amp;DS</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-password">Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><IconLock /></span>
                  <input
                    id="reg-password"
                    className="auth-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-pass"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><IconLock /></span>
                  <input
                    id="reg-confirm"
                    className="auth-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-pass"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <button
                className="auth-submit-gradient"
                type="submit"
                disabled={submitting}
              >
                <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
                <IconArrowRight />
              </button>
            </form>

            <div className="auth-card-footer">
              <div className="auth-divider">
                <span className="divider-line"></span>
                <span className="divider-text">Already registered?</span>
                <span className="divider-line"></span>
              </div>

              <Link to="/login" className="auth-create-account-btn">
                Sign In to Existing Account
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
