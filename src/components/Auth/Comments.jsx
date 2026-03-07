import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import { supabase } from '../../firebase';
import './Comments.css';

export default function Comments({ eventId }) {
  const { user } = useUserAuth();
  const { lang } = useLanguage();
  const t = useT(lang);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadComments(); }, [eventId]);

  const loadComments = async () => {
    if (!eventId) return;
    const { data } = await supabase
      .from('comments')
      .select('*, users(username, display_name)')
      .eq('event_id', String(eventId))
      .order('created_at', { ascending: false });
    if (data) setComments(data);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) { setError(t('schedule.commentEmpty')); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('comments').insert({
      user_id: user.id,
      event_id: String(eventId),
      text: newComment.trim(),
      created_at: new Date().toISOString(),
    });
    if (err) { setError(t('schedule.commentFailed')); setLoading(false); return; }
    setNewComment('');
    await loadComments();
    setLoading(false);
  };

  const displayName = (c) => c.users?.display_name || c.users?.username || '?';

  return (
    <div className="comments-section">
      <h3 className="comments-title">{t('schedule.comments')} ({comments.length})</h3>

      {user ? (
        <form className="add-comment-form" onSubmit={handleAddComment}>
          {error && <div className="comment-error">{error}</div>}
          <textarea
            className="comment-textarea"
            placeholder={t('schedule.commentPlaceholder')}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
            rows="3"
          />
          <button type="submit" className="comment-submit" disabled={loading || !newComment.trim()}>
            {loading ? t('schedule.commentPosting') : t('schedule.commentPost')}
          </button>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <p>{t('schedule.loginToComment')} <Link to="/login">{t('auth.signIn')}</Link></p>
        </div>
      )}

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">{t('schedule.noCommentsYet')}</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-card">
              <div className="comment-header">
                <div className="comment-author">
                  <div className="comment-avatar">
                    {displayName(comment).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="comment-author-name">{displayName(comment)}</p>
                    <p className="comment-author-handle">@{comment.users?.username}</p>
                  </div>
                </div>
                <p className="comment-date">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
              <p className="comment-body">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
