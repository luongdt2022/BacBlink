import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/shared/components/navigation/Sidebar';
import { TopHeader } from '@/shared/components/layout/TopHeader';
import { pathToActiveItem } from '@/app/config/routes';

export function RootLayout() {
  const location = useLocation();
  const activeItem = pathToActiveItem(location.pathname);
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

  return (
    <div 
      className="flex min-h-svh bg-background"
      style={{ 
        '--sidebar-width': isSidebarCollapsed ? '5rem' : '19rem'
      } as React.CSSProperties}
    >
      <Sidebar
        activeItem={activeItem}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
        isMobileDrawerOpen={isMobileDrawerOpen}
        onMobileDrawerChange={setIsMobileDrawerOpen}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsMobileDrawerOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto pt-[var(--header-height)]">
          <div className="min-h-[calc(100svh-var(--header-height))] w-full bg-white">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
