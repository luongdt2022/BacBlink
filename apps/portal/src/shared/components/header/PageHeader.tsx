import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  onCreateNew?: () => void;
  buttonLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function PageHeader({ 
  title,
  description,
  onCreateNew,
  buttonLabel = 'Tạo mới',
  actionLabel,
  onAction,
}: PageHeaderProps) {
  // Use new props if provided, otherwise fall back to legacy props
  const handleClick = onAction || onCreateNew;
  const label = actionLabel || buttonLabel;

  return (
    <div className="responsive-page-container mb-2 pb-0 pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
          )}
        </div>
        {handleClick && (
          <Button
            onClick={handleClick}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 size-4" />
            <span>{label}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
