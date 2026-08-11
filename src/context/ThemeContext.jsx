import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Student theme mode ('light' | 'dark', default 'light')
  const [studentTheme, setStudentTheme] = useState(() => {
    return localStorage.getItem('nh_student_theme') || 'light';
  });

  // Admin theme mode ('dark' | 'light', default 'dark')
  const [adminTheme, setAdminTheme] = useState(() => {
    return localStorage.getItem('nh_admin_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('nh_student_theme', studentTheme);
  }, [studentTheme]);

  useEffect(() => {
    localStorage.setItem('nh_admin_theme', adminTheme);
  }, [adminTheme]);

  const toggleStudentTheme = () => {
    setStudentTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleAdminTheme = () => {
    setAdminTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{
      studentTheme,
      adminTheme,
      toggleStudentTheme,
      toggleAdminTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
