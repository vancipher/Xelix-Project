import { useState } from 'react';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import {
  DAY_KEYS, SECTIONS, SECTION_GROUPS, GROUPS, EVENT_TYPE_COLORS, EVENT_TYPE_BG,
  getWeekDates, getTodayDayKey, formatDate,
} from '../../utils/helpers';
import Modal from '../UI/Modal';
import EventForm from './EventForm';
import { sendEventPushNotification } from '../../utils/notifications';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { getDayFiltered, addEvent, editEvent, deleteEvent } = useSchedule();
  const { admin, canAccessGroup } = useAuth();
  const { lang } = useLanguage();
  const t = useT(lang);

  // Restrict group tabs to what this admin can access
  const accessibleGroups = GROUPS.filter((g) => canAccessGroup(g));

  // Section state
  const [activeSection, setActiveSection] = useState(() => {
    // Default to first section that has accessible groups
    for (const s of SECTIONS) {
      if (SECTION_GROUPS[s].some((g) => accessibleGroups.includes(g))) return s;
    }
    return SECTIONS[0];
  });
  const sectionGroups = SECTION_GROUPS[activeSection]?.filter((g) => accessibleGroups.includes(g)) ?? [];
  const [activeGroup, setActiveGroup] = useState(sectionGroups[0] ?? accessibleGroups[0] ?? 'A');

  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);
  const todayKey  = getTodayDayKey();

  const satDate  = weekDates[DAY_KEYS[0]];
  const friDate  = weekDates[DAY_KEYS[6]];
  const weekLabel = satDate && friDate
    ? `${formatDate(satDate, lang)} — ${formatDate(friDate, lang)}`
    : '';

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const openAdd = (dayKey) => {
    setSelectedDay(dayKey);
    setSelectedDayDate(weekDates[dayKey] || null);
    setEditTarget(null);
    setModalMode('add');
  };

  const openEdit = (dayKey, event) => {
    setSelectedDay(dayKey);
    setSelectedDayDate(weekDates[dayKey] || null);
    setEditTarget(event);
    setModalMode('edit');
  };

  const closeModal = () => { setModalMode(null); setEditTarget(null); };

  const handleSave = (formData) => {
    if (modalMode === 'add') {
      addEvent(activeGroup, selectedDay, formData, admin.displayName);
      // Fire push notification for new events (non-blocking)
      const lines = [];
      if (formData.titleAr) lines.push(formData.titleAr);
      if (formData.title && formData.title !== formData.titleAr) lines.push(formData.title);
      lines.push(`📌 ${t(`eventTypes.${formData.type}`)}`);
      if (formData.time) lines.push(`🕐 ${formData.time}`);
      if (formData.room) lines.push(`📍 ${formData.room}`);
      if (formData.instructor) lines.push(`👨‍🏫 ${formData.instructor}`);
      if (formData.notes) lines.push(`📝 ${formData.notes}`);
      sendEventPushNotification({
        title: `Xelix — ${t(`groups.${activeGroup}`)} — ${t(`days.${selectedDay}`)}`,
        body: lines.join('\n'),
        url: '/',
      });
    } else {
      editEvent(activeGroup, selectedDay, editTarget.id, formData, admin.displayName);
    }
    closeModal();
    showToast(t('admin.changesSaved'));
  };

  const handleDelete = () => {
    if (!editTarget) return;
    deleteEvent(activeGroup, selectedDay, editTarget.id);
    closeModal();
    showToast(t('admin.changesSaved'));
  };

  const handleRemind = (evt, group, dayKey) => {
    const lines = [];
    if (evt.titleAr) lines.push(evt.titleAr);
    if (evt.title && evt.title !== evt.titleAr) lines.push(evt.title);
    const typeLabelEn = t(`eventTypes.${evt.type}`);
    lines.push(`📌 ${typeLabelEn}`);
    if (evt.time) lines.push(`🕐 ${evt.time}`);
    if (evt.room) lines.push(`📍 ${evt.room}`);
    if (evt.instructor) lines.push(`👨‍🏫 ${evt.instructor}`);
    if (evt.notes) lines.push(`📝 ${evt.notes}`);
    const body = lines.join('\n');
    sendEventPushNotification({
      title: `Xelix — ${t(`groups.${group}`)} — ${t(`days.${dayKey}`)}`,
      body,
      url: '/',
    });
    showToast(t('admin.notifSent'));
  };

  return (
    <div className="dashboard-page">
      {/* Page header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">{t('admin.dashboard')}</h1>
          <p className="dash-sub">
            {t('admin.loggedInAs')} <strong>{admin?.displayName}</strong>
          </p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="dash-section-tabs">
        {SECTIONS.map((s) => {
          const hasAccess = SECTION_GROUPS[s].some((g) => accessibleGroups.includes(g));
          if (!hasAccess) return null;
          return (
            <button
              key={s}
              className={`section-tab ${activeSection === s ? 'section-tab--active' : ''}`}
              onClick={() => {
                setActiveSection(s);
                const first = SECTION_GROUPS[s].filter((g) => accessibleGroups.includes(g))[0];
                if (first) setActiveGroup(first);
              }}
            >
              {t(`sections.${s}`)}
            </button>
          );
        })}
      </div>

      {/* Group tabs */}
      <div className="dash-group-tabs">
        {sectionGroups.map((g) => (
          <button
            key={g}
            className={`dash-group-tab ${activeGroup === g ? 'dash-group-tab--active' : ''}`}
            onClick={() => setActiveGroup(g)}
          >
            {t(`groups.${g}`)}
          </button>
        ))}
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

      {/* Days grid */}
      <div className="dash-grid">
        {DAY_KEYS.map((dayKey) => {
          const dayData = getDayFiltered(activeGroup, dayKey, weekDates[dayKey]);
          const hasImportant = dayData.events.some((e) => e.isImportant);
          const isToday = weekOffset === 0 && dayKey === todayKey;
          const date = weekDates[dayKey];
          return (
            <div
              key={dayKey}
              className={`dash-day glass ${hasImportant ? 'dash-day--alert' : ''} ${isToday ? 'dash-day--today' : ''}`}
            >
              {/* Day header */}
              <div className="dash-day__head">
                <div className="dash-day__head-info">
                  <h2 className="dash-day__name">{t(`days.${dayKey}`)}</h2>
                  {date && (
                    <span className="dash-day__date">{formatDate(date, lang)}</span>
                  )}
                  {isToday && (
                    <span className="dash-day__today">{t('schedule.today')}</span>
                  )}
                </div>
                <button
                  className="dash-add-btn"
                  onClick={() => openAdd(dayKey)}
                  title={t('admin.addEvent')}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  {t('admin.addEvent')}
                </button>
              </div>

              <div className="dash-day__divider" />

              {/* Events list */}
              <div className="dash-day__events">
                {dayData.events.length === 0 ? (
                  <p className="dash-empty">{t('admin.noEvents')}</p>
                ) : (
                  dayData.events.map((evt) => (
                    <AdminEventRow
                      key={evt.id}
                      event={evt}
                      lang={lang}
                      t={t}
                      onEdit={() => openEdit(dayKey, evt)}
                      onNotify={() => handleRemind(evt, activeGroup, dayKey)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={!!modalMode}
        onClose={closeModal}
        title={modalMode === 'add' ? t('admin.addEvent') : t('admin.editEvent')}
      >
        <EventForm
          initial={editTarget}
          dayDate={selectedDayDate}
          onSave={handleSave}
          onCancel={closeModal}
          onDelete={modalMode === 'edit' ? handleDelete : undefined}
        />
      </Modal>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function AdminEventRow({ event, lang, t, onEdit, onNotify }) {
  const label = lang === 'ar' && event.titleAr ? event.titleAr : event.title;
  const typeColor = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.other;
  const typeBg    = EVENT_TYPE_BG[event.type]    || EVENT_TYPE_BG.other;

  return (
    <div
      className={`aer ${event.isImportant ? 'aer--important' : ''}`}
      style={{ '--c': typeColor, '--bg': typeBg }}
    >
      <div className="aer__bar" />
      <div className="aer__body">
        <div className="aer__top">
          <span className="aer__type">{t(`eventTypes.${event.type}`)}</span>
          {event.time && <span className="aer__time">{event.time}</span>}
          {event.isRecurring === false && event.date && (
            <span className="aer__oneoff" title="One-time event">
              📅 {event.date.slice(0, 10)}
            </span>
          )}
        </div>
        <p className="aer__title">{label || event.title}</p>
        {event.addedByName && (
          <p className="aer__by">{t('schedule.addedBy')}: <span>{event.addedByName}</span></p>
        )}
      </div>
      <button className="aer__notify" onClick={onNotify} aria-label="send reminder" title={t('admin.sendReminder')}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5a4 4 0 0 0-4 4v2.7L2.6 10.8a.5.5 0 0 0 .4.7h10a.5.5 0 0 0 .4-.7L12 8.2V5.5a4 4 0 0 0-4-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          <path d="M6.5 12a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </button>
      <button className="aer__edit" onClick={onEdit} aria-label="edit">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
