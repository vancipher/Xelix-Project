import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import {
  EVENT_TYPES, EVENT_TYPE_COLORS, EVENT_TYPE_BG, EVENT_TYPE_RECURRING_DEFAULT,
} from '../../utils/helpers';
import { translateArToEn } from '../../utils/translate';
import './EventForm.css';

const EMPTY = {
  title: '', titleAr: '', type: 'lecture',
  time: '', room: '', instructor: '', isImportant: false,
  isRecurring: true, date: '', notes: '',
};

const TYPE_ICONS = {
  lecture: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  quiz: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  assignment: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  exam: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6M9 15l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  report: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  lab: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path d="M9 3h6M10 3v7.5L5.2 18a2.4 2.4 0 0 0 2 3.6h9.6a2.4 2.4 0 0 0 2-3.6L14 10.5V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.2 14h7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  other: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="5.5" cy="12" r="1.6" fill="currentColor" />
      <circle cx="18.5" cy="12" r="1.6" fill="currentColor" />
    </svg>
  ),
};

export default function EventForm({ initial, onSave, onCancel, onDelete, dayDate }) {
  const { lang } = useLanguage();
  const t = useT(lang);
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : { ...EMPTY });
  const [titleError, setTitleError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        ...EMPTY,
        ...initial,
        titleAr: initial.titleAr || initial.title || '',
      });
    } else {
      setForm({ ...EMPTY });
    }
    setTitleError(false);
    setSaving(false);
  }, [initial]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleTypeChange = (tp) => {
    setForm((f) => ({
      ...f,
      type: tp,
      isRecurring: EVENT_TYPE_RECURRING_DEFAULT[tp] ?? true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const titleAr = form.titleAr.trim();
    if (!titleAr) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    setSaving(true);
    try {
      const title = await translateArToEn(titleAr);
      const autoDate = dayDate instanceof Date
        ? dayDate.toISOString().split('T')[0]
        : (dayDate || null);
      onSave({
        ...form,
        titleAr,
        title: title || titleAr,
        date: form.isRecurring ? null : autoDate,
      });
    } finally {
      setSaving(false);
    }
  };

  const typeColor = EVENT_TYPE_COLORS[form.type] || EVENT_TYPE_COLORS.other;
  const typeBg = EVENT_TYPE_BG[form.type] || EVENT_TYPE_BG.other;

  return (
    <form
      className="event-form"
      onSubmit={handleSubmit}
      style={{ '--ef-type': typeColor, '--ef-type-bg': typeBg }}
    >
      <div className="ef-type-banner" aria-hidden />

      <section className="ef-section">
        <div className="ef-section-head">
          <span className="ef-label">{t('admin.eventType')}</span>
          <span className="ef-type-chip">
            <span className="ef-type-chip__icon">{TYPE_ICONS[form.type]}</span>
            {t(`eventTypes.${form.type}`)}
          </span>
        </div>
        <div className="ef-type-grid" role="radiogroup" aria-label={t('admin.eventType')}>
          {EVENT_TYPES.map((tp) => (
            <button
              key={tp}
              type="button"
              role="radio"
              aria-checked={form.type === tp}
              className={`ef-type-btn ${form.type === tp ? 'selected' : ''}`}
              style={{
                '--c': EVENT_TYPE_COLORS[tp],
                '--c-bg': EVENT_TYPE_BG[tp],
              }}
              onClick={() => handleTypeChange(tp)}
            >
              <span className="ef-type-btn__icon">{TYPE_ICONS[tp]}</span>
              <span className="ef-type-btn__label">{t(`eventTypes.${tp}`)}</span>
            </button>
          ))}
        </div>
      </section>

      <label className={`ef-toggle-card ${form.isRecurring ? 'is-on' : ''}`}>
        <input
          type="checkbox"
          checked={!!form.isRecurring}
          onChange={(e) => set('isRecurring', e.target.checked)}
        />
        <span className="ef-toggle-card__copy">
          <span className="ef-toggle-card__title">{t('admin.isRecurring')}</span>
          <span className="ef-toggle-card__hint">
            {form.isRecurring
              ? (lang === 'ar' ? 'يظهر كل أسبوع تلقائياً' : 'Shows automatically every week')
              : (lang === 'ar' ? 'لهذا اليوم فقط' : 'Only for this day')}
          </span>
        </span>
        <span className="ef-toggle-track ef-toggle-track--accent">
          <span className="ef-toggle-thumb" />
        </span>
      </label>

      <section className="ef-section">
        <div className="ef-group">
          <label className="ef-label" htmlFor="ef-title-ar">{t('admin.eventTitleAr')}</label>
          <div className={`ef-field ${titleError ? 'ef-field--error' : ''}`}>
            <span className="ef-field__icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path d="M4 7h16M4 12h10M4 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <input
              id="ef-title-ar"
              className="ef-input"
              value={form.titleAr}
              onChange={(e) => {
                set('titleAr', e.target.value);
                if (e.target.value.trim()) setTitleError(false);
              }}
              placeholder="مثال: امتحان حساب التفاضل"
              dir="rtl"
              style={{ fontFamily: 'var(--font-ar)' }}
              disabled={saving}
              required
            />
          </div>
          <p className="ef-hint">{t('admin.eventTitleHint')}</p>
          {titleError && (
            <p className="ef-error" role="alert">
              {lang === 'ar' ? 'أدخل عنوان الحدث بالعربية' : 'Enter the event title in Arabic'}
            </p>
          )}
        </div>

        <div className="ef-row">
          <div className="ef-group">
            <label className="ef-label" htmlFor="ef-time">{t('admin.eventTime')}</label>
            <div className="ef-field">
              <span className="ef-field__icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="ef-time"
                className="ef-input"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
                placeholder="09:00 - 10:30"
                dir="ltr"
                disabled={saving}
              />
            </div>
          </div>
          <div className="ef-group">
            <label className="ef-label" htmlFor="ef-room">{t('admin.eventRoom')}</label>
            <div className="ef-field">
              <span className="ef-field__icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </span>
              <input
                id="ef-room"
                className="ef-input"
                value={form.room}
                onChange={(e) => set('room', e.target.value)}
                placeholder="A-101"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <div className="ef-row">
          <div className="ef-group">
            <label className="ef-label" htmlFor="ef-instructor">{t('admin.eventInstructor')}</label>
            <div className="ef-field">
              <span className="ef-field__icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M5 19c0-3.2 3.1-5.5 7-5.5s7 2.3 7 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="ef-instructor"
                className="ef-input"
                value={form.instructor}
                onChange={(e) => set('instructor', e.target.value)}
                placeholder="د. …"
                disabled={saving}
              />
            </div>
          </div>
          <div className="ef-group">
            <label className="ef-label" htmlFor="ef-notes">{t('admin.eventNotes')}</label>
            <div className="ef-field ef-field--textarea">
              <textarea
                id="ef-notes"
                className="ef-input ef-textarea"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder={t('admin.notesPlaceholder')}
                rows={2}
                disabled={saving}
              />
            </div>
          </div>
        </div>
      </section>

      <label className={`ef-toggle-card ef-toggle-card--alert ${form.isImportant ? 'is-on' : ''}`}>
        <input
          type="checkbox"
          checked={form.isImportant}
          onChange={(e) => set('isImportant', e.target.checked)}
        />
        <span className="ef-toggle-card__copy">
          <span className="ef-toggle-card__title">{t('admin.isImportant')}</span>
          <span className="ef-toggle-card__hint">
            {lang === 'ar' ? 'يظهر تنبيه في أعلى الجدول' : 'Shows an alert at the top of the schedule'}
          </span>
        </span>
        <span className="ef-toggle-track ef-toggle-track--danger">
          <span className="ef-toggle-thumb" />
        </span>
      </label>

      <div className="ef-actions">
        {onDelete && (
          <button type="button" className="ef-btn ef-btn--danger" onClick={onDelete} disabled={saving}>
            {t('admin.delete')}
          </button>
        )}
        <div className="ef-actions-right">
          <button type="button" className="ef-btn ef-btn--ghost" onClick={onCancel} disabled={saving}>
            {t('admin.cancel')}
          </button>
          <button type="submit" className="ef-btn ef-btn--primary" disabled={saving}>
            {saving ? t('admin.savingTranslate') : t('admin.save')}
          </button>
        </div>
      </div>
    </form>
  );
}
