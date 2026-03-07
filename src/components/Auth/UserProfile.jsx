import { useState, useEffect } from 'react';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../firebase';
import './UserProfile.css';

export default function UserProfile() {
  const { user, logout, updateProfile, loading } = useUserAuth();
  const { lang } = useLanguage();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Load user's comments
  useEffect(() => {
    if (user) loadComments();
  }, [user]);

  const loadComments = async () => {
    setCommentsLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(10);
    
    if (data) setComments(data);
    setCommentsLoading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPass) {
      setError('Passwords do not match');
      return;
    }

    const ok = await updateProfile(displayName, newPassword || undefined);
    if (ok) {
      setSuccess('Profile updated!');
      setNewPassword('');
      setConfirmPass('');
    } else {
      setError('Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div className="user-profile">
        <div className="profile-empty">Please log in to view your profile</div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">{user.username.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <h1 className="profile-name">{user.displayName}</h1>
            <p className="profile-username">@{user.username}</p>
            <p className="profile-email">{user.email}</p>
          </div>
          <button className="profile-logout" onClick={logout}>Logout</button>
        </div>

        {/* Edit Profile Form */}
        <div className="profile-section">
          <h2 className="section-title">Edit Profile</h2>
          {error && <div className="profile-error">{error}</div>}
          {success && <div className="profile-success">{success}</div>}

          <form className="profile-form" onSubmit={handleUpdateProfile}>
            <div className="pf-group">
              <label>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="pf-group">
              <label>New Password (optional)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                disabled={loading}
              />
            </div>

            <div className="pf-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="pf-submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* User's Comments */}
        <div className="profile-section">
          <h2 className="section-title">Your Comments</h2>
          {commentsLoading ? (
            <p className="loading-text">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="empty-text">No comments yet</p>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <p className="comment-text">{comment.text}</p>
                  <p className="comment-meta">
                    {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
