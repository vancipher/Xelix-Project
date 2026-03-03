import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../firebase';
import {
  createGroupSchedule, createEvent, GROUPS,
  dayHasImportant, filterEventsForWeek,
} from '../utils/helpers';

const ScheduleContext = createContext(null);

// Migrate localStorage data to Supabase once
const MIGRATED_KEY = 'xelix-sb-migrated-v1';
const OLD_KEY = 'xelix-schedule-v3';

async function migrateIfNeeded() {
  if (localStorage.getItem(MIGRATED_KEY)) return;
  const raw = localStorage.getItem(OLD_KEY);
  if (!raw) { localStorage.setItem(MIGRATED_KEY, '1'); return; }
  try {
    const local = JSON.parse(raw);
    for (const group of GROUPS) {
      if (!local[group]) continue;
      // Only migrate if the row has no events
      const { data } = await supabase.from('schedule').select('data').eq('id', group).single();
      const isEmpty = !data?.data || Object.values(data.data).every(d => !d?.events?.length);
      if (isEmpty) {
        await supabase.from('schedule').upsert({ id: group, data: local[group] });
      }
    }
  } catch { /* ignore */ }
  localStorage.setItem(MIGRATED_KEY, '1');
}

export function ScheduleProvider({ children }) {
  const [schedule, setSchedule] = useState(createGroupSchedule);
  const [loading, setLoading] = useState(true);
  const scheduleRef = useRef(schedule);
  scheduleRef.current = schedule;

  useEffect(() => {
    // Load all groups then subscribe to realtime changes
    const init = async () => {
      await migrateIfNeeded();
      const { data, error } = await supabase.from('schedule').select('id, data');
      if (!error && data) {
        const merged = { ...createGroupSchedule() };
        data.forEach(row => { merged[row.id] = row.data; });
        setSchedule(merged);
      }
      setLoading(false);
    };
    init();

    // Realtime subscription
    const channel = supabase
      .channel('schedule-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule' }, (payload) => {
        const { id, data } = payload.new;
        setSchedule((prev) => ({ ...prev, [id]: data }));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  /* ── Write helper ────────────────────────────────────────────── */
  const _updateGroup = (group, updater) => {
    setSchedule((prev) => {
      const updated = updater(prev[group] ?? createGroupSchedule()[group]);
      const next = { ...prev, [group]: updated };
      supabase.from('schedule').upsert({ id: group, data: updated }).catch(console.error);
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

  /** Raw day data */
  const getDay = (group, dayKey) =>
    schedule[group]?.[dayKey] ?? { events: [] };

  /** Events filtered for a specific week date */
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
