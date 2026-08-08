import { cn } from '@base/lib/utils';

type OverlayCanvasProps = React.CanvasHTMLAttributes<HTMLCanvasElement>;

export function OverlayCanvas({ className, ...props }: OverlayCanvasProps) {
  return <canvas className={cn('absolute inset-0 block size-full touch-none', className)} {...props} />;
}
