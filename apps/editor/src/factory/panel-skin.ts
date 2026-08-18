import type { PanelSkinData } from '@sharedTypes/resource/panel-skin';

export function buildPanelSkinData(data: Partial<PanelSkinData> = {}): PanelSkinData {
  return {
    plane: '',
    top: '',
    bottom: '',
    left: '',
    right: '',
    topLeft: '',
    topRight: '',
    bottomLeft: '',
    bottomRight: '',
    defaultFont: '',
    defaultTextColor: { r: 255, g: 255, b: 255, a: 255 },
    ...data,
  };
}
