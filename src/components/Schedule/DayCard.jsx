import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useT } from '../../utils/i18n';
import { EVENT_TYPE_COLORS, EVENT_TYPE_BG, formatDate } from '../../utils/helpers';
import { supabase } from '../../firebase';
import './DayCard.css';

/* ── Theme-based reaction SVG icons ──────────────────────────── */
const REACTION_SHAPES = {
  white: {
    happy:  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>,
    afraid: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6"/><ellipse cx="12" cy="16" rx="2.5" ry="3" fill="none" stroke="currentColor" strokeWidth="1.4"/><ellipse cx="9" cy="9.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="9" cy="9.5" r="0.7" fill="currentColor"/><ellipse cx="15" cy="9.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="15" cy="9.5" r="0.7" fill="currentColor"/><path d="M7 6.5l3.5 1.5M17 6.5l-3.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="17.5" cy="12" r="1" fill="currentColor" opacity="0.3"/></svg>,
    angry:  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M8 16h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M7 8l4 2M17 8l-4 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  sun: {
    happy:  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="#fbbf24" opacity="0.3"/><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="10" cy="11" r="0.8" fill="currentColor"/><circle cx="14" cy="11" r="0.8" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
    afraid: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="#fbbf24" opacity="0.2"/><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.4"/><ellipse cx="12" cy="15.5" rx="2" ry="2.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><ellipse cx="10" cy="10" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="10" cy="10" r="0.5" fill="currentColor"/><ellipse cx="14" cy="10" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="14" cy="10" r="0.5" fill="currentColor"/><path d="M8 7.5l3 1.5M16 7.5l-3 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><circle cx="16.5" cy="13" r="0.8" fill="currentColor" opacity="0.3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
    angry:  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="#f87171" opacity="0.2"/><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M9 15h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M8.5 9l3 1.5M15.5 9l-3 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  },
  sea: {
    happy:  <svg viewBox="0 0 24 24"><ellipse cx="12" cy="10" rx="8" ry="5" fill="currentColor" opacity="0.18"/><ellipse cx="12" cy="10" rx="8" ry="5" fill="none" stroke="currentColor" strokeWidth="1.3"/><circle cx="15" cy="9" r="1" fill="currentColor"/><path d="M9 12s1.2 1.2 3 1.2 3-1.2 3-1.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><path d="M3 10l-1.5-2v4z" fill="currentColor" opacity="0.6"/><path d="M2 17c2-1.8 4-1.8 6 0s4 1.8 6 0 4-1.8 6 0" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5"/></svg>,
    afraid: <svg viewBox="0 0 24 24"><ellipse cx="12" cy="10" rx="8" ry="5" fill="currentColor" opacity="0.12"/><ellipse cx="12" cy="10" rx="8" ry="5" fill="none" stroke="currentColor" strokeWidth="1.3"/><ellipse cx="9" cy="9" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="9" cy="9" r="0.5" fill="currentColor"/><ellipse cx="15" cy="9" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="15" cy="9" r="0.5" fill="currentColor"/><ellipse cx="12" cy="12.5" rx="1.5" ry="2" fill="none" stroke="currentColor" strokeWidth="1"/><path d="M3 10l-1.5-2v4z" fill="currentColor" opacity="0.5"/><path d="M17 7l1.5-1" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/><circle cx="17.5" cy="12" r="0.8" fill="currentColor" opacity="0.3"/><path d="M2 17c2-1.8 4-1.8 6 0s4 1.8 6 0 4-1.8 6 0" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5"/></svg>,
    angry:  <svg viewBox="0 0 24 24"><ellipse cx="12" cy="10" rx="8" ry="5" fill="#f87171" opacity="0.12"/><ellipse cx="12" cy="10" rx="8" ry="5" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 7.5l3 1.5M16.5 7.5l-3 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><path d="M10 12.5h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><path d="M3 10l-1.5-2v4z" fill="currentColor" opacity="0.6"/><path d="M2 17c2-1.8 4-1.8 6 0s4 1.8 6 0 4-1.8 6 0" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5"/></svg>,
  },
  lavender: {
    happy:  <svg viewBox="0 0 24 24"><path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" fill="currentColor" opacity="0.2"/><path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M9 11s1 1.5 3 1.5 3-1.5 3-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><circle cx="10" cy="9" r="0.7" fill="currentColor"/><circle cx="14" cy="9" r="0.7" fill="currentColor"/></svg>,
    afraid: <svg viewBox="0 0 24 24"><path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" fill="currentColor" opacity="0.12"/><path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" fill="none" stroke="currentColor" strokeWidth="1.4"/><ellipse cx="12" cy="13" rx="1.8" ry="2.2" fill="none" stroke="currentColor" strokeWidth="1.1"/><ellipse cx="10" cy="8.5" r="1.3" fill="none" stroke="currentColor" strokeWidth="0.9"/><circle cx="10" cy="8.5" r="0.5" fill="currentColor"/><ellipse cx="14" cy="8.5" r="1.3" fill="none" stroke="currentColor" strokeWidth="0.9"/><circle cx="14" cy="8.5" r="0.5" fill="currentColor"/><path d="M8 6l2.5 1.5M16 6l-2.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><circle cx="16" cy="11" r="0.8" fill="currentColor" opacity="0.3"/></svg>,
    angry:  <svg viewBox="0 0 24 24"><path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" fill="#f87171" opacity="0.15"/><path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M9 12h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><path d="M8.5 8l3 1M15.5 8l-3 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  },
  purple: {
    happy:  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.15"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.4"/><ellipse cx="7.5" cy="7" rx="2.5" ry="3" fill="currentColor" opacity="0.2"/><ellipse cx="7.5" cy="7" rx="2.5" ry="3" fill="none" stroke="currentColor" strokeWidth="1.1"/><ellipse cx="16.5" cy="7" rx="2.5" ry="3" fill="currentColor" opacity="0.2"/><ellipse cx="16.5" cy="7" rx="2.5" ry="3" fill="none" stroke="currentColor" strokeWidth="1.1"/><circle cx="10" cy="11" r="1.2" fill="currentColor"/><circle cx="14" cy="11" r="1.2" fill="currentColor"/><path d="M10 15s.8 1.3 2 1.3 2-1.3 2-1.3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><ellipse cx="12" cy="13" rx="1.3" ry="0.8" fill="currentColor" opacity="0.35"/></svg>,
    afraid: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.1"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.4"/><ellipse cx="7.5" cy="7" rx="2.5" ry="3" fill="none" stroke="currentColor" strokeWidth="1.1"/><ellipse cx="16.5" cy="7" rx="2.5" ry="3" fill="none" stroke="currentColor" strokeWidth="1.1"/><ellipse cx="10" cy="10.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="10" cy="10.5" r="0.6" fill="currentColor"/><ellipse cx="14" cy="10.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="14" cy="10.5" r="0.6" fill="currentColor"/><ellipse cx="12" cy="16" rx="1.8" ry="2.2" fill="none" stroke="currentColor" strokeWidth="1.1"/><path d="M8 7l2.5 2M16 7l-2.5 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><circle cx="16.5" cy="13.5" r="0.9" fill="currentColor" opacity="0.3"/><ellipse cx="12" cy="13" rx="1.3" ry="0.8" fill="currentColor" opacity="0.3"/></svg>,
    angry:  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#f87171" opacity="0.1"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.4"/><ellipse cx="7.5" cy="7" rx="2.5" ry="3" fill="none" stroke="currentColor" strokeWidth="1.1"/><ellipse cx="16.5" cy="7" rx="2.5" ry="3" fill="none" stroke="currentColor" strokeWidth="1.1"/><path d="M8.5 9l3 1.5M15.5 9l-3 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><path d="M10 15h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><ellipse cx="12" cy="13" rx="1.3" ry="0.8" fill="currentColor" opacity="0.3"/></svg>,
  },
  nature: {
    happy:  <svg viewBox="0 0 24 24"><path d="M12 2C8 4 4 10 4 15c0 4.5 3.5 8 8 8s8-3.5 8-8c0-5-4-11-8-13z" fill="currentColor" opacity="0.2"/><path d="M12 2C8 4 4 10 4 15c0 4.5 3.5 8 8 8s8-3.5 8-8c0-5-4-11-8-13z" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M12 5v14" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/><path d="M9 14s1.2 1.5 3 1.5 3-1.5 3-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><circle cx="10" cy="12" r="0.7" fill="currentColor"/><circle cx="14" cy="12" r="0.7" fill="currentColor"/></svg>,
    afraid: <svg viewBox="0 0 24 24"><path d="M12 2C8 4 4 10 4 15c0 4.5 3.5 8 8 8s8-3.5 8-8c0-5-4-11-8-13z" fill="currentColor" opacity="0.12"/><path d="M12 2C8 4 4 10 4 15c0 4.5 3.5 8 8 8s8-3.5 8-8c0-5-4-11-8-13z" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M12 5v14" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/><ellipse cx="12" cy="16" rx="1.5" ry="2" fill="none" stroke="currentColor" strokeWidth="1.1"/><ellipse cx="10" cy="11.5" r="1.4" fill="none" stroke="currentColor" strokeWidth="0.9"/><circle cx="10" cy="11.5" r="0.5" fill="currentColor"/><ellipse cx="14" cy="11.5" r="1.4" fill="none" stroke="currentColor" strokeWidth="0.9"/><circle cx="14" cy="11.5" r="0.5" fill="currentColor"/><path d="M8 9l2.5 1.5M16 9l-2.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><circle cx="15.5" cy="14" r="0.8" fill="currentColor" opacity="0.3"/></svg>,
    angry:  <svg viewBox="0 0 24 24"><path d="M12 2C8 4 4 10 4 15c0 4.5 3.5 8 8 8s8-3.5 8-8c0-5-4-11-8-13z" fill="#f87171" opacity="0.15"/><path d="M12 2C8 4 4 10 4 15c0 4.5 3.5 8 8 8s8-3.5 8-8c0-5-4-11-8-13z" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M12 5v14" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/><path d="M9 15h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><path d="M8.5 10.5l3 1M15.5 10.5l-3 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  },
  orange: {
    happy:  <svg viewBox="0 0 24 24"><path d="M12 22c-3 0-6-4-6-10C6 6 8 2 12 2s6 4 6 10c0 6-3 10-6 10z" fill="currentColor" opacity="0.2"/><path d="M12 22c-3 0-6-4-6-10C6 6 8 2 12 2s6 4 6 10c0 6-3 10-6 10z" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M10 13s.8 1.2 2 1.2 2-1.2 2-1.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><circle cx="10" cy="10" r="0.8" fill="currentColor"/><circle cx="14" cy="10" r="0.8" fill="currentColor"/><path d="M9 4c1-1.5 2-2 3-2s2 .5 3 2" stroke="currentColor" strokeWidth="0.8" opacity="0.5" fill="none"/></svg>,
    afraid: <svg viewBox="0 0 24 24"><path d="M12 22c-3 0-6-4-6-10C6 6 8 2 12 2s6 4 6 10c0 6-3 10-6 10z" fill="currentColor" opacity="0.12"/><path d="M12 22c-3 0-6-4-6-10C6 6 8 2 12 2s6 4 6 10c0 6-3 10-6 10z" fill="none" stroke="currentColor" strokeWidth="1.3"/><ellipse cx="12" cy="15" rx="1.8" ry="2.2" fill="none" stroke="currentColor" strokeWidth="1.1"/><ellipse cx="10" cy="9.5" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.9"/><circle cx="10" cy="9.5" r="0.5" fill="currentColor"/><ellipse cx="14" cy="9.5" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.9"/><circle cx="14" cy="9.5" r="0.5" fill="currentColor"/><path d="M8 7l2.5 1.5M16 7l-2.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><circle cx="15.5" cy="12.5" r="0.8" fill="currentColor" opacity="0.3"/><path d="M9 4c1-1.5 2-2 3-2s2 .5 3 2" stroke="currentColor" strokeWidth="0.8" opacity="0.5" fill="none"/></svg>,
    angry:  <svg viewBox="0 0 24 24"><path d="M12 22c-3 0-6-4-6-10C6 6 8 2 12 2s6 4 6 10c0 6-3 10-6 10z" fill="#f87171" opacity="0.15"/><path d="M12 22c-3 0-6-4-6-10C6 6 8 2 12 2s6 4 6 10c0 6-3 10-6 10z" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M10 14h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><path d="M8.5 8.5l3 1.5M15.5 8.5l-3 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  },
  black: {
    happy:  <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none" stroke="currentColor" strokeWidth="1.4" rx="2"/><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.3"/><path d="M9 14s1.2 1.5 3 1.5 3-1.5 3-1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><circle cx="10" cy="11" r="0.8" fill="currentColor"/><circle cx="14" cy="11" r="0.8" fill="currentColor"/></svg>,
    afraid: <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none" stroke="currentColor" strokeWidth="1.4" rx="2"/><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.3"/><ellipse cx="12" cy="16" rx="1.8" ry="2" fill="none" stroke="currentColor" strokeWidth="1.2"/><ellipse cx="10" cy="10.5" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="10" cy="10.5" r="0.5" fill="currentColor"/><ellipse cx="14" cy="10.5" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="14" cy="10.5" r="0.5" fill="currentColor"/><path d="M8 8l2.5 1.5M16 8l-2.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><circle cx="16" cy="13" r="0.8" fill="currentColor" opacity="0.3"/></svg>,
    angry:  <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="#f87171" opacity="0.12" rx="2"/><path d="M4 4h16v16H4z" fill="none" stroke="currentColor" strokeWidth="1.4" rx="2"/><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.3"/><path d="M9 15h6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><path d="M8.5 9.5l3 1.5M15.5 9.5l-3 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
  },
};

const REACTION_KEYS = ['happy', 'afraid', 'angry'];

/* ── Supabase reaction helpers ───────────────────────────────── */
const MY_REACT_KEY = 'xelix-my-reactions'; // { [eventId]: 'happy'|'afraid'|'angry' }
function getMyReactions() {
  try { return JSON.parse(localStorage.getItem(MY_REACT_KEY)) || {}; } catch { return {}; }
}
function saveMyReaction(eventId, key) {
  const all = getMyReactions();
  const prev = all[eventId];
  if (prev === key) { delete all[eventId]; }
  else { all[eventId] = key; }
  localStorage.setItem(MY_REACT_KEY, JSON.stringify(all));
  return { prev, next: all[eventId] ?? null };
}

export default function DayCard({ dayKey, dayData, isImportant, date, isToday }) {
  const { lang } = useLanguage();
  const t = useT(lang);
  const events = dayData?.events ?? [];

  return (
    <div className={`day-card glass ${isImportant ? 'day-card--alert' : ''} ${isToday ? 'day-card--today' : ''}`}>
      {/* Day header */}
      <div className="day-card__header">
        <div className="day-card__header-left">
          <h2 className="day-card__name">{t(`days.${dayKey}`)}</h2>
          {date && (
            <span className="day-card__date">{formatDate(date, lang)}</span>
          )}
        </div>
        <div className="day-card__header-right">
          {isToday && (
            <span className="day-card__today-badge">{t('schedule.today')}</span>
          )}
          {isImportant && (
            <span className="day-card__badge">{t('schedule.importantDay')}</span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="day-card__divider" />

      {/* Events */}
      <div className="day-card__events">
        {events.length === 0 ? (
          <p className="day-card__empty">{t('schedule.noEvents')}</p>
        ) : (
          events.map((event) => (
            <EventItem key={event.id} event={event} lang={lang} t={t} />
          ))
        )}
      </div>
    </div>
  );
}

function EventItem({ event, lang, t }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const { theme } = useTheme();
  const [myReaction, setMyReaction] = useState(() => getMyReactions()[event.id] ?? null);
  const [counts, setCounts] = useState({ happy: 0, afraid: 0, angry: 0 });

  // Load reaction counts from Supabase
  useEffect(() => {
    let cancelled = false;
    supabase.from('reactions').select('happy, afraid, angry').eq('event_id', event.id).single()
      .then(({ data }) => { if (!cancelled && data) setCounts({ happy: data.happy, afraid: data.afraid, angry: data.angry }); });
    return () => { cancelled = true; };
  }, [event.id]);

  const handleReaction = useCallback(async (key) => {
    const { prev, next } = saveMyReaction(event.id, key);
    setMyReaction(next);
    // Optimistic update
    setCounts(c => {
      const copy = { ...c };
      if (prev) copy[prev] = Math.max(0, copy[prev] - 1);
      if (next) copy[next] = copy[next] + 1;
      return copy;
    });
    // Persist to Supabase — upsert the row
    const delta = { happy: 0, afraid: 0, angry: 0 };
    if (prev) delta[prev] = -1;
    if (next) delta[next] = 1;
    // read-modify-write
    const { data: existing } = await supabase.from('reactions').select('happy, afraid, angry').eq('event_id', event.id).single();
    if (existing) {
      await supabase.from('reactions').update({
        happy: Math.max(0, existing.happy + delta.happy),
        afraid: Math.max(0, existing.afraid + delta.afraid),
        angry: Math.max(0, existing.angry + delta.angry),
      }).eq('event_id', event.id);
    } else {
      await supabase.from('reactions').insert({
        event_id: event.id,
        happy: Math.max(0, delta.happy),
        afraid: Math.max(0, delta.afraid),
        angry: Math.max(0, delta.angry),
      });
    }
  }, [event.id]);

  const shapes = REACTION_SHAPES[theme] || REACTION_SHAPES.white;
  const label = lang === 'ar' && event.titleAr ? event.titleAr : event.title;
  const typeColor = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.other;
  const typeBg    = EVENT_TYPE_BG[event.type]    || EVENT_TYPE_BG.other;
  const hasNotes  = !!event.notes?.trim();

  return (
    <div
      className={`event-item ${event.isImportant ? 'event-item--important' : ''}`}
      style={{ '--evt-color': typeColor, '--evt-bg': typeBg }}
    >
      <div className="event-item__accent" />
      <div className="event-item__body">
        <div className="event-item__top">
          <span className="event-item__type">{t(`eventTypes.${event.type}`)}</span>
          {event.time && <span className="event-item__time">{event.time}</span>}
        </div>
        <p className="event-item__title">{label}</p>
        <div className="event-item__meta">
          {event.room && (
            <span className="event-meta-chip">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.49-2.01-4.5-4.5-4.5z" fill="currentColor"/>
              </svg>
              {event.room}
            </span>
          )}
          {event.instructor && (
            <span className="event-meta-chip">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2 13c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {event.instructor}
            </span>
          )}
        </div>
        {event.addedByName && (
          <p className="event-item__added-by">
            {t('schedule.addedBy')}: <span>{event.addedByName}</span>
          </p>
        )}
        {hasNotes && (
          <>
            <button
              type="button"
              className={`event-item__notes-toggle ${notesOpen ? 'open' : ''}`}
              onClick={() => setNotesOpen((v) => !v)}
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {notesOpen ? t('schedule.hideDetails') : t('schedule.showDetails')}
            </button>
            {notesOpen && (
              <div className="event-item__notes">
                {event.notes}
              </div>
            )}
          </>
        )}
        {/* Reaction buttons */}
        <div className="event-reactions">
          {REACTION_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={`event-reactions__btn ${myReaction === key ? 'active' : ''}`}
              onClick={() => handleReaction(key)}
              aria-label={key}
            >
              <span className="event-reactions__icon">{shapes[key]}</span>
              {counts[key] > 0 && <span className="event-reactions__count">{counts[key]}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
