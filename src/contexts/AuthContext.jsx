import { createContext, useContext, useState } from 'react';
import { ADMIN_ACCOUNTS } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext(null);

const ACCOUNTS_KEY = 'xelix-accounts';
const SESSION_KEY  = 'xelix-admin';

// If cached accounts still have old seed accounts, reset to fresh seed
const migrateAccounts = () => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const hasOld = parsed.some((a) =>
        a.username === 'superadmin' ||
        a.username === 'coordinator' ||
        a.username === 'faculty'
      );
      if (hasOld) localStorage.removeItem(ACCOUNTS_KEY);
    }
  } catch { /* ignore */ }
};
migrateAccounts();

// Load persisted accounts or fall back to seed
const loadAccounts = () => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : ADMIN_ACCOUNTS;
  } catch { return ADMIN_ACCOUNTS; }
};

const saveAccounts = (accounts) =>
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState(loadAccounts);
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const _setAccounts = (next) => {
    setAccounts(next);
    saveAccounts(next);
  };

  /* ── Auth ─────────────────────────────────────────────────────── */
  const login = (username, password) => {
    const found = accounts.find(
      (a) => a.username === username && a.password === password
    );
    if (!found) return false;
    const session = {
      id: found.id,
      username: found.username,
      displayName: found.displayName,
      role: found.role || 'admin',
      allowedGroups: found.allowedGroups ?? ['A', 'B', 'C'],
    };
    setAdmin(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem(SESSION_KEY);
  };

  /* ── Profile (self) ───────────────────────────────────────────── */
  const updateProfile = ({ displayName, password }) => {
    if (!admin) return false;
    const next = accounts.map((a) => {
      if (a.id !== admin.id) return a;
      return {
        ...a,
        displayName: displayName ?? a.displayName,
        password:    password    ?? a.password,
      };
    });
    _setAccounts(next);
    // Refresh session displayName
    const updatedSession = {
      ...admin,
      displayName: displayName ?? admin.displayName,
    };
    setAdmin(updatedSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    return true;
  };

  /* ── Admin Management (superadmin only) ─────────────────────── */
  const isSuperAdmin = admin?.role === 'superadmin';

  const addAdmin = ({ username, password, displayName, allowedGroups }) => {
    if (!isSuperAdmin) return false;
    if (accounts.find((a) => a.username === username)) return 'duplicate';
    const newAdmin = {
      id: uuidv4(), username, password, displayName, role: 'admin',
      allowedGroups: allowedGroups ?? ['A', 'B', 'C'],
    };
    _setAccounts([...accounts, newAdmin]);
    return true;
  };

  const removeAdmin = (id) => {
    if (!isSuperAdmin) return false;
    if (id === admin.id) return false;
    _setAccounts(accounts.filter((a) => a.id !== id));
    return true;
  };

  const editAdmin = (id, { displayName, password, username, allowedGroups }) => {
    if (!isSuperAdmin) return false;
    const next = accounts.map((a) => {
      if (a.id !== id) return a;
      return {
        ...a,
        displayName:   displayName   ?? a.displayName,
        password:      password      ?? a.password,
        username:      username      ?? a.username,
        allowedGroups: allowedGroups ?? a.allowedGroups,
      };
    });
    _setAccounts(next);
    return true;
  };

  /** Returns true if the current admin can access a specific group */
  const canAccessGroup = (groupKey) => {
    if (!admin) return false;
    if (admin.role === 'superadmin') return true;
    return (admin.allowedGroups ?? []).includes(groupKey);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        accounts,
        login,
        logout,
        isLoggedIn: !!admin,
        isSuperAdmin,
        updateProfile,
        addAdmin,
        removeAdmin,
        editAdmin,
        canAccessGroup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
