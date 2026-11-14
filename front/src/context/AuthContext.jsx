import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Restaura a sessao a partir do token salvo.
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api.users
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('av:unauthorized', onUnauthorized);
    return () => window.removeEventListener('av:unauthorized', onUnauthorized);
  }, []);

  const login = async (credentials) => {
    const { token, user: logged } = await api.auth.login(credentials);
    tokenStore.set(token);
    setUser(logged);
    return logged;
  };

  const signup = async (data) => {
    const { token, user: created } = await api.auth.signup(data);
    tokenStore.set(token);
    setUser(created);
    return created;
  };

  const deleteAccount = async () => {
    await api.users.remove();
    logout();
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    deleteAccount,
    setUser,
    isProfessional: user?.type === 'professional',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
