import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import { EVENT_TYPES, EVENT_TYPE_COLORS, EVENT_TYPE_RECURRING_DEFAULT } from '../../utils/helpers';
import './EventForm.css';

const EMPTY = {
  title: '', titleAr: '', type: 'lecture',
  time: '', room: '', instructor: '', isImportant: false,
  isRecurring: true, date: '',
};

export default function EventForm({ initial, onSave, onCancel, onDelete, dayDate }) {
  const { lang } = useLanguage();
  const t = useT(lang);
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : { ...EMPTY });

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial } : { ...EMPTY });
  }, [initial]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // When type changes, update isRecurring default only if it hasn't been manually set
  const handleTypeChange = (tp) => {
    setForm((f) => ({
      ...f,
      type: tp,
      isRecurring: EVENT_TYPE_RECURRING_DEFAULT[tp] ?? true,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() && !form.titleAr.trim()) return;
    const autoDate = dayDate instanceof Date
      ? dayDate.toISOString().split('T')[0]
      : (dayDate || null);
    onSave({
      ...form,
      date: form.isRecurring ? null : autoDate,
    });
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      {/* Event type */}
      <div className="ef-group">
        <label className="ef-label">{t('admin.eventType')}</label>
        <div className="ef-type-grid">
          {EVENT_TYPES.map((tp) => (
            <button
              key={tp}
              type="button"
              className={`ef-type-btn ${form.type === tp ? 'selected' : ''}`}
              style={{ '--c': EVENT_TYPE_COLORS[tp] }}
              onClick={() => handleTypeChange(tp)}
            >
              {t(`eventTypes.${tp}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Recurring toggle */}
      <label className="ef-toggle">
        <input
          type="checkbox"
          checked={!!form.isRecurring}
          onChange={(e) => set('isRecurring', e.target.checked)}
        />
        <span className="ef-toggle-track">
          <span className="ef-toggle-thumb" />
        </span>
        <span className="ef-toggle-label">{t('admin.isRecurring')}</span>
      </label>

      {/* Title EN */}
      <div className="ef-group">
        <label className="ef-label">{t('admin.eventTitle')}</label>
        <input
          className="ef-input"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Calculus Midterm"
          dir="ltr"
        />
      </div>

      {/* Title AR */}
      <div className="ef-group">
        <label className="ef-label">{t('admin.eventTitleAr')}</label>
        <input
          className="ef-input"
          value={form.titleAr}
          onChange={(e) => set('titleAr', e.target.value)}
          placeholder="مثال: امتحان حساب التفاضل"
          dir="rtl"
          style={{ fontFamily: 'var(--font-ar)' }}
        />
      </div>

      {/* Time & Room (2-col) */}
      <div className="ef-row">
        <div className="ef-group">
          <label className="ef-label">{t('admin.eventTime')}</label>
          <input
            className="ef-input"
            value={form.time}
            onChange={(e) => set('time', e.target.value)}
            placeholder="09:00 - 10:30"
            dir="ltr"
          />
        </div>
        <div className="ef-group">
          <label className="ef-label">{t('admin.eventRoom')}</label>
          <input
            className="ef-input"
            value={form.room}
            onChange={(e) => set('room', e.target.value)}
            placeholder="A-101"
          />
        </div>
      </div>

      {/* Instructor */}
      <div className="ef-group">
        <label className="ef-label">{t('admin.eventInstructor')}</label>
        <input
          className="ef-input"
          value={form.instructor}
          onChange={(e) => set('instructor', e.target.value)}
          placeholder="Dr. ..."
        />
      </div>

      {/* Important toggle */}
      <label className="ef-toggle">
        <input
          type="checkbox"
          checked={form.isImportant}
          onChange={(e) => set('isImportant', e.target.checked)}
        />
        <span className="ef-toggle-track">
          <span className="ef-toggle-thumb" />
        </span>
        <span className="ef-toggle-label">{t('admin.isImportant')}</span>
      </label>

      {/* Actions */}
      <div className="ef-actions">
        {onDelete && (
          <button type="button" className="ef-btn ef-btn--danger" onClick={onDelete}>
            {t('admin.delete')}
          </button>
        )}
        <div className="ef-actions-right">
          <button type="button" className="ef-btn ef-btn--ghost" onClick={onCancel}>
            {t('admin.cancel')}
          </button>
          <button type="submit" className="ef-btn ef-btn--primary">
            {t('admin.save')}
          </button>
        </div>
      </div>
    </form>
  );
}
