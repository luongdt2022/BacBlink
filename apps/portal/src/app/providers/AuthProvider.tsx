import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { getMe, type MeUser } from '@/services/api/auth';
import { AUTH_UNAUTHORIZED_EVENT } from '@/services/api/client';
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from '@/shared/utils/authCookie';

interface AuthContextValue {
  isAuthenticated: boolean;
  user: MeUser | null;
  login: (token: string) => void;
  logout: () => void;
  setUser: (user: MeUser | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getAccessToken);
  const [user, setUser] = useState<MeUser | null>(null);

  const isAuthenticated = !!token;

  const login = useCallback((newToken: string) => {
    setAccessToken(newToken);
    setToken(newToken);
    getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const logout = useCallback(() => {
    removeAccessToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) return;
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      removeAccessToken();
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const stored = getAccessToken();
    if (!stored) return;
    setToken(stored);
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * B-12: nghe 401 từ bộ chặn HTTP.
   *
   * Trước đây không có nhánh nào cho 401, nên khi token hết hạn (24 giờ) người dùng nhận một thông điệp lỗi lạ
   * ở giữa màn hình họ đang làm, cookie vẫn còn, và lần tải trang sau ứng dụng lại tưởng đã đăng nhập — lặp
   * đúng vòng đó, không có gì nói rằng cần đăng nhập lại.
   *
   * Bộ chặn đã xoá token; ở đây chỉ dọn trạng thái phiên. `RequireAuth` sẽ đưa về trang đăng nhập, và đưa kèm
   * vị trí hiện tại để người dùng quay lại đúng chỗ đang dở.
   */
  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    document.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => document.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (getAccessToken()) refreshUser();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated, user, login, logout, setUser, refreshUser }),
    [isAuthenticated, user, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
