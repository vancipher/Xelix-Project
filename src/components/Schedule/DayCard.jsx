import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import { EVENT_TYPE_COLORS, EVENT_TYPE_BG, formatDate } from '../../utils/helpers';
import './DayCard.css';

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
  const label = lang === 'ar' && event.titleAr ? event.titleAr : event.title;
  const typeColor = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.other;
  const typeBg    = EVENT_TYPE_BG[event.type]    || EVENT_TYPE_BG.other;

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
      </div>
    </div>
  );
}
