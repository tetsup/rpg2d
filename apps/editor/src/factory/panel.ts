import type { PanelData } from '@sharedTypes/resource/panel';

export function buildPanelData(data: Partial<PanelData> = {}): PanelData {
  return {
    skin: '',
    layout: { anchorType: 'screen', anchor: 'top-left', pos: { x: 24, y: 24 }, size: { width: 50, height: 50 } },
    content: { type: 'message', staticContents: [], variantContents: [] },
    ...data,
  };
}
