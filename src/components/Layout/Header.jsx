import {
  useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo,
} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { useT } from '../../utils/i18n';
import NotificationBell from '../UI/NotificationBell';
import { applyAppUpdate } from '../../utils/pwaUpdate';
import { buildBottomNavPath, NAV_PILL_H } from '../../utils/bottomNavPath';
import BrandLogo from './BrandLogo';
import {
  IconRefresh, IconGlobe,
  IconCalendar, IconMore, IconLogin, IconUser, IconAdmin,
  IconPalette, IconResources, IconUsers, IconActivity, IconFolder, IconScheduleEdit,
} from './HeaderIcons';
import './Header.css';

const SHEET_EXIT_MS = 380;

const ThemeIcon = ({ theme }) => {
  const icons = {
    rain:     <span className="theme-dot rain-dot" />,
    white:    <span className="theme-dot white-dot" />,
    black:    <span className="theme-dot black-dot" />,
    lavender: <span className="theme-dot lavender-dot" />,
    nature:   <span className="theme-dot nature-dot" />,
    sea:      <span className="theme-dot sea-dot" />,
    purple:   <span className="theme-dot purple-dot" />,
    sun:      <span className="theme-dot sun-dot" />,
    horizon:  <span className="theme-dot horizon-dot" />,
    mesa:     <span className="theme-dot mesa-dot" />,
    noir:     <span className="theme-dot noir-dot" />,
  };
  return icons[theme] || <span className="theme-dot" />;
};

