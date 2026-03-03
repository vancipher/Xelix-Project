import { v4 as uuidv4 } from 'uuid';

export const GROUPS = ['A', 'B', 'C'];

export const DAY_KEYS = [
  'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
];

const JS_DAY_TO_KEY = {
  0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
  4: 'thursday', 5: 'friday', 6: 'saturday',
};

export const getTodayDayKey = () => JS_DAY_TO_KEY[new Date().getDay()];

/** Returns { dayKey: Date } for a Sat→Fri academic week.
 *  offset = 0 → current week, -1 → previous week, +1 → next week, etc.
 */
export const getWeekDates = (offset = 0) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const jsDay = today.getDay();
  const daysFromSat = (jsDay - 6 + 7) % 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() - daysFromSat + offset * 7);
  const dates = {};
  DAY_KEYS.forEach((key, i) => {
    const d = new Date(saturday);
    d.setDate(saturday.getDate() + i);
    dates[key] = d;
  });
  return dates;
};

/** Always returns Gregorian date.
 *  In Arabic mode: Arabic-script digits with Gregorian calendar.
 *  In English mode: day + short month in English.
 */
export const formatDate = (date, lang = 'en') => {
  if (!date) return '';
  if (lang === 'ar') {
    // ar-u-ca-gregory forces Gregorian calendar with Arabic locale formatting
    return date.toLocaleDateString('ar-EG-u-ca-gregory', { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const EVENT_TYPES = [
  'lecture', 'quiz', 'assignment', 'exam', 'report', 'lab', 'other',
];

/* Recurring by default: lecture & lab are permanent; others are one-time */
export const EVENT_TYPE_RECURRING_DEFAULT = {
  lecture: true, lab: true,
  quiz: false, assignment: false, exam: false, report: false, other: false,
};

export const EVENT_TYPE_COLORS = {
  lecture:    'var(--evt-lecture)',
  quiz:       'var(--evt-quiz)',
  assignment: 'var(--evt-assignment)',
  exam:       'var(--evt-exam)',
  report:     'var(--evt-report)',
  lab:        'var(--evt-lab)',
  other:      'var(--evt-other)',
};

export const EVENT_TYPE_BG = {
  lecture:    'rgba(59,130,246,0.12)',
  quiz:       'rgba(245,158,11,0.12)',
  assignment: 'rgba(139,92,246,0.12)',
  exam:       'rgba(239,68,68,0.12)',
  report:     'rgba(6,182,212,0.12)',
  lab:        'rgba(16,185,129,0.12)',
  other:      'rgba(107,114,128,0.12)',
};

export const createEmptySchedule = () => {
  const schedule = {};
  for (const day of DAY_KEYS) {
    schedule[day] = { events: [] };
  }
  return schedule;
};

export const createGroupSchedule = () => {
  const gs = {};
  for (const g of GROUPS) gs[g] = createEmptySchedule();
  return gs;
};

/**
 * isRecurring: true  → shows every week (permanent)
 * isRecurring: false → shows only when event.date matches that week day's date
 */
export const createEvent = ({
  title = '', titleAr = '', type = 'lecture', time = '', room = '',
  instructor = '', isImportant = false, addedByName = '',
  isRecurring = null, date = null, notes = '',
}) => ({
  id: uuidv4(),
  title, titleAr, type, time, room, instructor, isImportant,
  isRecurring: isRecurring ?? (EVENT_TYPE_RECURRING_DEFAULT[type] ?? true),
  date,
  addedByName,
  notes,
  createdAt: new Date().toISOString(),
});

/** Filter events for display: recurring always shown; one-time only on matching date. */
export const filterEventsForWeek = (events = [], weekDate) => {
  if (!weekDate) return events;
  const target = weekDate instanceof Date ? weekDate.toISOString().slice(0, 10) : String(weekDate).slice(0, 10);
  return events.filter((e) => {
    if (e.isRecurring !== false) return true;
    if (!e.date) return true;
    return e.date.slice(0, 10) === target;
  });
};

export const dayHasImportant = (events = []) => events.some((e) => e.isImportant);

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* ── Default seed data — empty schedules ───────────────────────── */
export const SEED_SCHEDULE = createGroupSchedule();

export const ADMIN_ACCOUNTS = [
  { id: 'admin1', username: 'abdullah', password: 'admin123', displayName: 'Abdullah', role: 'superadmin', allowedGroups: ['A', 'B', 'C'] },
];
