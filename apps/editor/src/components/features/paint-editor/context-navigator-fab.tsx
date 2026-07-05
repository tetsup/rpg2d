import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AddButton } from '@editor/components/features/graphics/add-button';
import { GraphicsContextList, type GraphicsContextItem } from '@editor/components/features/graphics/graphics-context-list';
import { Button } from '@editor/components/ui/button';
import { cn } from '@editor/lib/utils';
import {
  AnchoredEditorMenu,
  AnchoredEditorMenuContent,
  AnchoredEditorMenuTrigger,
} from './anchored-editor-menu';
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

function ContextChipMenu({
  label,
  valueLabel,
  items,
  activeId,
  emptyLabel,
  showDirtyDot,
  showDraftDot,
  onAdd,
  addDisabled,
  triggerClassName,
}: ContextChip & { triggerClassName?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const triggerLabel = valueLabel ? `${label}: ${valueLabel}` : label;
  const itemsWithClose = items.map((item) => ({
    ...item,
    onSelect: () => {
      item.onSelect();
      setOpen(false);
    },
  }));

  return (
    <AnchoredEditorMenu open={open} onOpenChange={setOpen}>
      <AnchoredEditorMenuTrigger
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
      <AnchoredEditorMenuContent
        title={label}
        description={`${label}${t('を切り替えます')}`}
        side="bottom"
        align="end"
        footer={
          onAdd != null ? (
            <AddButton
              disabled={addDisabled}
              onClick={() => {
                onAdd();
                setOpen(false);
              }}
            />
          ) : undefined
        }
      >
        <GraphicsContextList items={itemsWithClose} activeId={activeId} emptyLabel={emptyLabel} />
      </AnchoredEditorMenuContent>
    </AnchoredEditorMenu>
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
          <ContextChipMenu key={chip.id} {...chip} />
        ))}
      </div>
    </div>
  );
}
