import { createContext, useContext, useState } from 'react';
import { SECTIONS, SECTION_GROUPS } from '../utils/helpers';

const GroupContext = createContext(null);

const SECTION_KEY = 'xelix-active-section';
const GROUP_KEY   = 'xelix-active-group';

const allGroups = () => Object.values(SECTION_GROUPS).flat();

export function GroupProvider({ children }) {
  const [activeSection, setActiveSectionState] = useState(() => {
    try {
      const raw = localStorage.getItem(SECTION_KEY);
      return SECTIONS.includes(raw) ? raw : 'evening';
    } catch { return 'evening'; }
  });

  const [activeGroup, setActiveGroupState] = useState(() => {
    try {
      const raw = localStorage.getItem(GROUP_KEY);
      return allGroups().includes(raw) ? raw : SECTION_GROUPS.evening[0];
    } catch { return SECTION_GROUPS.evening[0]; }
  });

  const setActiveSection = (s) => {
    if (!SECTIONS.includes(s)) return;
    setActiveSectionState(s);
    localStorage.setItem(SECTION_KEY, s);
    const first = SECTION_GROUPS[s][0];
    setActiveGroupState(first);
    localStorage.setItem(GROUP_KEY, first);
  };

  const setActiveGroup = (g) => {
    if (!allGroups().includes(g)) return;
    setActiveGroupState(g);
    localStorage.setItem(GROUP_KEY, g);
  };

  return (
    <GroupContext.Provider value={{
      activeSection, setActiveSection,
      activeGroup, setActiveGroup,
      sectionGroups: SECTION_GROUPS[activeSection],
    }}>
      {children}
    </GroupContext.Provider>
  );
}

export const useGroup = () => useContext(GroupContext);
