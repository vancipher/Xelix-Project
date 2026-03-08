import { useState, useEffect, useCallback } from 'react';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useGroup } from '../../contexts/GroupContext';
import { useT } from '../../utils/i18n';
import { DAY_KEYS, SECTIONS, SECTION_GROUPS, getWeekDates, getTodayDayKey, formatDate } from '../../utils/helpers';
import { supabase } from '../../firebase';
import DayCard from './DayCard';
import './WeeklySchedule.css';

/* ── Theme-based visitor icon ────────────────────────────────── */
const VISITOR_ICONS = {
  white:    <svg viewBox="0 0 20 20" width="16" height="16"><circle cx="10" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M3 18c0-3.3 3.1-6 7-6s7 2.7 7 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  sun:      <svg viewBox="0 0 20 20" width="16" height="16"><circle cx="10" cy="10" r="4" fill="currentColor" opacity="0.3"/><circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.2 4.2l2 2M13.8 13.8l2 2M4.2 15.8l2-2M13.8 6.2l2-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  sea:      <svg viewBox="0 0 20 20" width="16" height="16"><defs><linearGradient id="oceanDepth" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="currentColor" stopOpacity="0.7"/><stop offset="100%" stopColor="currentColor" stopOpacity="0.95"/></linearGradient></defs><path d="M0 7Q3.5 4.5 7 7T14 7T20 7" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/><path d="M0 10Q3.5 8 7 10T14 10T20 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.75"/><path d="M0 13Q3.5 11 7 13T14 13T20 13" fill="currentColor" opacity="0.85"/><path d="M0 16Q3.5 14.5 7 16T14 16T20 16" fill="currentColor" opacity="0.9"/></svg>,
  lavender: <svg viewBox="0 0 20 20" width="16" height="16"><path d="M10 18C10 18 3 12.5 3 7.5a4.2 4.2 0 0 1 7-3.1 4.2 4.2 0 0 1 7 3.1c0 5-7 10.5-7 10.5z" fill="currentColor" opacity="0.25"/><path d="M10 18C10 18 3 12.5 3 7.5a4.2 4.2 0 0 1 7-3.1 4.2 4.2 0 0 1 7 3.1c0 5-7 10.5-7 10.5z" fill="none" stroke="currentColor" strokeWidth="1.3"/></svg>,
  purple:   <svg viewBox="0 0 20 20" width="16" height="16"><circle cx="10" cy="8" r="5" fill="currentColor" opacity="0.2"/><circle cx="10" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="6.5" cy="5.5" r="2.2" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="13.5" cy="5.5" r="2.2" fill="none" stroke="currentColor" strokeWidth="1"/><path d="M8 16v2M12 16v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  nature:   <svg viewBox="0 0 20 20" width="16" height="16"><path d="M10 2C7 3.5 4 8 4 12c0 3.5 2.7 6 6 6s6-2.5 6-6c0-4-3-8.5-6-10z" fill="currentColor" opacity="0.2"/><path d="M10 2C7 3.5 4 8 4 12c0 3.5 2.7 6 6 6s6-2.5 6-6c0-4-3-8.5-6-10z" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M10 5v12" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/></svg>,
  orange:   <svg viewBox="0 0 20 20" width="16" height="16"><path d="M10 18c-2.5 0-5-3.5-5-8.5S7.5 2 10 2s5 3 5 7.5-2.5 8.5-5 8.5z" fill="currentColor" opacity="0.25"/><path d="M10 18c-2.5 0-5-3.5-5-8.5S7.5 2 10 2s5 3 5 7.5-2.5 8.5-5 8.5z" fill="none" stroke="currentColor" strokeWidth="1.2"/></svg>,
  black:    <svg viewBox="0 0 20 20" width="16" height="16"><path d="M4 4h12v12H4z" fill="none" stroke="currentColor" strokeWidth="1.3" rx="1.5"/><path d="M6.5 6.5l7 7M13.5 6.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/></svg>,
};

const VISIT_KEY = 'xelix-visited';

