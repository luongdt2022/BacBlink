import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MENU_ID_TO_PATH, pathToActiveItem } from '@/app/config/routes';
import {
  type LucideIcon,
  ChevronDown,
  Lightbulb,
  Send,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Handshake,
  BookOpen,
  Store,
} from 'lucide-react';
import { cn } from '@/shared/components/ui/utils';

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (itemId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileDrawerOpen?: boolean;
  onMobileDrawerChange?: (open: boolean) => void;
}

interface SidebarMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  submenu?: SidebarMenuItem[];
}

export function Sidebar({
  activeItem: activeItemProp,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
  isMobileDrawerOpen = false,
  onMobileDrawerChange,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = activeItemProp ?? pathToActiveItem(location.pathname);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const syncViewport = () => {
      setIsCompactViewport(mediaQuery.matches);
      if (!mediaQuery.matches) {
        onMobileDrawerChange?.(false);
      }
    };

    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);
    return () => mediaQuery.removeEventListener('change', syncViewport);
  }, [onMobileDrawerChange]);

  useEffect(() => {
    onMobileDrawerChange?.(false);
  }, [location.pathname, onMobileDrawerChange]);

  const menuItems = useMemo<SidebarMenuItem[]>(
    () => [
      { id: 'ips', label: 'Quản lý Cung', icon: Send },
      { id: 'challenges', label: 'Quản lý Cầu', icon: Lightbulb },
      { id: 'collaboration-requests', label: 'Yêu cầu hợp tác', icon: Handshake },
      { id: 'stories', label: 'Câu chuyện', icon: BookOpen },
      { id: 'marketplace', label: 'Sàn giao dịch', icon: Store },
    ],
    [],
  );

  useEffect(() => {
    const activeParentMenu = menuItems.find(
      (item) => item.submenu?.some((sub) => sub.id === activeItem),
    );
    if (activeParentMenu && expandedMenu !== activeParentMenu.id) {
      setExpandedMenu(activeParentMenu.id);
    }
  }, [activeItem, expandedMenu, menuItems]);

  const handleMenuClick = (itemId: string, hasSubmenu?: boolean) => {
    if (hasSubmenu) {
      setExpandedMenu(expandedMenu === itemId ? null : itemId);
    } else {
      const path = MENU_ID_TO_PATH[itemId];
      if (path) {
        navigate(path);
        onNavigate?.(itemId);
      }
      const isSubmenuItem = menuItems.some((item) =>
        item.submenu?.some((sub) => sub.id === itemId),
      );
      if (!isSubmenuItem) {
        setExpandedMenu(null);
      }
      if (isCompactViewport) {
        onMobileDrawerChange?.(false);
      }
    }
  };

  const handleSubmenuClick = (itemId: string) => {
    const path = MENU_ID_TO_PATH[itemId];
    if (path) {
      navigate(path);
      onNavigate?.(itemId);
    }
    if (isCompactViewport) {
      onMobileDrawerChange?.(false);
    }
  };

  const renderSidebar = (mode: 'desktop' | 'drawer') => {
    const collapsed = mode === 'desktop' ? isCollapsed : false;

    return (
      <div
        className={cn(
          'shrink-0 flex-col',
          mode === 'desktop' &&
            `sticky top-0 hidden h-svh lg:flex ${collapsed ? 'w-20' : 'w-76'}`,
          mode === 'drawer' &&
            `fixed inset-y-0 left-0 z-[80] flex h-dvh w-[min(17rem,88vw)] transform transition-transform duration-200 ease-out lg:hidden ${
              isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
            }`,
        )}
      >
        <div className="flex h-full flex-col overflow-hidden border-r border-border bg-card">
          <div className={cn('border-b border-border/40', collapsed ? 'px-3 py-4' : 'px-5 py-4')}>
            {collapsed ? (
              /* Collapsed: chỉ icon toggle */
              <div className="flex justify-center">
                {onToggleCollapse && (
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    aria-label="Mở rộng sidebar"
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <PanelLeftOpen className="size-4" />
                  </button>
                )}
              </div>
            ) : (
              /* Expanded: logo + text + toggle */
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src="/logo/NACENTECH_Main-Logo-G.png"
                    alt="Nacentech"
                    className="h-12 w-12 shrink-0 object-contain"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold tracking-tight text-foreground">
                      Nacentech
                    </p>
                    <p className="truncate text-xs text-muted-foreground/70">
                      Nền tảng đổi mới sáng tạo
                    </p>
                  </div>
                </div>

                {mode === 'drawer' ? (
                  <button
                    type="button"
                    onClick={() => onMobileDrawerChange?.(false)}
                    aria-label="Đóng menu"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                ) : (
                  onToggleCollapse && (
                    <button
                      type="button"
                      onClick={onToggleCollapse}
                      aria-label="Thu gọn sidebar"
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <PanelLeftClose className="size-4" />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <nav className={cn('flex-1', collapsed ? 'px-2 py-4' : 'px-3 py-5')}>
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeItem;
                const isExpanded = expandedMenu === item.id;
                const hasSubmenu = !collapsed && 'submenu' in item && item.submenu;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleMenuClick(item.id, !!hasSubmenu)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex w-full items-center text-left transition-all rounded-xl',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5',
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-lg',
                          isActive ? 'bg-primary-foreground/20 text-white' : 'text-muted-foreground/70',
                        )}
                      >
                        <Icon className="size-4.5" />
                      </div>
                      {!collapsed && <span className="flex-1 text-sm font-semibold">{item.label}</span>}
                      {hasSubmenu && (
                        <ChevronDown
                          className={cn('size-4 transition-transform', isExpanded ? 'rotate-180' : '')}
                        />
                      )}
                    </button>

                    {hasSubmenu && isExpanded && (
                      <ul className="mt-2 space-y-1.5 pl-3">
                        {item.submenu?.map((subitem) => {
                          const SubIcon = subitem.icon;
                          const isSubActive = subitem.id === activeItem;

                          return (
                            <li key={subitem.id}>
                              <button
                                onClick={() => handleSubmenuClick(subitem.id)}
                                className={cn(
                                  'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
                                  isSubActive
                                    ? 'border-primary/10 bg-primary/[0.07] font-semibold text-primary'
                                    : 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800',
                                )}
                              >
                                <SubIcon className="size-4" />
                                <span className="text-sm">{subitem.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    );
  };

  return (
    <>
      {isCompactViewport && isMobileDrawerOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[70] bg-slate-900/35 lg:hidden"
          aria-label="Đóng menu điều hướng"
          onClick={() => onMobileDrawerChange?.(false)}
        />
      )}
      {renderSidebar(isCompactViewport ? 'drawer' : 'desktop')}
    </>
  );
}
