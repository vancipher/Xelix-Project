import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import { supabase } from '../../firebase';
import './AdminUserActivity.css';

const REACTION_EMOJI = { happy: '😊', afraid: '😰', angry: '😠' };

export default function AdminUserActivity() {
  const { isLoggedIn } = useAuth();
  const { lang } = useLanguage();
  const t = useT(lang);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState({});

  useEffect(() => {
    if (isLoggedIn) load();
  }, [isLoggedIn]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('id, username, full_name, display_name, email, approved, banned')
      .order('created_at', { ascending: false });
    if (!data) { setLoading(false); return; }

    const withCounts = await Promise.all(data.map(async u => {
      const [r, c, e] = await Promise.all([
        supabase.from('user_reactions').select('id', { count: 'exact', head: true }).eq('user_id', u.id),
        supabase.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', u.id),
        supabase.from('event_completions').select('id', { count: 'exact', head: true }).eq('user_id', u.id),
      ]);
      return { ...u, rCount: r.count ?? 0, cCount: c.count ?? 0, eCount: e.count ?? 0 };
    }));

    setUsers(withCounts.sort((a, b) => (b.rCount + b.cCount + b.eCount) - (a.rCount + a.cCount + a.eCount)));
    setLoading(false);
  };

  const loadDetail = async (userId) => {
    if (detail[userId]) return;
    const [reactions, comments, completions] = await Promise.all([
      supabase.from('user_reactions').select('event_id, reaction, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
      supabase.from('comments').select('event_id, text, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
      supabase.from('event_completions').select('event_id, completed_at').eq('user_id', userId).order('completed_at', { ascending: false }).limit(30),
    ]);
    setDetail(d => ({
      ...d,
      [userId]: {
        reactions: reactions.data ?? [],
        comments: comments.data ?? [],
        completions: completions.data ?? [],
      }
    }));
  };

  const toggle = async (userId) => {
    if (expanded === userId) { setExpanded(null); return; }
    setExpanded(userId);
    await loadDetail(userId);
  };

  if (!isLoggedIn) return null;

  return (
    <div className="ua-page">
      <div className="ua-header">
        <h1 className="ua-title">{t('admin.userActivity')}</h1>
        <p className="ua-sub">{users.length} {t('admin.userMgmt.totalUsers')}</p>
      </div>

      {loading ? (
        <div className="ua-loading">{t('admin.userMgmt.loading')}</div>
      ) : users.length === 0 ? (
        <div className="ua-empty">{t('admin.userMgmt.noUsers')}</div>
      ) : (
        <div className="ua-list">
          {users.map(u => (
            <div key={u.id} className={`ua-row glass ${expanded === u.id ? 'ua-row--open' : ''}`}>
              {/* Row header */}
              <button className="ua-row__main" onClick={() => toggle(u.id)}>
                <div className="ua-avatar">
                  {(u.full_name || u.display_name || u.username || '?').charAt(0).toUpperCase()}
                </div>
                <div className="ua-info">
                  <span className="ua-name">{u.full_name || u.display_name || u.username}</span>
                  <span className="ua-email">{u.email}</span>
                  <div className="ua-tags">
                    {u.banned && <span className="ua-tag banned">{t('admin.userMgmt.badgebanned')}</span>}
                    {!u.approved && <span className="ua-tag pending">{t('admin.userMgmt.badgepending')}</span>}
                  </div>
                </div>
                <div className="ua-counts">
                  <span className="ua-count" title="Reactions">⚡ {u.rCount}</span>
                  <span className="ua-count" title="Comments">💬 {u.cCount}</span>
                  <span className="ua-count" title="Done">✅ {u.eCount}</span>
                </div>
                <svg className={`ua-chevron ${expanded === u.id ? 'open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Expanded detail */}
              {expanded === u.id && detail[u.id] && (
                <div className="ua-detail">
                  {/* Reactions */}
                  <div className="ua-section">
                    <h4 className="ua-section__title">⚡ Reactions ({detail[u.id].reactions.length})</h4>
                    {detail[u.id].reactions.length === 0 ? <p className="ua-none">—</p> : (
                      <div className="ua-chips">
                        {detail[u.id].reactions.map((r, i) => (
                          <span key={i} className={`ua-chip ua-chip--${r.reaction}`}>
                            {REACTION_EMOJI[r.reaction]} Event #{r.event_id} · {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="ua-section">
                    <h4 className="ua-section__title">💬 {t('schedule.comments')} ({detail[u.id].comments.length})</h4>
                    {detail[u.id].comments.length === 0 ? <p className="ua-none">—</p> : (
                      <div className="ua-comment-list">
                        {detail[u.id].comments.map((c, i) => (
                          <div key={i} className="ua-comment">
                            <p className="ua-comment__text">{c.text}</p>
                            <span className="ua-comment__meta">
                              {new Date(c.created_at).toLocaleDateString()} · Event #{c.event_id}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Completions */}
                  <div className="ua-section">
                    <h4 className="ua-section__title">✅ {t('schedule.done')} ({detail[u.id].completions.length})</h4>
                    {detail[u.id].completions.length === 0 ? <p className="ua-none">—</p> : (
                      <div className="ua-chips">
                        {detail[u.id].completions.map((c, i) => (
                          <span key={i} className="ua-chip ua-chip--done">
                            Event #{c.event_id} · {new Date(c.completed_at).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
