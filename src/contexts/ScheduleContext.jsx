import { createContext, useContext, useState } from 'react';
import {
  createGroupSchedule, createEvent,
  dayHasImportant, filterEventsForWeek,
} from '../utils/helpers';

const ScheduleContext = createContext(null);

const STORAGE_KEY = 'xelix-schedule-v3';

// Clear old seed data from previous versions
try {
  localStorage.removeItem('xelix-schedule-v2');
} catch { /* ignore */ }

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through */ }
  return createGroupSchedule();
};

const persist = (schedule) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));

export function ScheduleProvider({ children }) {
  const [schedule, setSchedule] = useState(load);

  const _update = (updater) => {
    setSchedule((prev) => {
      const next = updater(prev);
      persist(next);
      return next;
    });
  };

  /* ── CRUD ────────────────────────────────────────────────────── */
  const addEvent = (group, dayKey, eventData, adminName) => {
    _update((prev) => {
      const groupSched = prev[group] ?? createGroupSchedule()[group];
      return {
        ...prev,
        [group]: {
          ...groupSched,
          [dayKey]: {
            ...groupSched[dayKey],
            events: [
              ...(groupSched[dayKey]?.events ?? []),
              createEvent({ ...eventData, addedByName: adminName }),
            ],
          },
        },
      };
    });
  };

  const editEvent = (group, dayKey, eventId, eventData, adminName) => {
    _update((prev) => {
      const groupSched = prev[group] ?? {};
      return {
        ...prev,
        [group]: {
          ...groupSched,
          [dayKey]: {
            ...groupSched[dayKey],
            events: (groupSched[dayKey]?.events ?? []).map((e) =>
              e.id === eventId
                ? { ...e, ...eventData, addedByName: adminName, updatedAt: new Date().toISOString() }
                : e
            ),
          },
        },
      };
    });
  };

  const deleteEvent = (group, dayKey, eventId) => {
    _update((prev) => {
      const groupSched = prev[group] ?? {};
      return {
        ...prev,
        [group]: {
          ...groupSched,
          [dayKey]: {
            ...groupSched[dayKey],
            events: (groupSched[dayKey]?.events ?? []).filter((e) => e.id !== eventId),
          },
        },
      };
    });
  };

  /** Raw day data (all events, no week filtering) */
  const getDay = (group, dayKey) =>
    schedule[group]?.[dayKey] ?? { events: [] };

  /** Events visible for a given week date (filters one-time events by date) */
  const getDayFiltered = (group, dayKey, weekDate) => {
    const dayData = schedule[group]?.[dayKey] ?? { events: [] };
    return {
      ...dayData,
      events: filterEventsForWeek(dayData.events, weekDate),
    };
  };

  const isDayImportant = (group, dayKey, weekDate) => {
    const filtered = getDayFiltered(group, dayKey, weekDate);
    return dayHasImportant(filtered.events);
  };

  return (
    <ScheduleContext.Provider
      value={{ schedule, addEvent, editEvent, deleteEvent, getDay, getDayFiltered, isDayImportant }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export const useSchedule = () => useContext(ScheduleContext);