export default function WeeklySchedule() {
  const { getDayFiltered, isDayImportant } = useSchedule();
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const { activeSection, setActiveSection, activeGroup, setActiveGroup, sectionGroups } = useGroup();
  const t = useT(lang);

  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates]   = useState(() => getWeekDates(0));
  const [todayKey,  setTodayKey]    = useState(getTodayDayKey);
  const [visits, setVisits]         = useState(null);

  // Visit counter - increment every visit
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('visits').select('count').eq('id', 'global').single();
      const newCount = (data?.count ?? 1455) + 1;
      await supabase.from('visits').upsert({ id: 'global', count: newCount });
      if (!cancelled) setVisits(newCount);
    })();
    return () => { cancelled = true; };
  }, []);

  // Recompute dates whenever offset changes
  useEffect(() => {
    setWeekDates(getWeekDates(weekOffset));
  }, [weekOffset]);

  // Auto-refresh: detect midnight crossover even when offset=0
  const refresh = useCallback(() => {
    const newToday = getTodayDayKey();
    if (newToday !== todayKey) {
      setTodayKey(newToday);
      if (weekOffset === 0) setWeekDates(getWeekDates(0));
    }
  }, [todayKey, weekOffset]);

  useEffect(() => {
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  const importantCount = DAY_KEYS.filter(
    (dk) => isDayImportant(activeGroup, dk, weekDates[dk])
  ).length;

  // Week range label: "Sat dd Mon — Fri dd Mon"
  const satDate = weekDates[DAY_KEYS[0]];
  const friDate = weekDates[DAY_KEYS[6]];
  const weekLabel = satDate && friDate
    ? `${formatDate(satDate, lang)} — ${formatDate(friDate, lang)}`
    : '';

  return (
    <div className="schedule-page">
      {/* Page header */}
      <div className="schedule-header">
        <div>
          <h1 className="schedule-title">{t('schedule.title')}</h1>
          <p className="schedule-subtitle">{t('schedule.subtitle')}</p>
        </div>
        {importantCount > 0 && (
          <div className="alert-summary">
            <span className="alert-dot" />
            <span>
              {importantCount}&nbsp;
              {lang === 'ar'
                ? 'يوم مهم هذا الأسبوع'
                : `important day${importantCount > 1 ? 's' : ''} this week`}
            </span>
          </div>
        )}
      </div>

      {/* Week navigation */}
      <div className="week-nav" dir="ltr">
        <button className="week-nav-btn" onClick={() => setWeekOffset((o) => lang === 'ar' ? o + 1 : o - 1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="week-nav-center">
          <span className="week-nav-label">{weekLabel}</span>
          {weekOffset === 0 ? (
            <span className="week-nav-current">{t('schedule.thisWeek')}</span>
          ) : (
            <button className="week-nav-today" onClick={() => setWeekOffset(0)}>
              ↩ {t('schedule.thisWeek')}
            </button>
          )}
        </div>
        <button className="week-nav-btn" onClick={() => setWeekOffset((o) => lang === 'ar' ? o - 1 : o + 1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Section tabs */}
      <div className="section-tabs">
        {SECTIONS.map((s) => (
          <button
            key={s}
            className={`section-tab ${activeSection === s ? 'section-tab--active' : ''}`}
            onClick={() => setActiveSection(s)}
          >
            {t(`sections.${s}`)}
          </button>
        ))}
      </div>

      {/* Group tabs */}
      <div className="group-tabs">
        {sectionGroups.map((g) => (
          <button
            key={g}
            className={`group-tab ${activeGroup === g ? 'group-tab--active' : ''}`}
            onClick={() => setActiveGroup(g)}
          >
            {t(`groups.${g}`)}
          </button>
        ))}
      </div>

      {/* Week grid */}
      <div className="week-grid">
        {DAY_KEYS.map((dayKey) => (
          <DayCard
            key={dayKey}
            dayKey={dayKey}
            dayData={getDayFiltered(activeGroup, dayKey, weekDates[dayKey])}
            isImportant={isDayImportant(activeGroup, dayKey, weekDates[dayKey])}
            date={weekDates[dayKey]}
            isToday={weekOffset === 0 && dayKey === todayKey}
          />
        ))}
      </div>
      {visits !== null && (
        <div className="schedule-visits">
          <span className="schedule-visits__icon">{VISITOR_ICONS[theme] || VISITOR_ICONS.white}</span>
          <span className="schedule-visits__count">{visits.toLocaleString()}</span>
          <span className="schedule-visits__label">{t('footer.visits')}</span>
        </div>
      )}
    </div>
  );
}
