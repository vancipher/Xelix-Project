import { createContext, useContext, useState } from 'react';
import { GROUPS } from '../utils/helpers';

const GroupContext = createContext(null);

const STORAGE_KEY = 'xelix-active-group';

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw && GROUPS.includes(raw) ? raw : GROUPS[0];
  } catch { return GROUPS[0]; }
};

export function GroupProvider({ children }) {
  const [activeGroup, setActiveGroupState] = useState(load);

  const setActiveGroup = (g) => {
    if (!GROUPS.includes(g)) return;
    setActiveGroupState(g);
    localStorage.setItem(STORAGE_KEY, g);
  };

  return (
    <GroupContext.Provider value={{ activeGroup, setActiveGroup, groups: GROUPS }}>
      {children}
    </GroupContext.Provider>
  );
}

export const useGroup = () => useContext(GroupContext);
