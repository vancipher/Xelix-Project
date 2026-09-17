import { useState, useEffect, useCallback } from 'react';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGroup } from '../../contexts/GroupContext';
import { useT } from '../../utils/i18n';
import { DAY_KEYS, SECTIONS, SECTION_GROUPS, getWeekDates, getTodayDayKey, formatDate } from '../../utils/helpers';
import DayCard from './DayCard';
import WeekNav from './WeekNav';
import './WeeklySchedule.css';

export default function WeeklySchedule() {
  const { getDayFiltered, isDayImportant } = useSchedule();
  const { lang } = useLanguage();
  const { activeSection, setActiveSection, activeGroup, setActiveGroup, sectionGroups } = useGroup();
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
      <WeekNav
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
        weekDates={weekDates}
        weekLabel={weekLabel}
      />

      <div
        className="section-tabs section-tabs--shift"
        role="radiogroup"
        dir="ltr"
        aria-label={`${t('sections.evening')} / ${t('sections.morning')}`}
      >
        <span
          className="section-tabs-thumb"
          aria-hidden
          style={{ transform: `translateX(${SECTIONS.indexOf(activeSection) * 100}%)` }}
        />
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={activeSection === s}
            className={`section-tab ${activeSection === s ? 'section-tab--active' : ''}`}
            onClick={() => setActiveSection(s)}
          >
            {t(`sections.${s}`)}
          </button>
        ))}
      </div>

      <div
        className={`group-tabs group-tabs--shift${importantCount > 0 ? '' : ' group-tabs--spaced'}`}
        role="radiogroup"
        dir="ltr"
        aria-label={t('groups.label')}
        style={{ '--group-count': sectionGroups.length }}
      >
        <span
          className="group-tabs-thumb"
          aria-hidden
          style={{ transform: `translateX(${Math.max(0, sectionGroups.indexOf(activeGroup)) * 100}%)` }}
        />
        {sectionGroups.map((g) => (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={activeGroup === g}
            className={`group-tab ${activeGroup === g ? 'group-tab--active' : ''}`}
            onClick={() => setActiveGroup(g)}
            aria-label={t(`groups.${g}`)}
          >
            {g.replace(/^M/, '')}
          </button>
        ))}
      </div>

      {importantCount > 0 && (
        <div className="schedule-alert">
          <div className="alert-summary" role="status">
            <span className="alert-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path
                  d="M12 3.5 2.5 19.5h19L12 3.5z"
                  fill="currentColor"
                  opacity="0.18"
                />
                <path
                  d="M12 3.5 2.5 19.5h19L12 3.5z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
                <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16.25" r="1.1" fill="currentColor" />
              </svg>
            </span>
            <span className="alert-summary-text">
              {importantCount}&nbsp;
              {lang === 'ar'
                ? 'يوم مهم هذا الأسبوع'
                : `important day${importantCount > 1 ? 's' : ''} this week`}
            </span>
          </div>
        </div>
      )}

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
