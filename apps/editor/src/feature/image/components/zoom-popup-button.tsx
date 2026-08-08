import { Maximize, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ToolbarMenu } from '@base/components/toolbar/toolbar-menu';
import { ToolbarButton } from '@base/components/toolbar/toolbar-button';
import { useZoomTool } from '../hooks/use-zoom-tool';

type ZoomPopupButtonProps = {
  zoomTool: ReturnType<typeof useZoomTool>;
};

export function ZoomPopupButton({ zoomTool }: ZoomPopupButtonProps) {
  const { t } = useTranslation();

  return (
    <ToolbarMenu
      trigger={
        <ToolbarButton label={t('ズーム')}>
          <Maximize2 />
        </ToolbarButton>
      }
      title={t('ズーム')}
      description={t('キャンバスの表示倍率を調整します')}
      side="top"
      align="center"
      size="xs"
    >
      <ToolbarButton
        outlined
        label={t('拡大')}
        onClick={() => {
          zoomTool.zoomIn();
        }}
      >
        <ZoomIn />
      </ToolbarButton>
      <ToolbarButton
        outlined
        label={t('縮小')}
        onClick={() => {
          zoomTool.zoomOut();
        }}
      >
        <ZoomOut />
      </ToolbarButton>
      <ToolbarButton
        outlined
        label={t('フィット')}
        onClick={() => {
          zoomTool.zoomToFit();
        }}
      >
        <Maximize />
      </ToolbarButton>
    </ToolbarMenu>
  );
}
