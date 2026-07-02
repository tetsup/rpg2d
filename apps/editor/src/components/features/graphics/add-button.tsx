import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@editor/components/ui/button';
import { cn } from '@editor/lib/utils';

type AddButtonProps = {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export function AddButton({ label, onClick, disabled = true, className }: AddButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      className={cn('shrink-0', className)}
      aria-label={label ?? t('追加')}
    >
      <Plus className="size-4" />
    </Button>
  );
}
