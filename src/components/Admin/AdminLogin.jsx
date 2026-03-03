import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import './AdminLogin.css';

export default function AdminLogin() {
  const { login } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const t = useT(lang);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // subtle delay
    const ok = login(username.trim(), password);
    setLoading(false);
    if (ok) {
      navigate('/admin');
    } else {
      setError(t('admin.invalidCreds'));
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass">
        {/* Brand */}
        <div className="login-brand">
          <span className="login-logo-mark">X</span>
          <span className="login-logo-text">elix</span>
        </div>
        <h1 className="login-title">{t('admin.login')}</h1>
        <p className="login-sub">{t('appTagline')}</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="lf-group">
            <label className="lf-label">{t('admin.username')}</label>
            <input
              className="lf-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              dir="ltr"
            />
          </div>
          <div className="lf-group">
            <label className="lf-label">{t('admin.password')}</label>
            <div className="lf-pass-wrap">
              <input
                className="lf-input"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                dir="ltr"
              />
              <button
                type="button"
                className="lf-eye"
                onClick={() => setShowPass((s) => !s)}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="lf-error">{error}</p>}

          <button type="submit" className="lf-submit" disabled={loading}>
            {loading ? <span className="lf-spinner" /> : t('admin.signIn')}
          </button>
        </form>


      </div>
    </div>
  );
}
