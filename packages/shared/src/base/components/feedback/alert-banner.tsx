import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Alert, AlertDescription } from '@base/components/ui/alert';
import { Button } from '@base/components/ui/button';
import { cn } from '@base/lib/utils';
import { AlertIcon, type AlertLevel } from './alert-icon';

type AlertBannerProps = {
  level: AlertLevel;
  children: ReactNode;
  onClose?: () => void;
};

export function AlertBanner({ level, children, onClose }: AlertBannerProps) {
  return (
    <Alert
      variant={level === 'error' ? 'destructive' : 'default'}
      className={cn(
        'animate-in fade-in slide-in-from-top-2 pointer-events-auto',
        level === 'success' && 'border-green-500',
        level === 'warning' && 'border-yellow-500',
        level === 'info' && 'border-blue-500'
      )}
    >
      <AlertIcon level={level} />

      <AlertDescription className="flex items-start justify-between gap-4">
        <div className="flex-1">{children}</div>

        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
