import z from 'zod';
import { StateDefinition } from '../../../../types/variable';
import { IdSchema } from '../resource/common/base';
import { ActionSchema } from '../resource/action';
import { EntitySchema } from '../resource/entity';
import { FontSchema } from '../resource/font';
import { FieldSchema } from '../resource/field';
import { ImageSchema } from '../resource/image';
import { ManifestSchema } from '../resource/manifest';
import { PanelSchema } from '../resource/panel';
import { PanelSkinSchema } from '../resource/panel-skin';
import { buildPlayerSchema } from '../resource/player';
import { SkinSchema } from '../resource/skin';
import { TextureSchema } from '../resource/texture';
import { TileSchema } from '../resource/tile';

export const resourceTypes = [
  'action',
  'entity',
  'field',
  'image',
  'font',
  'manifest',
  'panel-skin',
  'panel',
  'player',
  'skin',
  'texture',
  'tile',
] as const;

export const ResourceParamsSchema = z.object({
  namespace: z.string().min(1),
  type: z.enum(resourceTypes),
  id: z.string().min(1),
});

export const parseResource = (data: Record<string, any>, playerStateDefinition: StateDefinition = {}) => {
  switch (data.type) {
    case 'action':
      return ActionSchema.parse(data);
    case 'entity':
      return EntitySchema.parse(data);
    case 'field':
      return FieldSchema.parse(data);
    case 'font':
      return FontSchema.parse(data);
    case 'image':
      return ImageSchema.parse(data);
    case 'manifest':
      return ManifestSchema.parse(data);
    case 'panel':
      return PanelSchema.parse(data);
    case 'panel-skin':
      return PanelSkinSchema.parse(data);
    case 'player':
      return buildPlayerSchema(playerStateDefinition).parse(data);
    case 'skin':
      return SkinSchema.parse(data);
    case 'texture':
      return TextureSchema.parse(data);
    case 'tile':
      return TileSchema.parse(data);
  }
};
