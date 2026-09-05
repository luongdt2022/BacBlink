import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { AuthUser, LoginResult } from "@/types/auth";
import * as authService from "@/services/authService";
import { AUTH_UNAUTHORIZED_EVENT } from "@/lib/auth/events";

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const loadCurrentUser = useCallback(async (): Promise<boolean> => {
    const user = await authService.checkAuth();
    if (user) {
      setUser(user);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    loadCurrentUser().finally(() => setIsLoading(false));
  }, [loadCurrentUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      authService.clearToken();
      setUser(null);
    };

    document.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      document.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    if (!email.trim() || !password.trim()) {
      return { success: false, error: "Vui lòng nhập email và mật khẩu." };
    }

    try {
      const response = await authService.login({ email, password });
      const token = response.accessToken;

      if (!token) {
        return { success: false, error: "Không nhận được access token." };
      }

      authService.storeToken(token);
      const user = await authService.fetchCurrentUser();

      if (user) {
        setUser(user);
        return { success: true };
      }

      authService.clearToken();
      return { success: false, error: "Không thể lấy thông tin tài khoản." };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi kết nối. Kiểm tra backend.";
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    authService.clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
