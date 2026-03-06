import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../firebase';
import { SECTIONS } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';

const ResourcesContext = createContext(null);

const emptySectionResources = () => ({ subjects: [] });
const initResources = () => Object.fromEntries(SECTIONS.map((s) => [s, emptySectionResources()]));

export function ResourcesProvider({ children }) {
  const [resources, setResources] = useState(initResources);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.from('resources').select('id, data');
      if (!error && data) {
        const merged = initResources();
        data.forEach((row) => { merged[row.id] = row.data; });
        setResources(merged);
      }
      setLoading(false);
    };
    init();

    const channel = supabase
      .channel('resources-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, (payload) => {
        const row = payload.new;
        if (!row?.id || !row?.data) return;
        setResources((prev) => ({ ...prev, [row.id]: row.data }));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const _updateSection = (section, updater) => {
    setResources((prev) => {
      const updated = updater(prev[section] ?? emptySectionResources());
      setTimeout(async () => {
        const { error } = await supabase.from('resources').upsert({ id: section, data: updated });
        if (error) console.error('Resources upsert error:', error.message);
      }, 0);
      return { ...prev, [section]: updated };
    });
  };

  /* ── Subject CRUD ─────────────────────────────────────────── */
  const addSubject = (section, { name, nameAr, type }) => {
    _updateSection(section, (d) => ({
      ...d,
      subjects: [...d.subjects, { id: uuidv4(), name, nameAr: nameAr || '', type, items: [] }],
    }));
  };

  const editSubject = (section, subjectId, updates) => {
    _updateSection(section, (d) => ({
      ...d,
      subjects: d.subjects.map((s) => (s.id === subjectId ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSubject = (section, subjectId) => {
    _updateSection(section, (d) => ({
      ...d,
      subjects: d.subjects.filter((s) => s.id !== subjectId),
    }));
  };

  /* ── Item CRUD (within a subject) ─────────────────────────── */
  const addItem = (section, subjectId, { title, titleAr, notes, url, addedByName }) => {
    _updateSection(section, (d) => ({
      ...d,
      subjects: d.subjects.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              items: [
                ...s.items,
                { id: uuidv4(), title, titleAr: titleAr || '', notes: notes || '', url, addedByName, createdAt: new Date().toISOString() },
              ],
            }
          : s
      ),
    }));
  };

  const editItem = (section, subjectId, itemId, updates) => {
    _updateSection(section, (d) => ({
      ...d,
      subjects: d.subjects.map((s) =>
        s.id === subjectId
          ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)) }
          : s
      ),
    }));
  };

  const deleteItem = (section, subjectId, itemId) => {
    _updateSection(section, (d) => ({
      ...d,
      subjects: d.subjects.map((s) =>
        s.id === subjectId
          ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
          : s
      ),
    }));
  };

  const getSubjects = (section, type) =>
    (resources[section]?.subjects ?? []).filter((s) => s.type === type);

  return (
    <ResourcesContext.Provider
      value={{ resources, loading, addSubject, editSubject, deleteSubject, addItem, editItem, deleteItem, getSubjects }}
    >
      {children}
    </ResourcesContext.Provider>
  );
}

export const useResources = () => useContext(ResourcesContext);
