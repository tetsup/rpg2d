import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@editor/components/ui/button';
import { useZoomTool } from '@editor/hooks/grid-editor/zoom-tool';
import { AnchoredEditorMenu, AnchoredEditorMenuContent, AnchoredEditorMenuTrigger } from './anchored-editor-menu';
import { ToolbarIconButton } from './toolbar-icon-button';

type ZoomPopupButtonProps = {
  zoomTool: ReturnType<typeof useZoomTool>;
};

export function ZoomPopupButton({ zoomTool }: ZoomPopupButtonProps) {
  const { t } = useTranslation();

  return (
    <AnchoredEditorMenu>
      <AnchoredEditorMenuTrigger render={<ToolbarIconButton icon={<Maximize2 />} label={t('ズーム')} />} />
      <AnchoredEditorMenuContent
        title={t('ズーム')}
        description={t('キャンバスの表示倍率を調整します')}
        side="top"
        align="center"
        className="max-w-xs"
      >
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => {
              zoomTool.zoomIn();
            }}
          >
            <ZoomIn className="size-4" />
            <span className="sr-only">{t('拡大')}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => {
              zoomTool.zoomOut();
            }}
          >
            <ZoomOut className="size-4" />
            <span className="sr-only">{t('縮小')}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              zoomTool.zoomToFit();
            }}
          >
            {t('フィット')}
          </Button>
        </div>
      </AnchoredEditorMenuContent>
    </AnchoredEditorMenu>
  );
}
