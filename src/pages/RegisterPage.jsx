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

    if (!name.trim() || !email.trim() || !rollNo.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
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
      await register(name.trim(), email.trim(), password, rollNo.trim(), year, department);
      navigate('/student', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page student-theme">
      <div className="auth-wrapper" style={{ maxWidth: '480px' }}>
        <div className="auth-card">
          
          <div className="auth-card__header">
            <div className="auth-card__logo">
              <Logo to="/student" showTagline={true} />
            </div>

            <h1 className="auth-card__heading">Create Account</h1>
            <p className="auth-card__subheading">
              Register your NotifyHub student profile to receive department & year circulars.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="auth-error" role="alert">
                <span className="auth-error__icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-name">Full Name</label>
              <div className="auth-field__input-wrapper">
                <span className="auth-field__input-icon"><IconUser /></span>
                <input
                  id="reg-name"
                  className="auth-field__input"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-email">Email Address</label>
              <div className="auth-field__input-wrapper">
                <span className="auth-field__input-icon"><IconMail /></span>
                <input
                  id="reg-email"
                  className="auth-field__input"
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
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-roll">Roll Number</label>
              <div className="auth-field__input-wrapper">
                <span className="auth-field__input-icon"><IconId /></span>
                <input
                  id="reg-roll"
                  className="auth-field__input"
                  type="text"
                  placeholder="e.g. 21A91A0501"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Year & Department Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {/* Year */}
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="reg-year">Academic Year</label>
                <div className="auth-field__input-wrapper">
                  <span className="auth-field__input-icon"><IconAcademic /></span>
                  <select
                    id="reg-year"
                    className="auth-field__input"
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

              {/* Department */}
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="reg-dept">Department</label>
                <div className="auth-field__input-wrapper">
                  <span className="auth-field__input-icon"><IconAcademic /></span>
                  <select
                    id="reg-dept"
                    className="auth-field__input"
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
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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

            <button
              className="auth-submit"
              type="submit"
              disabled={submitting}
            >
              <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
              <span className="auth-submit__arrow"><IconArrowRight /></span>
            </button>
          </form>

          <div className="auth-card__footer">
            <div className="auth-divider">
              <span className="auth-divider__line" />
              <span className="auth-divider__text">Already have an account?</span>
              <span className="auth-divider__line" />
            </div>

            <Link to="/login" className="auth-secondary-btn">
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
