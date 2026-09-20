import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ADMIN_ACCOUNTS } from '../utils/helpers';
import { supabase } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext(null);

const SESSION_KEY = 'xelix-admin';
const ACCOUNTS_ROW = 'accounts';

const isProtectedSuperadmin = (account) =>
  account?.role === 'superadmin' || account?.id === 'admin1';

const canPersistAccounts = (accounts) =>
  Array.isArray(accounts) &&
  accounts.length > 0 &&
  accounts.some(isProtectedSuperadmin);

const saveToSupabase = async (accounts) => {
  if (!canPersistAccounts(accounts)) {
    console.error('Refusing to save admin list without a superadmin');
    return false;
  }
  const { error } = await supabase
    .from('admins')
    .upsert({ id: ACCOUNTS_ROW, data: accounts });
  if (error) {
    console.error('Admins save error:', error.message);
    return false;
  }
  return true;
};

async function fetchAccountsRow() {
  const { data, error } = await supabase
    .from('admins')
    .select('data')
    .eq('id', ACCOUNTS_ROW)
    .maybeSingle();
  if (error) return { ok: false, list: null, error };
  const list = Array.isArray(data?.data) ? data.data : [];
  return { ok: true, list };
}

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

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const { ok, list, error } = await fetchAccountsRow();
      if (cancelled) return;

      if (!ok) {
        // Keep in-memory fallback for login — never overwrite the DB on a failed read
        console.error('Admins load error:', error?.message);
        setReady(true);
        return;
      }

      if (list.length > 0) {
        setAccounts(list);
        setReady(true);
        return;
      }

      // Truly empty row: bootstrap superadmin only so login still works
      setAccounts(ADMIN_ACCOUNTS);
      await saveToSupabase(ADMIN_ACCOUNTS);
      if (!cancelled) setReady(true);
    };

    init();

    const channel = supabase
      .channel('admins-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admins', filter: `id=eq.${ACCOUNTS_ROW}` },
        (payload) => {
          const list = payload.new?.data;
          if (!Array.isArray(list) || list.length === 0) return;
          setAccounts(list);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const mutateAccounts = async (mutator) => {
    const { ok, list } = await fetchAccountsRow();
    const current = ok && list.length > 0 ? list : accountsRef.current;
    const next = mutator(current);
    if (next === 'duplicate') return 'duplicate';
    if (!canPersistAccounts(next)) return false;
    setAccounts(next);
    const saved = await saveToSupabase(next);
    return saved;
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
      canManageUsers: found.canManageUsers ?? false,
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
  const updateProfile = async ({ displayName, password }) => {
    if (!admin) return false;
    const saved = await mutateAccounts((current) =>
      current.map((a) => {
        if (a.id !== admin.id) return a;
        return {
          ...a,
          displayName: displayName ?? a.displayName,
          password:    password    ?? a.password,
        };
      })
    );
    if (!saved) return false;
    const updatedSession = { ...admin, displayName: displayName ?? admin.displayName };
    setAdmin(updatedSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    return true;
  };

  /* ── Admin Management (superadmin only) ─────────────────────── */
  const isSuperAdmin = admin?.role === 'superadmin';
  const canManageUsers = isSuperAdmin || admin?.canManageUsers === true;

  const addAdmin = async ({ username, password, displayName, allowedGroups, canManageUsers: cmu }) => {
    if (!isSuperAdmin) return false;
    return mutateAccounts((current) => {
      if (current.find((a) => a.username === username)) return 'duplicate';
      return [
        ...current,
        {
          id: uuidv4(),
          username,
          password,
          displayName,
          role: 'admin',
          allowedGroups: allowedGroups ?? ['A', 'B', 'C'],
          canManageUsers: cmu ?? false,
        },
      ];
    });
  };

  const removeAdmin = async (id) => {
    if (!isSuperAdmin) return false;
    if (id === admin.id) return false;
    return mutateAccounts((current) => {
      const target = current.find((a) => a.id === id);
      if (!target || isProtectedSuperadmin(target)) return current;
      return current.filter((a) => a.id !== id);
    });
  };

  const editAdmin = async (id, { displayName, password, username, allowedGroups, canManageUsers: cmu }) => {
    if (!isSuperAdmin) return false;
    return mutateAccounts((current) =>
      current.map((a) => {
        if (a.id !== id) return a;
        const nextUsername = isProtectedSuperadmin(a) ? a.username : (username ?? a.username);
        return {
          ...a,
          displayName:    displayName   ?? a.displayName,
          password:       password      ?? a.password,
          username:       nextUsername,
          allowedGroups:  allowedGroups ?? a.allowedGroups,
          canManageUsers: cmu           ?? a.canManageUsers ?? false,
        };
      })
    );
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
