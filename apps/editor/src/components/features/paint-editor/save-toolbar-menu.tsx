import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@editor/components/ui/dropdown-menu';
import type { SaveLayerItem, SaveLayerScope } from '@editor/lib/paint-editor/save-layer';
import { ToolbarIconButton } from './toolbar-icon-button';

type SaveToolbarMenuProps = {
  items: SaveLayerItem[];
  saving: boolean;
  showDirtyDot?: boolean;
  showDraftDot?: boolean;
  onSelectScope: (scope: SaveLayerScope) => void;
};

export function SaveToolbarMenu({
  items,
  saving,
  showDirtyDot = false,
  showDraftDot = false,
  onSelectScope,
}: SaveToolbarMenuProps) {
  const { t } = useTranslation();
  const singleScope = items.length === 1 ? items[0] : null;

  if (singleScope != null) {
    return (
      <ToolbarIconButton
        icon={<Save className="size-4" />}
        label={t('保存')}
        disabled={saving}
        showDirtyDot={showDirtyDot}
        showDraftDot={!showDirtyDot && showDraftDot}
        onClick={() => onSelectScope(singleScope.scope)}
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <ToolbarIconButton
            icon={<Save className="size-4" />}
            label={t('保存')}
            disabled={saving || !items.some((item) => item.isDirty)}
            showDirtyDot={showDirtyDot}
            showDraftDot={!showDirtyDot && showDraftDot}
          />
        }
      />
      <DropdownMenuContent align="end">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.scope}
            disabled={!item.isDirty || saving}
            onClick={() => onSelectScope(item.scope)}
          >
            <span>{item.label}</span>
            {item.hasDraftDescendants && (
              <span className="ml-auto text-xs text-sky-600">{t('下書きあり')}</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
