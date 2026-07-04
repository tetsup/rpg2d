import { Maximize2, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@editor/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@editor/components/ui/dialog';
import { fitZoom, zoomIn, zoomOut } from '@editor/lib/paint-editor/zoom';
import { ToolbarIconButton } from './toolbar-icon-button';

type ZoomPopupProps = {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  canvasWidth?: number;
  canvasHeight?: number;
  containerRef?: React.RefObject<HTMLElement | null>;
};

export function ZoomPopup({ zoom, onZoomChange, canvasWidth, canvasHeight, containerRef }: ZoomPopupProps) {
  const { t } = useTranslation();
  const zoomLabel = `${Math.round(zoom * 100)}%`;

  const handleFit = () => {
    const container = containerRef?.current;
    if (container == null || canvasWidth == null || canvasHeight == null) {
      onZoomChange(1);
      return;
    }
    onZoomChange(fitZoom(canvasWidth, canvasHeight, container.clientWidth, container.clientHeight));
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <ToolbarIconButton
            icon={<Maximize2 className="size-4" />}
            label={t('ズーム {{value}}', { value: zoomLabel })}
          />
        }
      />
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>{t('ズーム')}</DialogTitle>
          <DialogDescription>{t('キャンバスの表示倍率を調整します')}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center gap-2">
          <Button type="button" variant="outline" size="icon-sm" onClick={() => onZoomChange(zoomOut(zoom))}>
            <Minus className="size-4" />
            <span className="sr-only">{t('縮小')}</span>
          </Button>
          <span className="min-w-16 text-center text-sm font-medium">{zoomLabel}</span>
          <Button type="button" variant="outline" size="icon-sm" onClick={() => onZoomChange(zoomIn(zoom))}>
            <Plus className="size-4" />
            <span className="sr-only">{t('拡大')}</span>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleFit}>
            {t('フィット')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