export default function Header() {
  const {
    theme, setTheme, themes, lowImpactThemes, highImpactThemes,
  } = useTheme();
  const { lang, toggleLang } = useLanguage();
  const { isLoggedIn, admin, logout, isSuperAdmin } = useAuth();
  const { user: currentUser, logout: userLogout } = useUserAuth();
  const [themeOpen, setThemeOpen] = useState(false);
  const [themeExiting, setThemeExiting] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreExiting, setMoreExiting] = useState(false);
  const [appUpdating, setAppUpdating] = useState(false);
  const themeVisible = themeOpen || themeExiting;
  const moreVisible = moreOpen || moreExiting;
  const themePickerRef = useRef(null);
  const morePickerRef = useRef(null);
  const chromeRef = useRef(null);
  const bottomInnerRef = useRef(null);
  const tabRefs = useRef([]);
  const [tabDot, setTabDot] = useState({ x: 0, ready: false });
  const [navFrame, setNavFrame] = useState({ w: 0 });
  const CENTER_TAB_INDEX = 2;

  const setTabRef = (index) => (node) => {
    tabRefs.current[index] = node;
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        themeOpen
        && themePickerRef.current
        && !themePickerRef.current.contains(e.target)
      ) {
        setThemeOpen(false);
        setThemeExiting(true);
      }
      if (
        moreOpen
        && morePickerRef.current
        && !morePickerRef.current.contains(e.target)
      ) {
        setMoreOpen(false);
        setMoreExiting(true);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [themeOpen, moreOpen]);

  useEffect(() => {
    document.body.classList.toggle('app-sheet-open', moreVisible || themeVisible);
    return () => document.body.classList.remove('app-sheet-open');
  }, [moreVisible, themeVisible]);

  useEffect(() => {
    if (!themeExiting) return undefined;
    const id = window.setTimeout(() => setThemeExiting(false), SHEET_EXIT_MS);
    return () => window.clearTimeout(id);
  }, [themeExiting]);

  useEffect(() => {
    if (!moreExiting) return undefined;
    const id = window.setTimeout(() => setMoreExiting(false), SHEET_EXIT_MS);
    return () => window.clearTimeout(id);
  }, [moreExiting]);

  const location = useLocation();
  const navigate = useNavigate();
  const t = useT(lang);

  const closeMore = () => {
    if (!moreVisible || moreExiting) return;
    setMoreOpen(false);
    setMoreExiting(true);
  };

  const toggleMore = () => {
    closeTheme();
    if (moreExiting) return;
    if (moreOpen) {
      closeMore();
      return;
    }
    setMoreExiting(false);
    setMoreOpen(true);
  };

  const closeTheme = () => {
    if (!themeVisible || themeExiting) return;
    setThemeOpen(false);
    setThemeExiting(true);
  };

  const toggleTheme = () => {
    if (moreOpen) closeMore();
    if (themeExiting) return;
    if (themeOpen) {
      closeTheme();
      return;
    }
    setThemeExiting(false);
    setThemeOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMore();
  };

  const handleUserLogout = () => {
    userLogout();
    navigate('/');
    closeMore();
  };

  const handleAppUpdate = async () => {
    if (appUpdating) return;
    setAppUpdating(true);
    try {
      await applyAppUpdate();
    } finally {
      setAppUpdating(false);
    }
  };

  const themeLabels = {
    rain:     t('themes.rain'),
    white:    t('themes.white'),
    black:    t('themes.black'),
    lavender: t('themes.lavender'),
    nature:   t('themes.nature'),
    sea:      t('themes.sea'),
    purple:   t('themes.purple'),
    sun:      t('themes.sun'),
    horizon:  t('themes.horizon'),
    mesa:     t('themes.mesa'),
    noir:     t('themes.noir'),
  };

  const renderThemeOption = (th, index) => (
    <button
      key={th}
      type="button"
      className={`theme-option theme-sheet-option ${theme === th ? 'selected' : ''}`}
      style={{
        animationDelay: themeExiting
          ? `${(themes.length - 1 - index) * 0.028}s`
          : `${index * 0.035}s`,
      }}
      onClick={() => { setTheme(th); closeTheme(); }}
    >
      <ThemeIcon theme={th} />
      <span>{themeLabels[th]}</span>
    </button>
  );

  const navLinks = [
    { to: '/', label: t('nav.schedule'), always: true, icon: null, group: 'main' },
    { to: '/admin', label: t('nav.admin'), auth: true, icon: 'schedule', group: 'workspace' },
    { to: '/admin/resources', label: t('resources.manageResources'), auth: true, icon: 'folder', group: 'workspace' },
    { to: '/admin/profile', label: t('admin.myProfile'), auth: true, icon: 'admin', group: 'manage' },
    { to: '/admin/manage', label: t('admin.manageAdmins'), superadmin: true, icon: 'users', group: 'manage' },
    { to: '/admin/users', label: t('admin.manageUsers'), auth: true, icon: 'users', group: 'manage' },
    { to: '/admin/activity', label: t('admin.userActivity'), auth: true, icon: 'activity', group: 'manage' },
  ].filter((l) => {
    if (l.always) return true;
    if (l.superadmin) return isSuperAdmin;
    if (l.auth) return isLoggedIn;
    return !isLoggedIn;
  });

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    if (to === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(to);
  };

  const moreNavLinks = navLinks.filter((l) => l.to !== '/');
  const workspaceLinks = moreNavLinks.filter((l) => l.group === 'workspace');
  const manageLinks = moreNavLinks.filter((l) => l.group === 'manage');

  const moreLinkIcon = (key) => {
    if (key === 'schedule') return <IconScheduleEdit />;
    if (key === 'folder') return <IconFolder />;
    if (key === 'admin') return <IconAdmin />;
    if (key === 'users') return <IconUsers />;
    if (key === 'activity') return <IconActivity />;
    return null;
  };

  const renderMoreLink = (l, index, baseDelay = 0.06) => (
    <Link
      key={l.to}
      to={l.to}
      className={`mobile-link mobile-link--icon app-sheet-option ${isActive(l.to) ? 'active' : ''}`}
      style={{ animationDelay: moreOpen ? `${baseDelay + index * 0.03}s` : undefined }}
      onClick={closeMore}
    >
      <span className="app-sheet-link-icon" aria-hidden>{moreLinkIcon(l.icon)}</span>
      <span className="app-sheet-link-label">{l.label}</span>
    </Link>
  );

  const moreActive = moreVisible || navLinks.some(
    (l) => l.to !== '/' && !l.to.startsWith('/resources') && isActive(l.to),
  );

  const activeTabIndex = useMemo(() => {
    if (themeOpen) return 3;
    if (moreVisible || moreActive) return 4;
    if (isActive('/resources')) return 0;
    if (isActive('/')) return CENTER_TAB_INDEX;
    return CENTER_TAB_INDEX;
  }, [themeOpen, moreVisible, moreActive, location.pathname]);

  const indicatorRaf = useRef(0);

  const layoutTabIndicator = useCallback(() => {
    cancelAnimationFrame(indicatorRaf.current);
    indicatorRaf.current = requestAnimationFrame(() => {
      const inner = bottomInnerRef.current;
      const tab = tabRefs.current[activeTabIndex];
      if (!inner || !tab) return;
      const innerRect = inner.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      let x;
      if (activeTabIndex === CENTER_TAB_INDEX) {
        x = innerRect.width / 2;
      } else {
        x = tabRect.left - innerRect.left + tabRect.width / 2;
      }
      setNavFrame({ w: innerRect.width });
      setTabDot((prev) => {
        if (prev.ready && prev.x === x) return prev;
        return { x, ready: true };
      });
    });
  }, [activeTabIndex]);

  const navPath = useMemo(
    () => buildBottomNavPath(navFrame.w, NAV_PILL_H),
    [navFrame.w],
  );

  useLayoutEffect(() => {
    layoutTabIndicator();
  }, [layoutTabIndicator, lang]);

  useEffect(() => {
    window.addEventListener('resize', layoutTabIndicator);
    return () => window.removeEventListener('resize', layoutTabIndicator);
  }, [layoutTabIndicator]);

  useEffect(() => {
    const inner = bottomInnerRef.current;
    if (!inner || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => layoutTabIndicator());
    observer.observe(inner);
    tabRefs.current.forEach((tab) => {
      if (tab) observer.observe(tab);
    });
    return () => observer.disconnect();
  }, [layoutTabIndicator, activeTabIndex]);

  useLayoutEffect(() => {
    if (!themeExiting && !moreExiting) layoutTabIndicator();
  }, [themeExiting, moreExiting, layoutTabIndicator]);

  return (
    <div className="app-chrome" ref={chromeRef}>
      <header className="app-top-bar">
        <div className="app-top-bar-inner">
          <div className="app-top-center">
            <Link to="/" className="app-top-brand" onClick={closeMore} dir="ltr">
              <BrandLogo markClass="logo-mark" textClass="logo-text" />
            </Link>
            <p className="app-top-credit" dir="ltr">AN AFTER RAIN ORIGINAL</p>
            {location.pathname === '/' && (
              <p className="app-top-tagline">{t('schedule.title')}</p>
            )}
          </div>
          {isLoggedIn && (
            <Link
              to="/admin/profile"
              className="app-top-admin"
              title={admin?.displayName}
              aria-label={t('admin.myProfile')}
            >
              <IconAdmin />
            </Link>
          )}
          {!isLoggedIn && currentUser && (
            <Link
              to="/profile"
              className="app-top-admin"
              title={currentUser.displayName}
              aria-label={currentUser.displayName}
            >
              <IconUser />
            </Link>
          )}
        </div>
      </header>

      {themeVisible && (
        <div
          className={`theme-overlay ${themeOpen ? 'is-open' : 'is-closing'}`}
          ref={themePickerRef}
        >
          <button
            type="button"
            className="theme-sheet-backdrop"
            aria-label="Close themes"
            onClick={closeTheme}
          />
          <div
            className="theme-sheet"
            role="dialog"
            aria-label={t('nav.theme')}
            aria-modal="true"
          >
            <p className="theme-sheet-hint">{t('themes.performanceHint')}</p>
            <div className="theme-sheet-list">
              <div className="theme-sheet-group theme-sheet-group--high">
                {highImpactThemes.map((th, index) => renderThemeOption(th, index))}
              </div>
              <div className="theme-sheet-divider" role="separator" aria-hidden="true" />
              <div className="theme-sheet-group theme-sheet-group--low">
                {lowImpactThemes.map((th, index) => (
                  renderThemeOption(th, highImpactThemes.length + index)
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {moreVisible && (
        <div
          className={`more-overlay ${moreOpen ? 'is-open' : 'is-closing'}`}
          ref={morePickerRef}
        >
          <button
            type="button"
            className="theme-sheet-backdrop"
            aria-label="Close menu"
            onClick={closeMore}
          />
          <div
            className="app-sheet more-sheet"
            role="dialog"
            aria-label={t('nav.more')}
            aria-modal="true"
          >
            <div
              className="app-sheet-tools app-sheet-option"
              role="toolbar"
              aria-label="Tools"
              style={{ animationDelay: moreOpen ? '0.03s' : undefined }}
            >
              <button
                type="button"
                className="header-tool-btn header-tool-btn--chip header-lang-btn"
                onClick={toggleLang}
                title={t('lang.switch')}
                aria-label={t('lang.switch')}
              >
                <IconGlobe />
                <span className="header-tool-label">{t('lang.switch')}</span>
              </button>
              <button
                type="button"
                className={`header-tool-btn header-tool-btn--chip refresh-btn ${appUpdating ? 'is-busy' : ''}`}
                onClick={handleAppUpdate}
                disabled={appUpdating}
                title={t('nav.refreshApp')}
                aria-label={appUpdating ? t('nav.updatingApp') : t('nav.refreshApp')}
              >
                <IconRefresh />
                <span className="header-tool-label">
                  {appUpdating ? t('nav.updatingApp') : t('nav.refreshApp')}
                </span>
              </button>
            </div>

            {workspaceLinks.length > 0 && (
              <section className="app-sheet-section app-sheet-option" style={{ animationDelay: moreOpen ? '0.05s' : undefined }}>
                <p className="app-sheet-section__label">
                  {lang === 'ar' ? 'مساحة العمل' : 'Workspace'}
                </p>
                <nav className="app-sheet-nav">
                  {workspaceLinks.map((l, i) => renderMoreLink(l, i, 0.06))}
                </nav>
              </section>
            )}

            {manageLinks.length > 0 && (
              <section className="app-sheet-section app-sheet-option" style={{ animationDelay: moreOpen ? '0.1s' : undefined }}>
                <p className="app-sheet-section__label">
                  {lang === 'ar' ? 'الإدارة' : 'Management'}
                </p>
                <nav className="app-sheet-nav">
                  {manageLinks.map((l, i) => renderMoreLink(l, i, 0.12))}
                </nav>
              </section>
            )}

            {(currentUser || isLoggedIn || !isLoggedIn) && (
              <section className="app-sheet-account app-sheet-option" style={{ animationDelay: moreOpen ? '0.18s' : undefined }}>
                {currentUser && (
                  <Link
                    to="/profile"
                    className="app-sheet-account__row"
                    onClick={closeMore}
                  >
                    <span className="app-sheet-account__avatar" aria-hidden>
                      <IconUser />
                    </span>
                    <span className="app-sheet-account__meta">
                      <span className="app-sheet-account__name">{currentUser.displayName}</span>
                      <span className="app-sheet-account__role">
                        {lang === 'ar' ? 'طالب' : 'Student'}
                      </span>
                    </span>
                  </Link>
                )}

                {isLoggedIn && (
                  <Link
                    to="/admin/profile"
                    className="app-sheet-account__row"
                    onClick={closeMore}
                  >
                    <span className="app-sheet-account__avatar app-sheet-account__avatar--admin" aria-hidden>
                      <IconAdmin />
                    </span>
                    <span className="app-sheet-account__meta">
                      <span className="app-sheet-account__name">{admin?.displayName}</span>
                      <span className="app-sheet-account__role">
                        {isSuperAdmin
                          ? (lang === 'ar' ? 'سوبر أدمن' : 'Super Admin')
                          : (lang === 'ar' ? 'مسؤول' : 'Admin')}
                      </span>
                    </span>
                  </Link>
                )}

                {!currentUser && !isLoggedIn && (
                  <Link
                    to="/login"
                    className="app-sheet-account__row app-sheet-account__row--login"
                    onClick={closeMore}
                  >
                    <span className="app-sheet-account__avatar" aria-hidden>
                      <IconLogin />
                    </span>
                    <span className="app-sheet-account__meta">
                      <span className="app-sheet-account__name">{t('admin.userMgmt.signIn')}</span>
                    </span>
                  </Link>
                )}

                {(currentUser || isLoggedIn) && (
                  <div className="app-sheet-account__actions">
                    {currentUser && (
                      <button type="button" className="app-sheet-account__logout" onClick={handleUserLogout}>
                        {t('admin.userMgmt.signOut')}
                      </button>
                    )}
                    {isLoggedIn && (
                      <button type="button" className="app-sheet-account__logout" onClick={handleLogout}>
                        {t('nav.logout')}
                      </button>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      )}

      <nav className="app-bottom-bar" aria-label="Main navigation">
        <div
          className="app-bottom-inner app-bottom-inner--dock"
          ref={bottomInnerRef}
        >
          <svg
            className="app-bottom-nav-shape"
            viewBox={`0 0 ${Math.max(navFrame.w, 1)} ${NAV_PILL_H}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <path className="app-bottom-nav-shape__fill" d={navPath} />
          </svg>
          <div
            className={`app-bottom-nav-dot ${tabDot.ready ? 'is-ready' : ''}`}
            aria-hidden
            style={{ left: `${tabDot.x}px` }}
          />
          <div className="app-bottom-rail">
            <Link
              ref={setTabRef(0)}
              to="/resources"
              className={`app-tab app-tab--rail ${activeTabIndex === 0 ? 'active' : ''}`}
              onClick={() => { closeTheme(); closeMore(); }}
            >
              <IconResources className="app-nav-icon" />
              <span className="app-tab-label">{t('nav.resources')}</span>
            </Link>
            <div
              ref={setTabRef(1)}
              className={`app-tab app-tab--rail app-tab--bell ${activeTabIndex === 1 ? 'active' : ''}`}
            >
              <NotificationBell className="app-tab-bell-btn" />
            </div>
            <Link
              ref={setTabRef(CENTER_TAB_INDEX)}
              to="/"
              className={`app-tab app-tab--rail app-tab--schedule ${activeTabIndex === CENTER_TAB_INDEX ? 'active' : ''}`}
              onClick={() => { closeTheme(); closeMore(); }}
              aria-label={t('nav.schedule')}
            >
              <span className="app-tab-schedule-mark">
                <IconCalendar className="app-nav-icon app-nav-icon--schedule" />
              </span>
            </Link>
            <button
              ref={setTabRef(3)}
              type="button"
              className={`app-tab app-tab--rail app-tab--theme ${activeTabIndex === 3 ? 'active' : ''}`}
              onClick={toggleTheme}
              aria-label={t('nav.theme')}
              aria-expanded={themeOpen}
              aria-haspopup="dialog"
            >
              <span className="app-nav-theme-combo" aria-hidden>
                <IconPalette className="app-nav-icon" />
                <ThemeIcon theme={theme} />
              </span>
              <span className="app-tab-label">{t('nav.theme')}</span>
            </button>
            <button
              ref={setTabRef(4)}
              type="button"
              className={`app-tab app-tab--rail ${activeTabIndex === 4 ? 'active' : ''}`}
              onClick={toggleMore}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
              aria-label={t('nav.more')}
            >
              <IconMore className="app-nav-icon" />
              <span className="app-tab-label">{t('nav.more')}</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
