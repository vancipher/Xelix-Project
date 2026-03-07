import { useState, useEffect } from 'react';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { supabase } from '../../firebase';
import './Comments.css';

export default function Comments({ eventId, itemType = 'event' }) {
  const { user } = useUserAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load comments
  useEffect(() => {
    loadComments();
  }, [eventId]);

  const loadComments = async () => {
    if (!eventId) return;
    const { data, error: err } = await supabase
      .from('comments')
      .select('*, users(username, displayName)')
      .eq('itemId', eventId)
      .eq('itemType', itemType)
      .order('createdAt', { ascending: false });

    if (!err && data) setComments(data);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to comment');
      return;
    }

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    const { error: err } = await supabase.from('comments').insert({
      userId: user.id,
      itemId: eventId,
      itemType: itemType,
      text: newComment,
      createdAt: new Date().toISOString(),
    });

    if (err) {
      setError('Failed to post comment');
      setLoading(false);
      return;
    }

    setNewComment('');
    await loadComments();
    setLoading(false);
  };

  return (
    <div className="comments-section">
      <h3 className="comments-title">Comments ({comments.length})</h3>

      {/* Add Comment Form */}
      {user ? (
        <form className="add-comment-form" onSubmit={handleAddComment}>
          {error && <div className="comment-error">{error}</div>}
          <textarea
            className="comment-textarea"
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
            rows="3"
          />
          <button
            type="submit"
            className="comment-submit"
            disabled={loading || !newComment.trim()}
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <p>Please <a href="/login">log in</a> to comment</p>
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-card">
              <div className="comment-header">
                <div className="comment-author">
                  <div className="comment-avatar">
                    {comment.users.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="comment-author-name">{comment.users.displayName}</p>
                    <p className="comment-author-handle">@{comment.users.username}</p>
                  </div>
                </div>
                <p className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
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
