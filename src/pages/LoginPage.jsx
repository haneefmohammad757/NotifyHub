import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import './AuthPage.css';

/* Inline icons */
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
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);

    try {
      const user = await login(email.trim(), password, isAdmin ? 'ADMIN' : undefined);

      if (isAdmin && user.role !== 'ADMIN') {
        setError('Access denied. Administrator credentials required.');
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
    <div className={`auth-page ${isAdmin ? 'admin-theme' : 'student-theme'}`}>
      <div className="auth-wrapper">
        <div className="auth-card">
          
          {/* Card Header & Brand Logo */}
          <div className="auth-card__header">
            <div className="auth-card__logo">
              <Logo to={isAdmin ? '/admin' : '/student'} isAdmin={isAdmin} showTagline={true} />
            </div>

            <h1 className="auth-card__heading">
              {isAdmin ? 'Admin Portal' : 'Welcome Back'}
            </h1>
            <p className="auth-card__subheading">
              {isAdmin
                ? 'Sign in to access the NotifyHub admin control panel.'
                : 'Sign in to access your student dashboard & campus announcements.'}
            </p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="auth-error" role="alert">
                <span className="auth-error__icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="login-email">
                {isAdmin ? 'Admin Email' : 'Email Address'}
              </label>
              <div className="auth-field__input-wrapper">
                <span className="auth-field__input-icon"><IconMail /></span>
                <input
                  id="login-email"
                  className="auth-field__input"
                  type="email"
                  placeholder={isAdmin ? 'admin@notifyhub.edu' : 'student@notifyhub.edu'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-field">
              <div className="auth-field__label-row">
                <label className="auth-field__label" htmlFor="login-password">Password</label>
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={() => {
                    setResetEmail(email);
                    setResetError('');
                    setResetSuccess('');
                    setShowForgotModal(true);
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="auth-field__input-wrapper">
                <span className="auth-field__input-icon"><IconLock /></span>
                <input
                  id="login-password"
                  className="auth-field__input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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

            {/* Remember Me */}
            <div className="auth-remember-row">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  className="auth-remember__checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="auth-remember__label">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              className={`auth-submit ${isAdmin ? 'auth-submit--admin' : ''}`}
              type="submit"
              disabled={submitting}
            >
              <span>{submitting ? 'Signing in...' : (isAdmin ? 'Sign In to Dashboard' : 'Sign In')}</span>
              <span className="auth-submit__arrow"><IconArrowRight /></span>
            </button>
          </form>

          {/* Student Footer */}
          {!isAdmin && (
            <div className="auth-card__footer">
              <div className="auth-divider">
                <span className="auth-divider__line" />
                <span className="auth-divider__text">Don't have an account?</span>
                <span className="auth-divider__line" />
              </div>

              <Link to="/register" className="auth-secondary-btn">
                <IconUserPlus /> Create Student Account
              </Link>
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
              <h3 className="auth-modal-card__title">
                {isAdmin ? 'Reset Admin Password' : 'Reset Password'}
              </h3>
              <p className="auth-modal-card__subtitle">
                Enter your registered email address to set a new password.
              </p>
            </div>

            {resetSuccess ? (
              <div className="auth-modal-card__body">
                <div className="auth-success">{resetSuccess}</div>
                <button
                  type="button"
                  className="auth-submit"
                  onClick={() => setShowForgotModal(false)}
                  style={{ marginTop: '1.25rem', width: '100%' }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="auth-modal-form" noValidate>
                {resetError && <div className="auth-error">{resetError}</div>}

                <div className="auth-field">
                  <label className="auth-field__label">Registered Email</label>
                  <div className="auth-field__input-wrapper">
                    <span className="auth-field__input-icon"><IconMail /></span>
                    <input
                      type="email"
                      className="auth-field__input"
                      placeholder={isAdmin ? 'admin@notifyhub.edu' : 'student@notifyhub.edu'}
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-field__label">New Password</label>
                  <div className="auth-field__input-wrapper">
                    <span className="auth-field__input-icon"><IconLock /></span>
                    <input
                      type={resetShowPass ? 'text' : 'password'}
                      className="auth-field__input"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
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

                <div className="auth-field">
                  <label className="auth-field__label">Confirm New Password</label>
                  <div className="auth-field__input-wrapper">
                    <span className="auth-field__input-icon"><IconLock /></span>
                    <input
                      type={resetShowPass ? 'text' : 'password'}
                      className="auth-field__input"
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
                    className="auth-submit"
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
