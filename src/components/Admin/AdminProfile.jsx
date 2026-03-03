import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import './AdminProfile.css';

export default function AdminProfile() {
  const { admin, updateProfile } = useAuth();
  const { lang } = useLanguage();
  const t = useT(lang);

  const [displayName, setDisplayName] = useState(admin?.displayName ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!displayName.trim()) {
      setError(lang === 'ar' ? 'الاسم الظاهر مطلوب.' : 'Display name is required.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError(lang === 'ar' ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.' : 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    updateProfile({
      displayName: displayName.trim(),
      password: newPassword || undefined,
    });
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
    showToast(t('admin.profileUpdated'));
  };

  const roleLabel = admin?.role === 'superadmin' ? t('admin.superadmin') : t('admin.adminLabel');

  return (
    <div className="ap-page">
      <div className="ap-card glass">
        {/* Avatar */}
        <div className="ap-avatar">
          {admin?.displayName?.charAt(0)?.toUpperCase() ?? 'A'}
        </div>

        <div className="ap-meta">
          <h1 className="ap-name">{admin?.displayName}</h1>
          <div className="ap-chips">
            <span className="ap-chip ap-chip--role">{roleLabel}</span>
            <span className="ap-chip ap-chip--user">@{admin?.username}</span>
          </div>
        </div>

        <div className="ap-divider" />

        {/* Form */}
        <form className="ap-form" onSubmit={handleSave}>
          <h2 className="ap-section-title">{t('admin.myProfile')}</h2>

          <div className="ap-group">
            <label className="ap-label">{t('admin.adminName')}</label>
            <input
              className="ap-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={lang === 'ar' ? 'الاسم الظاهر' : 'Your display name'}
            />
          </div>

          <div className="ap-group">
            <label className="ap-label">{t('admin.adminUsername')}</label>
            <input
              className="ap-input ap-input--disabled"
              type="text"
              value={admin?.username ?? ''}
              readOnly
              dir="ltr"
            />
            <p className="ap-hint">
              {lang === 'ar' ? 'اسم المستخدم لا يمكن تغييره من الملف الشخصي.' : 'Username can only be changed by the Super Admin.'}
            </p>
          </div>

          <div className="ap-separator">
            <span>{lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</span>
          </div>

          <div className="ap-group">
            <label className="ap-label">{t('admin.newPassword')}</label>
            <div className="ap-pass-wrap">
              <input
                className="ap-input"
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={lang === 'ar' ? 'اتركه فارغاً للإبقاء' : 'Leave blank to keep current'}
                dir="ltr"
              />
              <button type="button" className="ap-eye" onClick={() => setShowPass((s) => !s)} tabIndex={-1}>
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

          {newPassword && (
            <div className="ap-group">
              <label className="ap-label">
                {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm New Password'}
              </label>
              <input
                className="ap-input"
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          )}

          {error && <p className="ap-error">{error}</p>}

          <button type="submit" className="ap-save" disabled={loading}>
            {loading ? <span className="ap-spinner" /> : t('admin.save')}
          </button>
        </form>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
