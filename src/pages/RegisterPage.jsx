import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import './AuthPage.css';

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
        Create an account to get access to real-time announcements, events, deadlines, and everything happening on campus.
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

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/student', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <StudentHero />

      {/* Right Form */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card__header">
            {/* Icon */}
            <div className="auth-card__icon auth-card__icon--student">
              ✨
            </div>

            {/* Heading */}
            <h1 className="auth-card__heading">
              Create <span>Account</span>
            </h1>

            {/* Subheading */}
            <p className="auth-card__subheading">
              Join NotifyHub to stay updated with campus announcements and events.
            </p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-error">{error}</div>}

            {/* Name */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-name">Full Name</label>
              <div className="auth-field__input-wrapper">
                <span className="auth-field__input-icon"><IconUser /></span>
                <input
                  id="reg-name"
                  className="auth-field__input"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-email">Email</label>
              <div className="auth-field__input-wrapper">
                <span className="auth-field__input-icon"><IconMail /></span>
                <input
                  id="reg-email"
                  className="auth-field__input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-password">Password</label>
              <div className="auth-field__input-wrapper">
                <span className="auth-field__input-icon"><IconLock /></span>
                <input
                  id="reg-password"
                  className="auth-field__input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="auth-field__input-wrapper">
                <span className="auth-field__input-icon"><IconLock /></span>
                <input
                  id="reg-confirm"
                  className="auth-field__input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="auth-field__toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              className="auth-submit auth-submit--student"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Creating account...' : (
                <>
                  Create Account
                  <span className="auth-submit__arrow"><IconArrowRight /></span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span className="auth-divider__line" />
            <span className="auth-divider__text">or</span>
            <span className="auth-divider__line" />
          </div>

          <Link to="/login" className="auth-secondary-btn">
            Sign In to Existing Account
          </Link>
          
          <div className="auth-trust-badge">
            <span className="auth-trust-badge__icon">🔐</span>
            <div className="auth-trust-badge__text">
              <strong>Secure. Private. Trusted.</strong><br />
              Your data is protected with enterprise-grade security.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
