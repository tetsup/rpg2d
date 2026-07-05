import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AddButton } from '@editor/components/features/graphics/add-button';
import { GraphicsContextList, type GraphicsContextItem } from '@editor/components/features/graphics/graphics-context-list';
import { Button } from '@editor/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@editor/components/ui/dialog';
import { cn } from '@editor/lib/utils';
import { SyncIndicatorDot } from './sync-indicator-dot';

export type ContextChip = {
  id: string;
  label: string;
  valueLabel?: string;
  items: GraphicsContextItem[];
  activeId?: string;
  emptyLabel: string;
  showDirtyDot?: boolean;
  showDraftDot?: boolean;
  onAdd?: () => void;
  addDisabled?: boolean;
};

function ContextChipDialog({
  label,
  valueLabel,
  showDirtyDot,
  showDraftDot,
  children,
  onAdd,
  addDisabled,
  triggerClassName,
}: ContextChip & { children: ReactNode; triggerClassName?: string }) {
  const { t } = useTranslation();
  const triggerLabel = valueLabel ? `${label}: ${valueLabel}` : label;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={cn('relative shrink-0 shadow-md', triggerClassName)}
          >
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="size-4 shrink-0" />
            {showDirtyDot && <SyncIndicatorDot variant="dirty" />}
            {!showDirtyDot && showDraftDot && <SyncIndicatorDot variant="draft" />}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{`${label}${t('を切り替えます')}`}</DialogDescription>
        </DialogHeader>
        {children}
        {onAdd != null && (
          <div className="flex justify-end pt-2">
            <AddButton disabled={addDisabled} onClick={onAdd} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

type ContextNavigatorFabProps = {
  chips: ContextChip[];
  className?: string;
};

export function ContextNavigatorFab({ chips, className }: ContextNavigatorFabProps) {
  if (chips.length === 0) return null;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-end px-2',
        className
      )}
    >
      <div className="pointer-events-auto flex flex-col items-end gap-1">
        {chips.map((chip) => (
          <ContextChipDialog key={chip.id} {...chip}>
            <GraphicsContextList items={chip.items} activeId={chip.activeId} emptyLabel={chip.emptyLabel} />
          </ContextChipDialog>
        ))}
      </div>
    </div>
  );
}
