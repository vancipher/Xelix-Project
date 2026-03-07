import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ADMIN_ACCOUNTS } from '../utils/helpers';
import { supabase } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext(null);

const SESSION_KEY = 'xelix-admin';
const OLD_ACCOUNTS_KEY = 'xelix-accounts';
const ACCOUNTS_ROW = 'accounts';

const saveToSupabase = async (accounts) => {
  const { error } = await supabase
    .from('admins')
    .upsert({ id: ACCOUNTS_ROW, data: accounts });
  if (error) console.error('Admins save error:', error.message);
};

// Ensures every account in ADMIN_ACCOUNTS seed always exists.
// DB version wins (preserves any profile changes), but missing seed
// accounts are re-added — so a DB wipe never permanently removes them.
const mergeWithSeed = (existing) => {
  const result = [...existing];
  for (const seed of ADMIN_ACCOUNTS) {
    const alreadyExists = result.find(
      (a) => a.id === seed.id || a.username === seed.username
    );
    if (!alreadyExists) result.push(seed);
  }
  return result;
};

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState(ADMIN_ACCOUNTS);
  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const accountsRef = useRef(accounts);
  accountsRef.current = accounts;

  // Load accounts from Supabase on mount, migrate localStorage if needed
  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase
        .from('admins')
        .select('data')
        .eq('id', ACCOUNTS_ROW)
        .single();

      if (!error && data?.data && Array.isArray(data.data) && data.data.length > 0) {
        // Supabase has accounts — merge with seed so protected admins always exist
        const merged = mergeWithSeed(data.data);
        setAccounts(merged);
        // Write back if any seed accounts were re-added after a partial wipe
        if (merged.length !== data.data.length) {
          await saveToSupabase(merged);
        }
      } else {
        // Supabase empty — migrate from localStorage or use seed
        const raw = localStorage.getItem(OLD_ACCOUNTS_KEY);
        let local = null;
        if (raw) {
          try { local = JSON.parse(raw); } catch { /* ignore */ }
        }
        const toSave = (local && local.length > 0) ? mergeWithSeed(local) : ADMIN_ACCOUNTS;
        setAccounts(toSave);
        await saveToSupabase(toSave);
      }
      setReady(true);
    };
    init();
  }, []);

  const _setAccounts = (next) => {
    setAccounts(next);
    setTimeout(() => saveToSupabase(next), 0);
  };

  /* ── Auth ─────────────────────────────────────────────────────── */
  const login = (username, password) => {
    const found = accountsRef.current.find(
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
    const next = accountsRef.current.map((a) => {
      if (a.id !== admin.id) return a;
      return {
        ...a,
        displayName: displayName ?? a.displayName,
        password:    password    ?? a.password,
      };
    });
    _setAccounts(next);
    const updatedSession = { ...admin, displayName: displayName ?? admin.displayName };
    setAdmin(updatedSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    return true;
  };

  /* ── Admin Management (superadmin only) ─────────────────────── */
  const isSuperAdmin = admin?.role === 'superadmin';
  const canManageUsers = isSuperAdmin || admin?.canManageUsers === true;

  const addAdmin = ({ username, password, displayName, allowedGroups, canManageUsers: cmu }) => {
    if (!isSuperAdmin) return false;
    if (accountsRef.current.find((a) => a.username === username)) return 'duplicate';
    const newAdmin = {
      id: uuidv4(), username, password, displayName, role: 'admin',
      allowedGroups: allowedGroups ?? ['A', 'B', 'C'],
      canManageUsers: cmu ?? false,
    };
    _setAccounts([...accountsRef.current, newAdmin]);
    return true;
  };

  const removeAdmin = (id) => {
    if (!isSuperAdmin) return false;
    if (id === admin.id) return false;
    _setAccounts(accountsRef.current.filter((a) => a.id !== id));
    return true;
  };

  const editAdmin = (id, { displayName, password, username, allowedGroups, canManageUsers: cmu }) => {
    if (!isSuperAdmin) return false;
    const next = accountsRef.current.map((a) => {
      if (a.id !== id) return a;
      return {
        ...a,
        displayName:    displayName   ?? a.displayName,
        password:       password      ?? a.password,
        username:       username      ?? a.username,
        allowedGroups:  allowedGroups ?? a.allowedGroups,
        canManageUsers: cmu           ?? a.canManageUsers ?? false,
      };
    });
    _setAccounts(next);
    return true;
  };

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
        ready,
        login,
        logout,
        isLoggedIn: !!admin,
        isSuperAdmin,
        canManageUsers,
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
