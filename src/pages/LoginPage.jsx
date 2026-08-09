import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import './AuthPage.css';

/**
 * Login page — used for both student (/login) and admin (/admin/login).
 * The isAdmin prop controls heading text and post-login redirect only.
 * Actual role authorization happens on the backend.
 */

/* ── Inline SVG icons for the auth page ── */
const IconMail = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 7L2 7" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconUser = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const IconCheckCircle = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);



/* ── Student Hero (left side) ── */
function StudentHero() {
  return (
    <div className="auth-hero">
      {/* Logo */}
      <div style={{ marginBottom: '2.5rem' }}>
        <Logo to="/" inverse />
        <span className="auth-hero__logo-tagline" style={{ marginTop: '0.5rem' }}>Stay Informed. Stay Ahead.</span>
      </div>

      {/* Heading */}
      <h1 className="auth-hero__heading">
        Your Campus.<br />
        Your <span className="auth-hero__heading-accent">Universe.</span>
      </h1>

      <p className="auth-hero__description">
        The central hub for announcements, events, deadlines, and everything happening on campus.
      </p>

      {/* Quote */}
      <div className="auth-hero__quote">
        <p>Empowering students with real-time information and meaningful engagement.</p>
      </div>

      {/* Feature cards */}
      <div className="auth-hero__features">
        <div className="auth-feature-card">
          <span className="auth-feature-card__icon">🔔</span>
          <div className="auth-feature-card__title">Real-Time Notifications</div>
          <div className="auth-feature-card__subtitle">Instant updates</div>
        </div>
        <div className="auth-feature-card">
          <span className="auth-feature-card__icon">📅</span>
          <div className="auth-feature-card__title">Events & Calendars</div>
          <div className="auth-feature-card__subtitle">Never miss out</div>
        </div>
        <div className="auth-feature-card">
          <span className="auth-feature-card__icon">💬</span>
          <div className="auth-feature-card__title">Student Queries</div>
          <div className="auth-feature-card__subtitle">Get answers fast</div>
        </div>
        <div className="auth-feature-card">
          <span className="auth-feature-card__icon">📢</span>
          <div className="auth-feature-card__title">Announcements</div>
          <div className="auth-feature-card__subtitle">Stay in the loop</div>
        </div>
      </div>
    </div>
  );
}

