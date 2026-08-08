import { Button } from '../ui/button';

type SelectButtonProps = React.ComponentProps<typeof Button>;

export function SelectButton({ children, ...props }: SelectButtonProps) {
  return (
    <Button {...props} variant="outline" className="h-auto min-h-10 w-full justify-start gap-2 py-2">
      {children}
    </Button>
  );
}
