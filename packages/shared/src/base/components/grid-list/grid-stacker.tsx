import { cn } from '@base/lib/utils';

type GridStackerProps = {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

const gridClass = {
  sm: 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8',
  md: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
  lg: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
} as const;

export function GridStacker({ children, size = 'md' }: GridStackerProps) {
  return <div className={cn('grid gap-2', gridClass[size])}>{children}</div>;
}
