import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { useApp } from '@/app/providers/AppProvider';
import {
  User,
  Key,
  LogOut,
  ChevronDown,
  Bell,
  Menu,
  Settings,
} from 'lucide-react';
import { useNotificationPolling } from '@/features/notifications/hooks/useNotificationPolling';
import { NotificationPanel } from '@/features/notifications/components/NotificationPanel';
import { cn } from '@/shared/components/ui/utils';

interface TopHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export function TopHeader({ onToggleSidebar, isSidebarCollapsed }: TopHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { openChangePasswordModal } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { unreadCount: polledCount } = useNotificationPolling();
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      const inBell = bellButtonRef.current?.contains(e.target as Node);
      const inPanel = panelRef.current?.contains(e.target as Node);
      if (!inBell && !inPanel) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setBadgeCount(polledCount);
  }, [polledCount]);

  const userName = user?.name ?? user?.email ?? 'Người dùng';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const userMenuItems = [
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
    { id: 'change-password', label: 'Đổi mật khẩu', icon: Key },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
    { id: 'logout', label: 'Đăng xuất', icon: LogOut },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 z-40 flex items-center justify-between border-b border-border/50 bg-card/70 px-6 backdrop-blur-xl transition-all duration-200",
        isSidebarCollapsed ? "left-20" : "left-76",
        "max-lg:left-0 shadow-[0_1px_2px_0_rgb(0,0,0,0.03)]"
      )}
      style={{ height: 'var(--header-height)' }}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notifications */}
        <div className="relative" ref={bellButtonRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Thông báo"
            className={cn(
              "flex size-7 items-center justify-center rounded-lg transition-all",
              showNotifications
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <div className="relative">
              <Bell className="size-4" />
              {badgeCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-destructive-foreground ring-1 ring-card">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </div>
          </button>

          {showNotifications && (
            <NotificationPanel
              panelRef={panelRef}
              onClose={() => setShowNotifications(false)}
              onUnreadChange={(delta) => setBadgeCount((c) => Math.max(0, c + delta))}
            />
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="group flex items-center gap-2 rounded-lg px-1.5 py-1 transition-all hover:bg-muted"
          >
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
              {userInitials}
            </div>
            <div className="hidden min-w-0 text-left sm:block">
              <p className="truncate text-xs font-semibold text-foreground">{userName}</p>
            </div>
            <ChevronDown className={cn("size-3 text-muted-foreground/50 transition-transform group-hover:text-muted-foreground", showUserMenu && "rotate-180")} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-lg shadow-black/5">
              {userMenuItems.map((item) => {
                const Icon = item.icon;
                const isDanger = item.id === 'logout';

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setShowUserMenu(false);
                      if (item.id === 'logout') {
                        logout();
                        navigate('/login', { replace: true });
                      }
                      if (item.id === 'change-password') {
                        openChangePasswordModal();
                      }
                      if (item.id === 'settings') {
                        navigate('/settings');
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isDanger 
                        ? "text-destructive hover:bg-destructive/5" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

