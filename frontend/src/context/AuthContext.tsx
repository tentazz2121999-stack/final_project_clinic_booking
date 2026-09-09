import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import authService from "../api/authService";
import { LoginPayload, RegisterPayload, User } from "../types/auth";

interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (nextUser: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  function persistSession({ user: sessionUser, accessToken, refreshToken }: Session) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(sessionUser));
    setUser(sessionUser);
  }

  async function login(email: string, password: string) {
    const { data } = await authService.login({ email, password } as LoginPayload);
    persistSession(data.data);
    return data.data.user;
  }

  async function register(payload: RegisterPayload) {
    const { data } = await authService.register(payload);
    persistSession(data.data);
    return data.data.user;
  }

  async function logout() {
    try {
      await authService.logout();
    } catch (err) {
      // ignore
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  }

  function updateUser(nextUser: User) {
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  }

  const value = useMemo(
    () => ({ user, login, register, logout, updateUser, isAuthenticated: !!user }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng trong AuthProvider");
  return ctx;
}
