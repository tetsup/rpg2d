import { useState } from 'react';
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

type ImageSizeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (size: { width: number; height: number }) => void;
};

const DEFAULT_SIZE = 16;

function parseSize(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SIZE;
}

export function ImageSizeDialog({ open, onOpenChange, onConfirm }: ImageSizeDialogProps) {
  const { t } = useTranslation();
  const [width, setWidth] = useState(String(DEFAULT_SIZE));
  const [height, setHeight] = useState(String(DEFAULT_SIZE));

  const handleConfirm = () => {
    onConfirm({ width: parseSize(width), height: parseSize(height) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('画像サイズ')}</DialogTitle>
          <DialogDescription>{t('新しい画像の幅と高さを指定してください')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm">
            <span>{t('幅')}</span>
            <Input
              type="number"
              min={1}
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>{t('高さ')}</span>
            <Input
              type="number"
              min={1}
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('キャンセル')}
          </Button>
          <Button type="button" onClick={handleConfirm}>
            {t('作成')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
