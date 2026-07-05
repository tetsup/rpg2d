import { useTranslation } from 'react-i18next';
import { Button } from '@editor/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@editor/components/ui/dialog';
import { Input } from '@editor/components/ui/input';
import { StyledSwitch } from '@editor/components/parts/styled-switch';
import type { SaveLayerItem, SaveLayerScope } from '@editor/lib/paint-editor/save-layer';

type GraphicsSaveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: SaveLayerScope | null;
  item: SaveLayerItem | null;
  isDraft: boolean;
  onDraftChange: (isDraft: boolean) => void;
  description?: string;
  onDescriptionChange?: (description: string) => void;
  saving: boolean;
  onSave: () => void;
};

export function GraphicsSaveDialog({
  open,
  onOpenChange,
  scope,
  item,
  isDraft,
  onDraftChange,
  description,
  onDescriptionChange,
  saving,
  onSave,
}: GraphicsSaveDialogProps) {
  const { t } = useTranslation();

  const title =
    scope === 'skin' ? t('スキンを保存') : scope === 'texture' ? t('テクスチャを保存') : t('画像を保存');

  const canSave = item != null && item.isValid && item.isDirty && !saving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t('保存内容を確認してから保存します')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <label className="block space-y-1">
            <span className="text-muted-foreground">{t('保存形式')}</span>
            <StyledSwitch
              variant="segmented"
              labelOn={t('下書き')}
              labelOff={t('正式')}
              checked={isDraft}
              onCheckedChange={onDraftChange}
            />
          </label>

          {scope === 'image' && onDescriptionChange != null && (
            <label className="block space-y-1">
              <span className="text-muted-foreground">{t('説明')}</span>
              <Input value={description ?? ''} onChange={(event) => onDescriptionChange(event.target.value)} />
            </label>
          )}

          {item?.hasDraftDescendants && item.draftChildren.length > 0 && (
            <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100">
              <p className="font-medium">{t('下書きの子リソースがあります')}</p>
              <ul className="mt-1 list-inside list-disc text-xs">
                {item.draftChildren.map((child) => (
                  <li key={child.id}>
                    {child.label} ({child.type})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item != null && item.invalidMessages.length > 0 && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive">
              <p className="font-medium">{t('保存できません')}</p>
              <ul className="mt-1 list-inside list-disc text-xs">
                {item.invalidMessages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('キャンセル')}
          </Button>
          <Button type="button" disabled={!canSave} onClick={onSave}>
            {saving ? t('保存中…') : t('保存')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
