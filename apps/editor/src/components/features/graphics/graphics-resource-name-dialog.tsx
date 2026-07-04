import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceNameSchema } from '@schema/resource/common/base';
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

type GraphicsResourceNameDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: (name: string) => void;
};

export function GraphicsResourceNameDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pending = false,
  onConfirm,
}: GraphicsResourceNameDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  const handleOpenChange = (next: boolean) => {
    if (!next) setName('');
    onOpenChange(next);
  };

  const trimmed = name.trim();
  const isValidName = trimmed.length > 0 && ResourceNameSchema.safeParse(trimmed).success;
  const canConfirm = isValidName && !pending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">{t('名前')}</span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('例: hero')}
            autoFocus
            aria-invalid={trimmed.length > 0 && !isValidName}
          />
          {trimmed.length > 0 && !isValidName && (
            <p className="text-xs text-destructive">
              {t('名前は小文字英字で始まり、英数字・ハイフン・ドットのみ使えます')}
            </p>
          )}
        </label>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('キャンセル')}
          </Button>
          <Button type="button" disabled={!canConfirm} onClick={() => onConfirm(trimmed)}>
            {pending ? t('作成中…') : (confirmLabel ?? t('作成'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
