import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import './UserAuth.css';

export default function UserRegister() {
  const { register, loading, error, setError } = useUserAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPass) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!agreed) { setError('You must agree to the terms'); return; }

    const success = await register(fullName.trim(), username.trim(), email.trim(), password);
    if (success) setSubmitted(true);
  };

  // Pending approval screen
  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card glass">
          <div className="auth-brand" dir="ltr">
            <span className="auth-logo-mark">X</span><span className="auth-logo-text">elix</span>
          </div>
          <div className="auth-pending">
            <div className="pending-icon">⏳</div>
            <h2 className="pending-title">Account Pending Approval</h2>
            <p className="pending-msg">
              Your account request has been received. The admin will review your details and
              approve your account. You will be able to sign in once approved.
            </p>
            <Link to="/" className="af-submit" style={{ textAlign: 'center', display: 'block', textDecoration: 'none', marginTop: 8 }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <div className="auth-brand" dir="ltr">
          <span className="auth-logo-mark">X</span><span className="auth-logo-text">elix</span>
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">All fields are required</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="af-group">
            <label className="af-label">Full Name <span className="af-required">*</span></label>
            <input
              className="af-input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your real full name"
              required
              disabled={loading}
            />
          </div>

          <div className="af-group">
            <label className="af-label">Username <span className="af-required">*</span></label>
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
            <label className="af-label">Email <span className="af-required">*</span></label>
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
            <label className="af-label">Password <span className="af-required">*</span></label>
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
              <button type="button" className="af-eye" onClick={() => setShowPass((s) => !s)} tabIndex={-1}>
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
            <label className="af-label">Confirm Password <span className="af-required">*</span></label>
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

          <div className="af-checkbox">
            <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} disabled={loading} />
            <label htmlFor="agree">I agree to Terms of Service</label>
          </div>

          <button className="af-submit" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Request Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
