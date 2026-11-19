import { Search } from 'lucide-react';
import { cn } from '@/shared/components/ui/utils';
import { Input } from '@/shared/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={cn('relative min-w-0', className)}>
      <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border-slate-300 bg-white pl-10 shadow-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
      />
    </div>
  );
}
