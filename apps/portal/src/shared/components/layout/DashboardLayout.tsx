import { useEffect, useState, type ReactNode } from 'react';
import { Sidebar } from '@/shared/components/navigation/Sidebar';
import { TopHeader } from './TopHeader';

interface DashboardLayoutProps {
  children: ReactNode;
  activeMenuItem?: string;
  onNavigate?: (itemId: string) => void;
  /** When true, only render children (no Sidebar). Use when page is already inside RootLayout which provides the sidebar. */
  contentOnly?: boolean;
}

export function DashboardLayout({ children, activeMenuItem, onNavigate, contentOnly }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('dmst-user-sidebar-collapsed');
    if (stored) {
      setIsSidebarCollapsed(stored === 'true');
    }
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem('dmst-user-sidebar-collapsed', String(next));
      return next;
    });
  };

  const handleMobileDrawerToggle = () => {
    setIsMobileDrawerOpen((prev) => !prev);
  };

  if (contentOnly) {
    return <div className="flex-1 overflow-x-hidden overflow-y-auto">{children}</div>;
  }
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        activeItem={activeMenuItem}
        onNavigate={onNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
        isMobileDrawerOpen={isMobileDrawerOpen}
        onMobileDrawerChange={setIsMobileDrawerOpen}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader 
          isSidebarCollapsed={isSidebarCollapsed} 
          onToggleSidebar={handleMobileDrawerToggle} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto pt-[var(--header-height)]">
          <div className="flex-1 pb-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
