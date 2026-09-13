import { Button } from '@base/components/ui/button';
import { cn } from '@base/lib/utils';

type StyledButtonProps = Parameters<typeof Button>[0];

export function StyledButton({ className, ...props }: StyledButtonProps) {
  return <Button {...props} className={cn('flex min-w-0 w-full', className)} />;
}
