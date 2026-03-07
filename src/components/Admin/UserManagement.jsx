import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../firebase';
import './UserManagement.css';

export default function UserManagement() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'banned', 'pending'

  useEffect(() => {
    if (isSuperAdmin) loadUsers();
  }, [isSuperAdmin]);

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
      showToast('Failed to approve user');
      return;
    }

    showToast(`${displayName} has been approved!`);
    await loadUsers();
  };

  const handleBan = async (userId, currentBanned) => {
    if (!window.confirm(`Are you sure you want to ${currentBanned ? 'unban' : 'ban'} this user?`)) {
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ banned: !currentBanned })
      .eq('id', userId);

    if (error) {
      showToast('Failed to update user');
      return;
    }

    showToast(`User ${!currentBanned ? 'banned' : 'unbanned'} successfully`);
    await loadUsers();
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Permanently delete user @${username}? This cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      showToast('Failed to delete user');
      return;
    }

    showToast('User deleted successfully');
    await loadUsers();
  };

  if (!isSuperAdmin) {
    return (
      <div className="um-page">
        <div className="um-forbidden glass">
          <p>Access restricted to Super Admin only.</p>
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
          <h1 className="um-title">User Management</h1>
          <p className="um-sub">{users.length} total users</p>
        </div>
      </div>

      {/* Filter */}
      <div className="um-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({users.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({users.filter(u => !u.approved && !u.banned).length})
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({users.filter(u => u.approved && !u.banned).length})
        </button>
        <button
          className={`filter-btn ${filter === 'banned' ? 'active' : ''}`}
          onClick={() => setFilter('banned')}
        >
          Banned ({users.filter(u => u.banned).length})
        </button>
      </div>

      {/* Users List */}
      <div className="um-list">
        {loading ? (
          <div className="um-loading">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="um-empty">No users found</div>
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
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              {user.banned && (
                <span className="um-row__badge banned">BANNED</span>
              )}
              {!user.approved && !user.banned && (
                <span className="um-row__badge pending">PENDING</span>
              )}
              <div className="um-row__actions">
                {!user.approved && !user.banned && (
                  <button
                    className="um-btn um-btn--approve"
                    onClick={() => handleApprove(user.id, user.full_name || user.display_name)}
                  >
                    Approve
                  </button>
                )}
                <button
                  className={`um-btn ${user.banned ? 'um-btn--unban' : 'um-btn--ban'}`}
                  onClick={() => handleBan(user.id, user.banned)}
                >
                  {user.banned ? 'Unban' : 'Ban'}
                </button>
                <button
                  className="um-btn um-btn--delete"
                  onClick={() => handleDelete(user.id, user.username)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
