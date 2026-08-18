import type { EntityData } from '@sharedTypes/resource/entity';

export function buildEntityData(data: Partial<EntityData> = {}): EntityData {
  if (data.visual === 'skin' && data.skin)
    return {
      ...data,
      visual: 'skin',
      skin: data.skin,
      allowOverwrap: data.allowOverwrap ?? true,
      actions: data.actions ?? {},
    };
  if (data.visual === 'texture' && data.texture)
    return {
      ...data,
      visual: 'texture',
      texture: data.texture,
      allowOverwrap: data.allowOverwrap ?? true,
      actions: data.actions ?? {},
    };
  return { ...data, visual: 'none', allowOverwrap: data.allowOverwrap ?? true, actions: data.actions ?? {} };
}
