import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import './AuthPage.css';

/* Icons for fields and feature cards */
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
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconUserPlus = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
    <circle cx="10" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" strokeLinecap="round" />
    <line x1="22" y1="11" x2="16" y2="11" strokeLinecap="round" />
  </svg>
);

export default function LoginPage({ isAdmin = false }) {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetShowPass, setResetShowPass] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetting, setResetting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);

    try {
      const user = await login(email.trim(), password, isAdmin ? 'ADMIN' : 'STUDENT');

      if (isAdmin && user.role !== 'ADMIN') {
        setError('Access denied. Account does not have Administrator privileges.');
        setSubmitting(false);
        return;
      }

      navigate(user.role === 'ADMIN' ? '/admin' : '/student', { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetEmail.trim()) {
      setResetError('Please enter your registered email address.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setResetError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please try again.');
      return;
    }

    setResetting(true);
    try {
      const res = await resetPassword(resetEmail.trim(), newPassword, isAdmin ? 'ADMIN' : undefined);
      setResetSuccess(res.message || 'Password reset successfully! You can now sign in.');
      setEmail(resetEmail.trim());
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setResetError(err.message || 'Failed to reset password.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="auth-split-page">
      {/* Crisp Background Campus Image Overlay */}
      <div className="auth-bg-overlay" />

      <div className="auth-split-container">
        
        {/* Left Panel — Custom Punchlines & Features */}
        <div className="auth-left-panel">
          <div className="auth-left-header">
            <Logo to="/" showTagline={false} />
            <span className="auth-tagline-pills">NOTIFYHUB • CAMPUS INTELLIGENCE</span>
          </div>

          <div className="auth-left-hero">
            <h1 className="auth-hero-title">
              {isAdmin ? (
                <>
                  Admin Command Panel. <br />
                  <span className="gradient-highlight">Manage Campus Live.</span>
                </>
              ) : (
                <>
                  Stay Informed. <br />
                  <span className="gradient-highlight">Stay Ahead on Campus.</span>
                </>
              )}
            </h1>

            <p className="auth-hero-subtitle">
              {isAdmin
                ? 'Centralized administrative control panel to publish targeted announcements, schedule events, and resolve student support tickets.'
                : 'Connecting students and campus administration with real-time circulars, event registrations, and instant support ticket resolution.'}
            </p>

            <div className="auth-quote-card">
              <span className="quote-mark">“</span>
              <p>Empowering every student with timely information and effortless campus engagement.</p>
            </div>
          </div>

          {/* 4 Feature Mini-Cards */}
          <div className="auth-feature-grid">
            <div className="feature-mini-card">
              <div className="feature-mini-icon yellow">📢</div>
              <div>
                <h4>Targeted Circulars</h4>
                <p>Filtered by dept & year</p>
              </div>
            </div>

            <div className="feature-mini-card">
              <div className="feature-mini-icon red">📅</div>
              <div>
                <h4>Event Calendar</h4>
                <p>One-click registrations</p>
              </div>
            </div>

            <div className="feature-mini-card">
              <div className="feature-mini-icon cyan">💬</div>
              <div>
                <h4>Instant Helpdesk</h4>
                <p>Direct query resolution</p>
              </div>
            </div>

            <div className="feature-mini-card">
              <div className="feature-mini-icon orange">🚨</div>
              <div>
                <h4>Urgent Alerts</h4>
                <p>High-priority deadlines</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Professional Glass Login Card */}
        <div className="auth-right-panel">
          <div className="auth-glass-card">
            
            <div className="auth-card-title-box">
              <div className="auth-card-emoji">👋</div>
              <h2 className="auth-card-title">
                Welcome <span className="blue-gradient-text">{isAdmin ? 'Admin' : 'Back'}</span>
              </h2>
              <p className="auth-card-subtitle">
                {isAdmin
                  ? 'Login to access administrative command panel'
                  : 'Login to continue to your account'}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="auth-error-banner" role="alert">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="login-email">
                  {isAdmin ? 'Admin Email' : 'Email'}
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><IconMail /></span>
                  <input
                    id="login-email"
                    className="auth-input"
                    type="email"
                    placeholder={isAdmin ? 'admin@notifyhub' : 'student@notifyhub.edu'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="login-password">Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><IconLock /></span>
                  <input
                    id="login-password"
                    className="auth-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-pass"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="auth-options-row">
                <label className="auth-remember-label">
                  <input
                    type="checkbox"
                    className="auth-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="auth-forgot-btn"
                  onClick={() => {
                    setResetEmail(email);
                    setResetError('');
                    setResetSuccess('');
                    setShowForgotModal(true);
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Sign In Button */}
              <button
                className={`auth-submit-gradient ${isAdmin ? 'admin-gradient' : ''}`}
                type="submit"
                disabled={submitting}
              >
                <span>{submitting ? 'Signing in...' : (isAdmin ? 'Sign In to Control Panel' : 'Sign In')}</span>
                <IconArrowRight />
              </button>
            </form>

            {/* Card Footer Actions */}
            {isAdmin ? (
              <div className="auth-card-footer">
                <div className="auth-divider">
                  <span className="divider-line"></span>
                  <span className="divider-text">or</span>
                  <span className="divider-line"></span>
                </div>

                <Link to="/login" className="auth-create-account-btn auth-student-redirect-btn">
                  <IconUser /> Student Login
                </Link>
              </div>
            ) : (
              <div className="auth-card-footer">
                <div className="auth-divider">
                  <span className="divider-line"></span>
                  <span className="divider-text">or</span>
                  <span className="divider-line"></span>
                </div>

                <Link to="/register" className="auth-create-account-btn">
                  <IconUserPlus /> Create New Account
                </Link>
              </div>
            )}

            {/* Security Badge */}
            <div className="auth-security-badge">
              <span className="security-icon">🔒</span>
              <div>
                <strong>Secure. Private. Trusted.</strong>
                <p>Your data is protected with enterprise-grade security.</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="auth-modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="auth-modal-close-btn" onClick={() => setShowForgotModal(false)} aria-label="Close modal">
              ✕
            </button>
            
            <div className="auth-modal-card__header">
              <div className="auth-modal-card__icon">🔑</div>
              <h3 className="auth-modal-card__title">
                {isAdmin ? 'Reset Admin Password' : 'Reset Password'}
              </h3>
              <p className="auth-modal-card__subtitle">
                Enter your registered email address to set a new password.
              </p>
            </div>

            {resetSuccess ? (
              <div className="auth-modal-card__body">
                <div className="auth-success-banner">{resetSuccess}</div>
                <button
                  type="button"
                  className="auth-submit-gradient"
                  onClick={() => setShowForgotModal(false)}
                  style={{ marginTop: '1.25rem', width: '100%' }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="auth-modal-form" noValidate>
                {resetError && <div className="auth-error-banner">{resetError}</div>}

                <div className="auth-form-group">
                  <label className="auth-label">Registered Email</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><IconMail /></span>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder={isAdmin ? 'admin@notifyhub' : 'student@notifyhub.edu'}
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-label">New Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><IconLock /></span>
                    <input
                      type={resetShowPass ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-toggle-pass"
                      onClick={() => setResetShowPass(!resetShowPass)}
                    >
                      {resetShowPass ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-label">Confirm New Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><IconLock /></span>
                    <input
                      type={resetShowPass ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-modal-actions">
                  <button
                    type="button"
                    className="auth-modal-cancel"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="auth-submit-gradient"
                    style={{ flex: 1 }}
                    disabled={resetting}
                  >
                    {resetting ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
