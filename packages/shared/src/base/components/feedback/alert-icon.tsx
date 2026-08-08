import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';

export type AlertLevel = 'success' | 'info' | 'warning' | 'error';

type Props = {
  level: AlertLevel;
};

export function AlertIcon({ level }: Props) {
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
