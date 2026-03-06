import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useT } from '../../utils/i18n';
import NotificationBell from '../UI/NotificationBell';
import './Header.css';

const ThemeIcon = ({ theme }) => {
  const icons = {
    white:    <span className="theme-dot white-dot" />,
    black:    <span className="theme-dot black-dot" />,
    lavender: <span className="theme-dot lavender-dot" />,
    nature:   <span className="theme-dot nature-dot" />,
    orange:   <span className="theme-dot orange-dot" />,
  };
  return icons[theme] || <span className="theme-dot" />;
};

export default function Header() {
  const { theme, setTheme, themes } = useTheme();
  const { lang, toggleLang } = useLanguage();
  const { isLoggedIn, admin, logout, isSuperAdmin } = useAuth();
  const [themeOpen, setThemeOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT(lang);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const themeLabels = {
    white:    t('themes.white'),
    black:    t('themes.black'),
    lavender: t('themes.lavender'),
    nature:   t('themes.nature'),
    orange:   t('themes.orange'),
  };

  const navLinks = [
    { to: '/', label: t('nav.schedule'), always: true },
    { to: '/admin', label: t('nav.admin'), auth: true },
    { to: '/admin/profile', label: t('admin.myProfile'), auth: true },
    { to: '/admin/manage', label: t('admin.manageAdmins'), superadmin: true },
  ].filter((l) => {
    if (l.always) return true;
    if (l.superadmin) return isSuperAdmin;
    if (l.auth) return isLoggedIn;
    return !isLoggedIn;
  });

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo" onClick={() => setMobileOpen(false)}>
          <span className="logo-mark">X</span>
          <span className="logo-text">elix</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="header-nav">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link ${isActive(l.to) ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
          {isLoggedIn && <span className="nav-badge">{admin?.displayName}</span>}
          {!isLoggedIn && (
            <Link
              to="/admin/login"
              className={`nav-link ${location.pathname === '/admin/login' ? 'active' : ''}`}
            >
              {t('nav.admin')}
            </Link>
          )}
        </nav>

        {/* Controls */}
        <div className="header-controls">
          <NotificationBell />
          <button className="ctrl-btn lang-btn" onClick={toggleLang} title="Toggle Language">
            {t('lang.switch')}
          </button>

          {/* Theme picker */}
          <div className="theme-picker">
            <button
              className="ctrl-btn theme-btn"
              onClick={() => setThemeOpen((o) => !o)}
              aria-label="Select theme"
            >
              <ThemeIcon theme={theme} />
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
            {themeOpen && (
              <div className="theme-dropdown glass">
                {themes.map((th) => (
                  <button
                    key={th}
                    className={`theme-option ${theme === th ? 'selected' : ''}`}
                    onClick={() => { setTheme(th); setThemeOpen(false); }}
                  >
                    <ThemeIcon theme={th} />
                    <span style={lang === 'ar' ? { fontFamily: 'var(--font-ar)', fontSize: '0.85rem' } : {}}>
                      {themeLabels[th]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoggedIn && (
            <button className="ctrl-btn logout-btn" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          )}

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className={`ham-line ${mobileOpen ? 'open' : ''}`} />
            <span className={`ham-line ${mobileOpen ? 'open' : ''}`} />
            <span className={`ham-line ${mobileOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`mobile-link ${isActive(l.to) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {!isLoggedIn && (
            <Link
              to="/admin/login"
              className={`mobile-link ${location.pathname === '/admin/login' ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.admin')}
            </Link>
          )}
          {isLoggedIn && (
            <>
              <div className="mobile-divider" />
              <div className="mobile-controls">
                <button className="ctrl-btn logout-btn" onClick={handleLogout}>
                  {t('nav.logout')}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
