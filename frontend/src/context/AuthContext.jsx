import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { loginUser, registerUser, getProfile, updateProfile as updateProfileApi } from "../api/auth";
import { setToken, clearToken, getToken } from "../api/client";

const AuthContext = createContext(null);
const USER_KEY = "ob_current_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const persistUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  };

  // Re-validate session against backend on load (in case token expired / user blocked)
  useEffect(() => {
    let cancelled = false;
    async function verify() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const res = await getProfile();
        if (!cancelled) persistUser(res.data);
      } catch {
        if (!cancelled) {
          clearToken();
          persistUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    verify();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    const { token, ...userData } = res.data;
    setToken(token);
    persistUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await registerUser(payload);
    const { token, ...userData } = res.data;
    setToken(token);
    persistUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    persistUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const res = await updateProfileApi(payload);
    persistUser({ ...user, ...res.data });
    return res.data;
  }, [user]);

  const dashboardPath = user?.role === "admin" ? "/admin" : user?.role === "seller" ? "/seller" : "/dashboard";

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isSeller: user?.role === "seller" || user?.role === "admin",
    isBuyer: user?.role === "buyer",
    dashboardPath,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
