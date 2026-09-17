import { useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import { DAY_KEYS, isSameCalendarDay } from '../../utils/helpers';
import './WeekNav.css';

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 3L5 8l5 5"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCalendarWeek() {
  return (
    <svg className="week-nav-cal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16 3v4M8 3v4M3 11h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="8" cy="15" r="1.1" fill="currentColor" />
      <circle cx="12" cy="15" r="1.1" fill="currentColor" />
      <circle cx="16" cy="15" r="1.1" fill="currentColor" />
    </svg>
  );
}

function formatDayAbbrev(date, lang) {
  const locale = lang === 'ar' ? 'ar-EG-u-ca-gregory' : 'en-GB';
  return date.toLocaleDateString(locale, { weekday: 'narrow' });
}

function formatDayNum(date, lang) {
  const locale = lang === 'ar' ? 'ar-EG-u-ca-gregory' : 'en-GB';
  return date.toLocaleDateString(locale, { day: 'numeric' });
}

export default function WeekNav({ weekOffset, setWeekOffset, weekDates, weekLabel }) {
  const { lang } = useLanguage();
  const t = useT(lang);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const goPrev = () => setWeekOffset((o) => o - 1);
  const goNext = () => setWeekOffset((o) => o + 1);

  const offsetLabel = weekOffset !== 0
    ? (lang === 'ar'
      ? (weekOffset > 0 ? `+${weekOffset} أسبوع` : `${weekOffset} أسبوع`)
      : (weekOffset > 0 ? `+${weekOffset} wk` : `${weekOffset} wk`))
    : null;

  return (
    <nav className="week-nav" dir="ltr" aria-label={t('schedule.weekNav')}>
      <button
        type="button"
        className="week-nav-btn"
        onClick={goPrev}
        aria-label={t('schedule.prevWeek')}
      >
        <ChevronLeft />
      </button>

      <div className="week-nav-center">
        <div className="week-nav-head">
          <IconCalendarWeek />
          <span className="week-nav-label">{weekLabel}</span>
        </div>

        <div className="week-nav-strip" role="group" aria-label={weekLabel} dir="ltr">
          {DAY_KEYS.map((dayKey) => {
            const date = weekDates[dayKey];
            if (!date) return null;
            const isToday = isSameCalendarDay(date, today);
            return (
              <div
                key={dayKey}
                className={`week-nav-day${isToday ? ' week-nav-day--today' : ''}`}
                title={isToday ? t('schedule.today') : undefined}
              >
                <span className="week-nav-day-abbr">{formatDayAbbrev(date, lang)}</span>
                <span className="week-nav-day-num">{formatDayNum(date, lang)}</span>
              </div>
            );
          })}
        </div>

        <div className="week-nav-meta">
          {weekOffset === 0 ? (
            <span className="week-nav-current">
              <span className="week-nav-live-dot" aria-hidden />
              {t('schedule.thisWeek')}
            </span>
          ) : (
            <>
              <button
                type="button"
                className="week-nav-today"
                onClick={() => setWeekOffset(0)}
              >
                {t('schedule.jumpThisWeek')}
              </button>
              {offsetLabel && (
                <span className="week-nav-offset" aria-hidden>{offsetLabel}</span>
              )}
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        className="week-nav-btn"
        onClick={goNext}
        aria-label={t('schedule.nextWeek')}
      >
        <ChevronRight />
      </button>
    </nav>
  );
}
