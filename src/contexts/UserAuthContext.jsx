import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../firebase';

const UserAuthContext = createContext(null);

const USER_SESSION_KEY = 'xelix-user-session';

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
  const register = async (username, email, password) => {
    setLoading(true);
    setError('');
    try {
      // Check if user already exists
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

      // Create user
      const { data, error: err } = await supabase
        .from('users')
        .insert({
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          password: password, // In production, hash this!
          displayName: username,
          role: 'user',
          banned: false,
          createdAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (err) throw err;

      const session = {
        id: data.id,
        username: data.username,
        displayName: data.displayName,
        email: data.email,
        role: data.role,
      };

      setUser(session);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
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
      if (data.banned) throw new Error('Account banned');

      const session = {
        id: data.id,
        username: data.username,
        displayName: data.displayName,
        email: data.email,
        role: data.role,
      };

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
      const updateData = { displayName };
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
