import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../firebase';

const UserAuthContext = createContext(null);

const USER_SESSION_KEY = 'xelix-user-session';
const PENDING_BACKUP_KEY = 'xelix-pending-users';

// localStorage backup helpers — protect pending registrations from DB wipes
const getPendingBackup = () => {
  try { return JSON.parse(localStorage.getItem(PENDING_BACKUP_KEY) || '[]'); }
  catch { return []; }
};
const setPendingBackup = (list) => {
  localStorage.setItem(PENDING_BACKUP_KEY, JSON.stringify(list));
};

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Register new user
  const register = async (fullName, username, email, password) => {
    setLoading(true);
    setError('');
    try {
      // Check if username already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())
        .single();
      
      if (existing) {
        setError('Username already taken');
        setLoading(false);
        return false;
      }

      // Create user with approved=false (pending admin approval)
      const { data, error: err } = await supabase
        .from('users')
        .insert({
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          full_name: fullName,
          display_name: fullName,
          displayname: fullName,
          password: password,
          role: 'user',
          banned: false,
          approved: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (err) throw err;

      // Back up to localStorage — protects this pending request if DB is wiped
      const backup = getPendingBackup();
      if (!backup.find((u) => u.username === data.username)) {
        setPendingBackup([...backup, data]);
      }

      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
      return false;
    }
  };

  // Login user
  const login = async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.toLowerCase())
        .eq('password', password)
        .single();

      if (err || !data) throw new Error('Invalid credentials');
      if (data.banned) throw new Error('Your account has been banned');
      if (!data.approved) throw new Error('Your account is pending admin approval. You will be notified once approved.');

      const session = {
        id: data.id,
        username: data.username,
        displayName: data.display_name,
        email: data.email,
        role: data.role,
      };

      // User is approved & logged in — remove from pending backup
      setPendingBackup(getPendingBackup().filter((u) => u.username !== data.username));

      setUser(session);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
    setError('');
  };

  // Update profile
  const updateProfile = async (displayName, password) => {
    if (!user) return false;
    setLoading(true);
    setError('');
    try {
      const updateData = { display_name: displayName };
      if (password) updateData.password = password;

      const { error: err } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (err) throw err;

      const updated = { ...user, displayName };
      setUser(updated);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Update failed');
      setLoading(false);
      return false;
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        register,
        login,
        logout,
        updateProfile,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be inside UserAuthProvider');
  return ctx;
}
