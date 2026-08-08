import { cn } from '@base/lib/utils';

export type DirtyIndicatorProps = {
  isDirty: boolean;
  label: React.ReactNode;
};

export function DirtyIndicator({ isDirty, label }: DirtyIndicatorProps) {
  return <span className={cn('text-xs font-medium', isDirty ? 'text-amber-500' : 'text-emerald-500')}>● {label}</span>;
}
