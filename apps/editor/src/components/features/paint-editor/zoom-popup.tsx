import { Maximize2, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@editor/components/ui/button';
import { formatZoomLabel, zoomIn, zoomOut } from '@editor/lib/paint-editor/zoom';
import {
  AnchoredEditorMenu,
  AnchoredEditorMenuContent,
  AnchoredEditorMenuTrigger,
} from './anchored-editor-menu';
import { ToolbarIconButton } from './toolbar-icon-button';

type ZoomPopupProps = {
  zoom: number;
  onZoomChange: (zoom: number) => void;
};

export function ZoomPopup({ zoom, onZoomChange }: ZoomPopupProps) {
  const { t } = useTranslation();
  const zoomLabel = formatZoomLabel(zoom);

  return (
    <AnchoredEditorMenu>
      <AnchoredEditorMenuTrigger
        render={
          <ToolbarIconButton
            icon={<Maximize2 />}
            label={t('ズーム {{value}}', { value: zoomLabel })}
          />
        }
      />
      <AnchoredEditorMenuContent
        title={t('ズーム')}
        description={t('キャンバスの表示倍率を調整します')}
        side="top"
        align="center"
        className="max-w-xs"
      >
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
          <Button type="button" variant="outline" size="sm" onClick={() => onZoomChange(1)}>
            {t('フィット')}
          </Button>
        </div>
      </AnchoredEditorMenuContent>
    </AnchoredEditorMenu>
  );
}
