import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle({ isAdmin = false }) {
  const { studentTheme, adminTheme, toggleStudentTheme, toggleAdminTheme } = useTheme();

  const isDark = isAdmin ? adminTheme === 'dark' : studentTheme === 'dark';
  const handleToggle = isAdmin ? toggleAdminTheme : toggleStudentTheme;

  return (
    <button
      className={`theme-toggle-btn ${isDark ? 'theme-toggle-btn--dark' : 'theme-toggle-btn--light'}`}
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      <div className="theme-toggle-icon">
        {isDark ? (
          /* Sun Icon (Switch to Light) */
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          /* Moon Icon (Switch to Dark) */
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </div>
    </button>
  );
}
