import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useAlert, useAlertState } from '@editor/shared/providers/alert';
import { Alert, AlertDescription } from '@base/components/ui/alert';
import { Button } from '@base/components/ui/button';
import { cn } from '@base/lib/utils';

export function AlertViewport() {
  const { alerts } = useAlertState();
  const alert = useAlert();
  if (alerts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-4 left-1/2 z-50 flex w-full max-w-3xl -translate-x-1/2 flex-col gap-2 px-4">
      {alerts.map((item) => (
        <Alert
          key={item.id}
          variant={item.level === 'error' ? 'destructive' : 'default'}
          className={cn(
            'pointer-events-auto animate-in fade-in slide-in-from-top-2',
            item.level === 'success' && 'border-green-500',
            item.level === 'warning' && 'border-yellow-500',
            item.level === 'info' && 'border-blue-500'
          )}
        >
          {icon(item.level)}
          <AlertDescription className="flex items-start justify-between gap-4">
            <div className="flex-1">{item.message}</div>
            <Button variant="ghost" size="icon" onClick={() => alert.remove(item.id)}>
              <X className="size-4" />
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

function icon(level: 'success' | 'info' | 'warning' | 'error') {
  switch (level) {
    case 'success':
      return <CheckCircle2 className="size-4" />;
    case 'warning':
      return <TriangleAlert className="size-4" />;
    case 'info':
      return <Info className="size-4" />;
    case 'error':
      return <AlertCircle className="size-4" />;
  }
}
