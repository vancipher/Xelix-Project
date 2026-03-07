import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import { supabase } from '../../firebase';
import './Comments.css';

export default function Comments({ eventId, onCountChange }) {
  const { user } = useUserAuth();
  const { isLoggedIn: isAdmin, admin } = useAuth();
  const { lang } = useLanguage();
  const t = useT(lang);
  const ar = lang === 'ar';
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => { loadComments(); }, [eventId]);

  const loadComments = async () => {
    if (!eventId) return;
    const { data } = await supabase
      .from('comments')
      .select('id, user_id, event_id, text, created_at, commenter')
      .eq('event_id', String(eventId))
      .order('created_at', { ascending: false });
    if (data) {
      setComments(data);
      onCountChange?.(data.length);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) { setError(t('schedule.commentEmpty')); return; }
    setLoading(true);
    setError('');
    const commenter = user.displayName || user.username || 'User';
    const { error: err } = await supabase.from('comments').insert({
      user_id: user.id,
      event_id: String(eventId),
      text: newComment.trim(),
      commenter,
    });
    if (err) { setError(t('schedule.commentFailed')); setLoading(false); return; }
    setNewComment('');
    await loadComments();
    setLoading(false);
  };

  const handleDeleteComment = async (id) => {
    await supabase.from('comments').delete().eq('id', id);
    const next = comments.filter(c => c.id !== id);
    setComments(next);
    onCountChange?.(next.length);
  };

  const handleAdminReply = async () => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    const adminName = admin?.displayName || admin?.username || 'Admin';
    const { error: err } = await supabase.from('comments').insert({
      user_id: null,
      event_id: String(eventId),
      text: replyText.trim(),
      commenter: adminName,
    });
    if (!err) {
      setReplyText('');
      setReplyingTo(null);
      await loadComments();
    }
    setReplyLoading(false);
  };

  const displayName = (c) => c.commenter || '?';
  const isAdminComment = (c) => !c.user_id;

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
      ) : isAdmin ? null : (
        <div className="comment-login-prompt">
          <p>{t('schedule.loginToComment')} <Link to="/login">{t('auth.signIn')}</Link></p>
        </div>
      )}

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">{t('schedule.noCommentsYet')}</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={`comment-card${isAdminComment(comment) ? ' comment-card--admin' : ''}`}>
              <div className="comment-header">
                <div className="comment-author">
                  <div className={`comment-avatar${isAdminComment(comment) ? ' comment-avatar--admin' : ''}`}>
                    {displayName(comment).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="comment-author-name">
                      {displayName(comment)}
                      {isAdminComment(comment) && (
                        <span className="comment-admin-badge">{ar ? 'مسؤول' : 'Admin'}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="comment-date-wrap">
                  <p className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                  {isAdmin && (
                    <button
                      className="comment-delete-btn"
                      onClick={() => handleDeleteComment(comment.id)}
                      title="Delete comment"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <p className="comment-body">{comment.text}</p>
              {isAdmin && !isAdminComment(comment) && (
                <button
                  className="comment-reply-btn"
                  onClick={() => {
                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                    setReplyText('');
                  }}
                >
                  ↩ {ar ? 'رد' : 'Reply'}
                </button>
              )}
              {replyingTo === comment.id && (
                <div className="comment-reply-form">
                  <textarea
                    className="comment-textarea comment-reply-textarea"
                    placeholder={ar ? 'اكتب ردك...' : 'Write your reply...'}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    disabled={replyLoading}
                    rows="2"
                  />
                  <div className="comment-reply-actions">
                    <button
                      className="comment-submit comment-reply-submit"
                      onClick={handleAdminReply}
                      disabled={replyLoading || !replyText.trim()}
                    >
                      {replyLoading ? (ar ? 'جاري الإرسال...' : 'Sending...') : (ar ? 'إرسال' : 'Send')}
                    </button>
                    <button className="comment-cancel-btn" onClick={() => setReplyingTo(null)}>
                      {ar ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
