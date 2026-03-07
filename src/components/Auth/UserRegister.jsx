import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import './UserAuth.css';

export default function UserRegister() {
  const { register, loading, error, setError } = useUserAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const t = useT(lang);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPass) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!agreed) {
      setError('You must agree to the terms');
      return;
    }

    const success = await register(username.trim(), email.trim(), password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-logo-mark">X</span>
          <span className="auth-logo-text">elix</span>
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Join our community</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="af-group">
            <label className="af-label">Username</label>
            <input
              className="af-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              dir="ltr"
              disabled={loading}
            />
          </div>

          <div className="af-group">
            <label className="af-label">Email</label>
            <input
              className="af-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
              disabled={loading}
            />
          </div>

          <div className="af-group">
            <label className="af-label">Password</label>
            <div className="af-pass-wrap">
              <input
                className="af-input"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                disabled={loading}
              />
              <button
                type="button"
                className="af-eye"
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

          <div className="af-group">
            <label className="af-label">Confirm Password</label>
            <div className="af-pass-wrap">
              <input
                className="af-input"
                type={showPass ? 'text' : 'password'}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
                dir="ltr"
                disabled={loading}
              />
            </div>
          </div>

          <div className="af-checkbox">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="agree">I agree to Terms of Service</label>
          </div>

          <button className="af-submit" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
