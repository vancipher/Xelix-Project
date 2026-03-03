import { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  createGroupSchedule, createEvent, GROUPS,
  dayHasImportant, filterEventsForWeek,
} from '../utils/helpers';

const ScheduleContext = createContext(null);

// Migrate any existing localStorage data to Firestore once
const MIGRATED_KEY = 'xelix-migrated-v1';
const OLD_KEY = 'xelix-schedule-v3';

async function migrateIfNeeded() {
  if (localStorage.getItem(MIGRATED_KEY)) return;
  const raw = localStorage.getItem(OLD_KEY);
  if (!raw) { localStorage.setItem(MIGRATED_KEY, '1'); return; }
  try {
    const local = JSON.parse(raw);
    for (const group of GROUPS) {
      if (!local[group]) continue;
      const ref = doc(db, 'schedule', group);
      const snap = await getDoc(ref);
      // Only migrate if Firestore doc is empty/missing
      if (!snap.exists() || Object.values(snap.data() ?? {}).every(d => !d?.events?.length)) {
        await setDoc(ref, local[group]);
      }
    }
  } catch { /* ignore migration errors */ }
  localStorage.setItem(MIGRATED_KEY, '1');
}

export function ScheduleProvider({ children }) {
  const [schedule, setSchedule] = useState(createGroupSchedule);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    migrateIfNeeded();

    const unsubs = GROUPS.map((group) => {
      const ref = doc(db, 'schedule', group);
      return onSnapshot(ref, (snap) => {
        const data = snap.exists() ? snap.data() : createGroupSchedule()[group];
        setSchedule((prev) => ({ ...prev, [group]: data }));
        setLoading(false);
      });
    });

    return () => unsubs.forEach((u) => u());
  }, []);

  /* ── Write helpers ───────────────────────────────────────────── */
  const _updateGroup = async (group, updater) => {
    setSchedule((prev) => {
      const next = { ...prev, [group]: updater(prev[group] ?? createGroupSchedule()[group]) };
      // Write to Firestore
      setDoc(doc(db, 'schedule', group), next[group]).catch(console.error);
      return next;
    });
  };

  /* ── CRUD ────────────────────────────────────────────────────── */
  const addEvent = (group, dayKey, eventData, adminName) => {
    _updateGroup(group, (groupSched) => ({
      ...groupSched,
      [dayKey]: {
        ...groupSched[dayKey],
        events: [
          ...(groupSched[dayKey]?.events ?? []),
          createEvent({ ...eventData, addedByName: adminName }),
        ],
      },
    }));
  };

  const editEvent = (group, dayKey, eventId, eventData, adminName) => {
    _updateGroup(group, (groupSched) => ({
      ...groupSched,
      [dayKey]: {
        ...groupSched[dayKey],
        events: (groupSched[dayKey]?.events ?? []).map((e) =>
          e.id === eventId
            ? { ...e, ...eventData, addedByName: adminName, updatedAt: new Date().toISOString() }
            : e
        ),
      },
    }));
  };

  const deleteEvent = (group, dayKey, eventId) => {
    _updateGroup(group, (groupSched) => ({
      ...groupSched,
      [dayKey]: {
        ...groupSched[dayKey],
        events: (groupSched[dayKey]?.events ?? []).filter((e) => e.id !== eventId),
      },
    }));
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
      value={{ schedule, loading, addEvent, editEvent, deleteEvent, getDay, getDayFiltered, isDayImportant }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export const useSchedule = () => useContext(ScheduleContext);
