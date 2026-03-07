import { useState, useEffect } from 'react';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../firebase';
import './UserProfile.css';

const RANKS = [
  { min: 50, emoji: '🏆', en: 'Champion', ar: 'بطل',       color: 'rank--gold'   },
  { min: 30, emoji: '🔥', en: 'Achiever', ar: 'متفوق',     color: 'rank--fire'   },
  { min: 15, emoji: '⭐', en: 'Scholar',  ar: 'متميز',     color: 'rank--purple' },
  { min:  5, emoji: '📖', en: 'Learner',  ar: 'متعلم',     color: 'rank--blue'   },
  { min:  0, emoji: '🌱', en: 'Starter',  ar: 'مبتدئ',     color: 'rank--green'  },
];
function getRank(n) { return RANKS.find(r => n >= r.min) || RANKS[RANKS.length - 1]; }

export default function UserProfile() {
  const { user, logout, updateProfile, loading } = useUserAuth();
  const { lang } = useLanguage();
  const ar = lang === 'ar';

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats]     = useState({ completions: 0, reactions: 0, comments: 0, candy: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => { if (user) loadStats(); }, [user?.id]);

  const loadStats = async () => {
    setStatsLoading(true);
    const [c, r, cm, u] = await Promise.all([
      supabase.from('event_completions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('user_reactions').select('*',    { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('comments').select('*',          { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('users').select('candy').eq('id', user.id).single(),
    ]);
    setStats({
      completions: c.count || 0,
      reactions:   r.count || 0,
      comments:    cm.count || 0,
      candy:       u.data?.candy || 0,
    });
    setStatsLoading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPassword && newPassword !== confirmPass) {
      setError(ar ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    const ok = await updateProfile(displayName, newPassword || undefined);
    if (ok) { setSuccess(ar ? 'تم تحديث الملف الشخصي!' : 'Profile updated!'); setNewPassword(''); setConfirmPass(''); }
    else    { setError(ar ? 'فشل التحديث' : 'Failed to update profile'); }
  };

  if (!user) {
    return (
      <div className="user-profile">
        <div className="profile-empty">{ar ? 'يرجى تسجيل الدخول لعرض ملفك الشخصي' : 'Please log in to view your profile'}</div>
      </div>
    );
  }

  const rank    = getRank(stats.completions);
  const rankIdx = RANKS.findIndex(r => r.min === rank.min);
  const nextRank = rankIdx > 0 ? RANKS[rankIdx - 1] : null;
  const pct = nextRank ? Math.min(100, Math.round((stats.completions / nextRank.min) * 100)) : 100;

  return (
    <div className="user-profile">
      <div className="profile-container">

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">{user.username.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{user.displayName}</h1>
              <span className={`profile-rank ${rank.color}`}>{rank.emoji} {ar ? rank.ar : rank.en}</span>
            </div>
            <p className="profile-username">@{user.username}</p>
            <p className="profile-email">{user.email}</p>
            {stats.candy > 0 && (
              <p className="profile-candy">
                {'🍬'.repeat(Math.min(stats.candy, 12))}{stats.candy > 12 ? ` ×${stats.candy}` : ''}
              </p>
            )}
          </div>
          <button className="profile-logout" onClick={logout}>{ar ? 'تسجيل الخروج' : 'Logout'}</button>
        </div>

        {/* Statistics */}
        <div className="profile-section">
          <h2 className="section-title">{ar ? 'إحصائياتك' : 'Your Statistics'}</h2>

          {statsLoading ? (
            <p className="loading-text">{ar ? 'جارٍ التحميل...' : 'Loading...'}</p>
          ) : (
            <div className="profile-stats">
              <div className="stat-card">
                <span className="stat-icon">✓</span>
                <span className="stat-value">{stats.completions}</span>
                <span className="stat-label">{ar ? 'مهام أنجزت' : 'Events Done'}</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">😊</span>
                <span className="stat-value">{stats.reactions}</span>
                <span className="stat-label">{ar ? 'تفاعلات' : 'Reactions'}</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💬</span>
                <span className="stat-value">{stats.comments}</span>
                <span className="stat-label">{ar ? 'تعليقات' : 'Comments'}</span>
              </div>
              {stats.candy > 0 && (
                <div className="stat-card stat-card--candy">
                  <span className="stat-icon">🍬</span>
                  <span className="stat-value">{stats.candy}</span>
                  <span className="stat-label">{ar ? 'حلوى' : 'Candy'}</span>
                </div>
              )}
            </div>
          )}

          {/* Rank progress bar */}
          {!statsLoading && (
            <div className="rank-progress">
              <div className="rank-progress__labels">
                <span className={`rank-badge-sm ${rank.color}`}>{rank.emoji} {ar ? rank.ar : rank.en}</span>
                {nextRank
                  ? <span className="rank-progress__next">{ar ? `${nextRank.emoji} ${nextRank.ar} بعد ${nextRank.min - stats.completions} ✓` : `${nextRank.emoji} ${nextRank.en} in ${nextRank.min - stats.completions} more ✓`}</span>
                  : <span className="rank-progress__max">{ar ? '🏆 أعلى رتبة!' : '🏆 Max rank!'}</span>
                }
              </div>
              <div className="rank-bar"><div className="rank-bar__fill" style={{ width: `${pct}%` }} /></div>
            </div>
          )}
        </div>

        {/* Edit Profile */}
        <div className="profile-section">
          <h2 className="section-title">{ar ? 'تعديل الملف الشخصي' : 'Edit Profile'}</h2>
          {error   && <div className="profile-error">{error}</div>}
          {success && <div className="profile-success">{success}</div>}
          <form className="profile-form" onSubmit={handleUpdateProfile}>
            <div className="pf-group">
              <label>{ar ? 'الاسم الظاهر' : 'Display Name'}</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={loading} />
            </div>
            <div className="pf-group">
              <label>{ar ? 'كلمة المرور الجديدة (اختياري)' : 'New Password (optional)'}</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder={ar ? 'اتركه فارغاً للإبقاء' : 'Leave blank to keep current'} disabled={loading} dir="ltr" />
            </div>
            <div className="pf-group">
              <label>{ar ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
              <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} disabled={loading} dir="ltr" />
            </div>
            <button type="submit" className="pf-submit" disabled={loading}>
              {loading ? (ar ? 'جارٍ الحفظ...' : 'Saving...') : (ar ? 'حفظ التغييرات' : 'Save Changes')}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