/* ── Admin Hero (left side) ── */
function AdminHero() {
  return (
    <div className="auth-hero">
      {/* Security badges */}
      <div className="auth-admin-badges">
        <div className="auth-admin-badge">
          <div className="auth-admin-badge__icon auth-admin-badge__icon--shield">🛡️</div>
          <div className="auth-admin-badge__text">
            <span className="auth-admin-badge__title">Secure Access</span>
            <span className="auth-admin-badge__subtitle">Verified Admin Only</span>
          </div>
        </div>
        <div className="auth-admin-badge">
          <div className="auth-admin-badge__icon auth-admin-badge__icon--status">●</div>
          <div className="auth-admin-badge__text">
            <span className="auth-admin-badge__title">System Status</span>
            <span className="auth-admin-badge__subtitle">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Heading */}
      <h1 className="auth-hero__heading">
        Admin<br />
        <span className="auth-hero__heading-accent">Control Center</span>
      </h1>

      <p className="auth-hero__description">
        Manage campus announcements, events, and student queries from a single, secure dashboard.
      </p>

      {/* Branding at bottom */}
      <div className="auth-hero__branding">
        <div>
          <Logo to="/admin" isAdmin />
          <span className="auth-hero__branding-sub" style={{ marginTop: '0.5rem' }}>Empowering Campus Communication</span>
        </div>
      </div>
    </div>
  );
}


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
    setSubmitting(true);

    try {
      const user = await login(email, password, isAdmin ? 'ADMIN' : undefined);

      if (isAdmin && user.role !== 'ADMIN') {
        setError('Access denied. Admin credentials required.');
        setSubmitting(false);
        return;
      }

      navigate(user.role === 'ADMIN' ? '/admin' : '/student', { replace: true });
    } catch (err) {
      setError(err.message);
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
      setResetError('Passwords do not match. Please check and try again.');
      return;
    }

    setResetting(true);
    try {
      const res = await resetPassword(resetEmail.trim(), newPassword, isAdmin ? 'ADMIN' : undefined);
      setResetSuccess(res.message || 'Password reset successfully!');
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
    <div className={`auth-page ${isAdmin ? 'admin-theme' : ''}`}>
      {/* Left Hero */}
      {isAdmin ? <AdminHero /> : <StudentHero />}

      {/* Right Form */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card__header">
            {/* Icon */}
            <div className={`auth-card__icon ${isAdmin ? 'auth-card__icon--admin' : 'auth-card__icon--student'}`}>
              {isAdmin ? '🏛️' : '👋'}
            </div>

            {/* Heading */}
            <h1 className="auth-card__heading">
              {isAdmin ? (
                <>Admin <span>Portal</span></>
              ) : (
                <>Welcome <span>Back</span></>
              )}
            </h1>

            {/* Admin restricted badge */}
            {isAdmin && (
              <div className="auth-card__restricted-badge">
                🔒 Restricted Access
              </div>
            )}

            {/* Subheading */}
            <p className="auth-card__subheading">
              {isAdmin
                ? 'Sign in to manage and monitor the NotifyHub platform'
                : <>Login to continue to <strong>your account</strong></>}
            </p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-error">{error}</div>}

            {/* Email */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="login-email">
                {isAdmin ? 'Admin Email' : 'Email'}
              </label>
              <div className="auth-field__input-wrapper">
                <span className="auth-field__input-icon"><IconMail /></span>
                <input
                  id="login-email"
                  className="auth-field__input"
                  type="email"
                  placeholder={isAdmin ? 'Enter admin email' : 'Enter your email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="login-password">Password</label>
              <div className="auth-field__input-wrapper">
                <span className="auth-field__input-icon"><IconLock /></span>
                <input
                  id="login-password"
                  className="auth-field__input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="auth-field__toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="auth-remember-row">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="auth-forgot"
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

            {/* Submit */}
            <button
              className={`auth-submit ${isAdmin ? 'auth-submit--admin' : 'auth-submit--student'}`}
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Signing in...' : (
                <>
                  {isAdmin ? '✓ Sign In to Dashboard' : 'Sign In'}
                  <span className="auth-submit__arrow"><IconArrowRight /></span>
                </>
              )}
            </button>
          </form>

          {/* Student: divider + create account */}
          {!isAdmin && (
            <>
              <div className="auth-divider">
                <span className="auth-divider__line" />
                <span className="auth-divider__text">or</span>
                <span className="auth-divider__line" />
              </div>

              <Link to="/register" className="auth-secondary-btn">
                <IconUser /> Create New Account
              </Link>

              <div className="auth-trust-badge">
                <span className="auth-trust-badge__icon">🔐</span>
                <div className="auth-trust-badge__text">
                  <strong>Secure. Private. Trusted.</strong><br />
                  Your data is protected with enterprise-grade security.
                </div>
              </div>
            </>
          )}

          {/* Admin: security feature cards */}
          {isAdmin && (
            <div className="auth-security-footer">
              <div className="auth-security-footer__label">Secure Admin Access</div>
              <div className="auth-security-cards">
                <div className="auth-security-card">
                  <span className="auth-security-card__icon">✓</span>
                  <div className="auth-security-card__title">Secure Login</div>
                  <div className="auth-security-card__subtitle">256-bit encryption</div>
                </div>
                <div className="auth-security-card">
                  <span className="auth-security-card__icon">👥</span>
                  <div className="auth-security-card__title">Role Verified</div>
                  <div className="auth-security-card__subtitle">Admin privileges</div>
                </div>
                <div className="auth-security-card">
                  <span className="auth-security-card__icon">📊</span>
                  <div className="auth-security-card__title">Activity Tracked</div>
                  <div className="auth-security-card__subtitle">Real-time monitoring</div>
                </div>
              </div>
              <div className="auth-security-disclaimer">
                <IconCheckCircle />
                Authorized personnel only. All activities are logged and monitored.
              </div>
            </div>
          )}
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
              <h2 className="auth-modal-card__title">
                {isAdmin ? 'Reset Admin Password' : 'Reset Password'}
              </h2>
              <p className="auth-modal-card__subtitle">
                Enter your registered {isAdmin ? 'admin' : 'student'} email address and create a new password.
              </p>
            </div>

            {resetSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <div className="auth-success">{resetSuccess}</div>
                <button
                  type="button"
                  className={`auth-submit ${isAdmin ? 'auth-submit--admin' : 'auth-submit--student'}`}
                  onClick={() => setShowForgotModal(false)}
                  style={{ marginTop: '1rem' }}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="auth-form" noValidate>
                {resetError && <div className="auth-error">{resetError}</div>}

                {/* Registered Email */}
                <div className="auth-field">
                  <label className="auth-field__label">Registered Email</label>
                  <div className="auth-field__input-wrapper">
                    <span className="auth-field__input-icon"><IconMail /></span>
                    <input
                      type="email"
                      className="auth-field__input"
                      placeholder={isAdmin ? 'admin@notifyhub.edu' : 'Enter registered email'}
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="auth-field">
                  <label className="auth-field__label">New Password</label>
                  <div className="auth-field__input-wrapper">
                    <span className="auth-field__input-icon"><IconLock /></span>
                    <input
                      type={resetShowPass ? 'text' : 'password'}
                      className="auth-field__input"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      className="auth-field__toggle-password"
                      onClick={() => setResetShowPass(!resetShowPass)}
                    >
                      {resetShowPass ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="auth-field">
                  <label className="auth-field__label">Confirm New Password</label>
                  <div className="auth-field__input-wrapper">
                    <span className="auth-field__input-icon"><IconLock /></span>
                    <input
                      type={resetShowPass ? 'text' : 'password'}
                      className="auth-field__input"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Action Buttons */}
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
                    className={`auth-submit ${isAdmin ? 'auth-submit--admin' : 'auth-submit--student'}`}
                    style={{ flex: 2 }}
                    disabled={resetting}
                  >
                    {resetting ? 'Resetting...' : 'Reset Password'}
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

