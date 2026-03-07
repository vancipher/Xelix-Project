import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import { supabase } from '../../firebase';
import { sendEventPushNotification } from '../../utils/notifications';
import './UserManagement.css';

export default function UserManagement() {
  const { isSuperAdmin, canManageUsers } = useAuth();
  const canAccess = isSuperAdmin || canManageUsers;
  const { lang } = useLanguage();
  const t = useT(lang);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'banned', 'pending'

  useEffect(() => {
    if (canAccess) loadUsers();
  }, [canAccess]);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
    setLoading(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleApprove = async (userId, displayName) => {
    const { error } = await supabase
      .from('users')
      .update({ approved: true })
      .eq('id', userId);

    if (error) {
      showToast(t('admin.userMgmt.failApprove'));
      return;
    }

    showToast(`${displayName} — ${t('admin.userMgmt.approved')}`);
    await loadUsers();

    // Notify all admins that a new user joined
    await sendEventPushNotification({
      title: '🎉 New Member',
      body: `New user with the name ${displayName} joined.`,
      url: '/admin/users',
    });
  };

  const handleBan = async (userId, currentBanned) => {
    if (!window.confirm(currentBanned ? t('admin.userMgmt.confirmUnban') : t('admin.userMgmt.confirmBan'))) {
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ banned: !currentBanned })
      .eq('id', userId);

    if (error) {
      showToast(t('admin.userMgmt.failUpdate'));
      return;
    }

    showToast(t(currentBanned ? 'admin.userMgmt.unban' : 'admin.userMgmt.ban') + ' ✓');
    await loadUsers();
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`${t('admin.userMgmt.confirmDelete')} @${username}? ${t('admin.userMgmt.cannotUndo')}`)) {
      return;
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      showToast(t('admin.userMgmt.failDelete'));
      return;
    }

    showToast(t('admin.userMgmt.deletedOk'));
    await loadUsers();
  };

  const handleGiveCandy = async (userId, current) => {
    const { error } = await supabase
      .from('users')
      .update({ candy: (current || 0) + 1 })
      .eq('id', userId);
    if (!error) await loadUsers();
  };

  const handleTakeCandy = async (userId, current) => {
    const { error } = await supabase
      .from('users')
      .update({ candy: Math.max(0, (current || 0) - 1) })
      .eq('id', userId);
    if (!error) await loadUsers();
  };

  if (!canAccess) {
    return (
      <div className="um-page">
        <div className="um-forbidden glass">
          <p>{t('admin.userMgmt.restricted')}</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    if (filter === 'banned') return u.banned;
    if (filter === 'active') return u.approved && !u.banned;
    if (filter === 'pending') return !u.approved && !u.banned;
    return true;
  });

  return (
    <div className="um-page">
      {toast && <div className="um-toast">{toast}</div>}

      {/* Header */}
      <div className="um-header">
        <div>
          <h1 className="um-title">{t('admin.userMgmt.title')}</h1>
          <p className="um-sub">{users.length} {t('admin.userMgmt.totalUsers')}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="um-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('admin.userMgmt.all')} ({users.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          {t('admin.userMgmt.pending')} ({users.filter(u => !u.approved && !u.banned).length})
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          {t('admin.userMgmt.active')} ({users.filter(u => u.approved && !u.banned).length})
        </button>
        <button
          className={`filter-btn ${filter === 'banned' ? 'active' : ''}`}
          onClick={() => setFilter('banned')}
        >
          {t('admin.userMgmt.banned')} ({users.filter(u => u.banned).length})
        </button>
      </div>

      {/* Users List */}
      <div className="um-list">
        {loading ? (
          <div className="um-loading">{t('admin.userMgmt.loading')}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="um-empty">{t('admin.userMgmt.noUsers')}</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className={`um-row glass ${user.banned ? 'um-row--banned' : ''} ${!user.approved && !user.banned ? 'um-row--pending' : ''}`}>
              <div className="um-row__avatar">
                {(user.display_name || user.username || '?').charAt(0).toUpperCase()}
              </div>
              <div className="um-row__info">
                <span className="um-row__name">{user.full_name || user.display_name}</span>
                <span className="um-row__username">@{user.username}</span>
                <span className="um-row__email">{user.email}</span>
                <span className="um-row__joined">
                  {t('admin.userMgmt.joined')} {new Date(user.created_at).toLocaleDateString()}
                </span>
                {(user.candy || 0) > 0 && (
                  <span className="um-row__candy-badge">
                    {'🍬'.repeat(Math.min(user.candy, 5))}{user.candy > 5 ? ` ×${user.candy}` : ''}
                  </span>
                )}
              </div>
              {user.banned && (
                <span className="um-row__badge banned">{t('admin.userMgmt.badgebanned')}</span>
              )}
              {!user.approved && !user.banned && (
                <span className="um-row__badge pending">{t('admin.userMgmt.badgepending')}</span>
              )}
              <div className="um-row__actions">
                {!user.approved && !user.banned && (
                  <button
                    className="um-btn um-btn--approve"
                    onClick={() => handleApprove(user.id, user.full_name || user.display_name)}
                  >
                    {t('admin.userMgmt.approve')}
                  </button>
                )}
                <button
                  className={`um-btn ${user.banned ? 'um-btn--unban' : 'um-btn--ban'}`}
                  onClick={() => handleBan(user.id, user.banned)}
                >
                  {user.banned ? t('admin.userMgmt.unban') : t('admin.userMgmt.ban')}
                </button>
                <button
                  className="um-btn um-btn--delete"
                  onClick={() => handleDelete(user.id, user.username)}
                >
                  {t('admin.userMgmt.delete')}
                </button>
                <button
                  className="um-btn um-btn--candy"
                  onClick={() => handleGiveCandy(user.id, user.candy)}
                  title={lang === 'ar' ? 'أعطِ حلوى' : 'Give candy'}
                >
                  🍬+
                </button>
                {(user.candy || 0) > 0 && (
                  <button
                    className="um-btn um-btn--candy-take"
                    onClick={() => handleTakeCandy(user.id, user.candy)}
                    title={lang === 'ar' ? 'سحب حلوى' : 'Take candy'}
                  >
                    🍬−
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
