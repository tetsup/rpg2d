import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Button } from '@editor/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@editor/components/ui/dialog';

type SwitcherPopupProps = {
  label: string;
  /** Shown on the trigger when a context item is active (e.g. frame id). */
  valueLabel?: string;
  description?: string;
  children?: ReactNode;
  disabled?: boolean;
};

export function SwitcherPopup({
  label,
  valueLabel,
  description,
  children,
  disabled = false,
}: SwitcherPopupProps) {
  const { t } = useTranslation();
  const triggerLabel = valueLabel ? `${label}: ${valueLabel}` : label;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm" disabled={disabled} className="shrink-0">
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="size-4 shrink-0" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children ?? <p className="text-sm text-muted-foreground">{t('切り替え項目は未設定です')}</p>}
      </DialogContent>
    </Dialog>
  );
}
