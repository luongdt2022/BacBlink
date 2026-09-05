import { type ReactNode } from 'react';
import { cn } from '@/shared/components/ui/utils';

interface ResponsivePageSectionProps {
  children: ReactNode;
  className?: string;
  surface?: boolean;
}

export function ResponsivePageSection({
  children,
  className,
  surface = true,
}: ResponsivePageSectionProps) {
  return (
    <section
      className={cn(
        'responsive-page-section',
        surface && 'responsive-page-surface',
        className,
      )}
    >
      {children}
    </section>
  );
}
