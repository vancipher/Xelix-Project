import { useState, useEffect, useCallback } from 'react';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGroup } from '../../contexts/GroupContext';
import { useT } from '../../utils/i18n';
import { DAY_KEYS, GROUPS, getWeekDates, getTodayDayKey, formatDate } from '../../utils/helpers';
import DayCard from './DayCard';
import './WeeklySchedule.css';

export default function WeeklySchedule() {
  const { getDayFiltered, isDayImportant } = useSchedule();
  const { lang } = useLanguage();
  const { activeGroup, setActiveGroup } = useGroup();
  const t = useT(lang);

  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates]   = useState(() => getWeekDates(0));
  const [todayKey,  setTodayKey]    = useState(getTodayDayKey);

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

      {/* Group tabs */}
      <div className="group-tabs">
        {GROUPS.map((g) => (
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
    </div>
  );
}
