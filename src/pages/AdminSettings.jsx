import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import './AdminSettings.css';

export default function AdminSettings() {
  const { user } = useAuth();
  const [systemInfo, setSystemInfo] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load preferences from localStorage (or defaults)
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('notifyhub_admin_prefs');
    return saved ? JSON.parse(saved) : { emailNotifications: true, systemAlerts: true, theme: 'dark' };
  });

  useEffect(() => {
    localStorage.setItem('notifyhub_admin_prefs', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    async function fetchSystemInfo() {
      try {
        const data = await api.get('/health');
        setSystemInfo(data);
      } catch (err) {
        setSystemInfo({ status: 'error', database: 'unknown' });
      }
    }
    fetchSystemInfo();
  }, []);

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setPassError('New passwords do not match.');
    }
    if (passwords.newPassword.length < 6) {
      return setPassError('New password must be at least 6 characters long.');
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setPassSuccess('Password updated successfully.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-settings">
      <div className="admin-settings__header">
        <h2>Admin Settings</h2>
        <p>Manage your account, preferences, and view system status.</p>
      </div>

      <div className="admin-settings__grid">
        
        {/* Profile Card */}
        <div className="admin-settings__card">
          <h3 className="admin-settings__card-title">Profile Information</h3>
          <div className="admin-settings__profile">
            <div className="admin-settings__avatar">
              {(user?.name && user.name !== 'Admin User' ? user.name : 'Balaji Lanka').charAt(0)}
            </div>
            <div className="admin-settings__profile-details">
              <div className="admin-settings__profile-name">
                {user?.name && user.name !== 'Admin User' ? user.name : 'Balaji Lanka'}
              </div>
              <div className="admin-settings__profile-email">{user?.email || 'admin@notifyhub.edu'}</div>
              <div className="admin-settings__profile-role">
                <span className="admin-badge admin-badge--primary">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Password Card */}
        <div className="admin-settings__card">
          <h3 className="admin-settings__card-title">Change Password</h3>
          <form className="admin-settings__form" onSubmit={handlePasswordChange}>
            {passError && <div className="admin-error-banner">{passError}</div>}
            {passSuccess && <div className="admin-success-banner">{passSuccess}</div>}

            <div className="admin-form-group">
              <label className="admin-form-label">Current Password</label>
              <input 
                type="password" 
                className="admin-form-input" 
                value={passwords.currentPassword}
                onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                required 
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">New Password</label>
              <input 
                type="password" 
                className="admin-form-input" 
                value={passwords.newPassword}
                onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                required 
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Confirm New Password</label>
              <input 
                type="password" 
                className="admin-form-input" 
                value={passwords.confirmPassword}
                onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                required 
              />
            </div>
            <button type="submit" className="admin-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Preferences Card */}
        <div className="admin-settings__card">
          <h3 className="admin-settings__card-title">Preferences</h3>
          <div className="admin-settings__pref-list">
            <label className="admin-settings__pref-item">
              <div className="admin-settings__pref-info">
                <strong>Email Notifications</strong>
                <span>Receive daily summaries of student activity.</span>
              </div>
              <input 
                type="checkbox" 
                checked={preferences.emailNotifications}
                onChange={e => setPreferences({...preferences, emailNotifications: e.target.checked})}
                className="admin-settings__toggle"
              />
            </label>
            <label className="admin-settings__pref-item">
              <div className="admin-settings__pref-info">
                <strong>System Alerts</strong>
                <span>Notify me about critical system events.</span>
              </div>
              <input 
                type="checkbox" 
                checked={preferences.systemAlerts}
                onChange={e => setPreferences({...preferences, systemAlerts: e.target.checked})}
                className="admin-settings__toggle"
              />
            </label>
          </div>
        </div>

        {/* System Info Card */}
        <div className="admin-settings__card">
          <h3 className="admin-settings__card-title">System Information</h3>
          <div className="admin-settings__sysinfo">
            <div className="admin-settings__sysinfo-item">
              <span className="admin-settings__sysinfo-label">Application Version</span>
              <span className="admin-settings__sysinfo-value">v1.13.0 (Build 13)</span>
            </div>
            <div className="admin-settings__sysinfo-item">
              <span className="admin-settings__sysinfo-label">Backend Status</span>
              <span className="admin-settings__sysinfo-value">
                {systemInfo ? (
                  <span style={{ color: systemInfo.status === 'ok' ? 'var(--success)' : 'var(--danger)' }}>
                    {systemInfo.status.toUpperCase()}
                  </span>
                ) : 'Checking...'}
              </span>
            </div>
            <div className="admin-settings__sysinfo-item">
              <span className="admin-settings__sysinfo-label">Database Connection</span>
              <span className="admin-settings__sysinfo-value">
                {systemInfo ? (
                  <span style={{ color: systemInfo.database === 'connected' ? 'var(--success)' : 'var(--danger)' }}>
                    {systemInfo.database.toUpperCase()}
                  </span>
                ) : 'Checking...'}
              </span>
            </div>
            <div className="admin-settings__sysinfo-item">
              <span className="admin-settings__sysinfo-label">Environment</span>
              <span className="admin-settings__sysinfo-value">Production</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
