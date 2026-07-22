import type { ResourceType } from '@sharedTypes/resource/common';
import { ActionSchema } from '@schema/resource/action';
import { EntitySchema } from '../entity';
import { FieldSchema } from '../field';
import { FontSchema } from '../font';
import { ImageSchema } from '../image';
import { ManifestSchema } from '../manifest';
import { PanelSchema } from '../panel';
import { PanelSkinSchema } from '../panel-skin';
import { PlayerSchema } from '../player';
import { SkinSchema } from '../skin';
import { TextureSchema } from '../texture';
import { TileSchema } from '../tile';

export const ResourceSchemaMap = {
  action: ActionSchema,
  entity: EntitySchema,
  field: FieldSchema,
  font: FontSchema,
  image: ImageSchema,
  manifest: ManifestSchema,
  panel: PanelSchema,
  'panel-skin': PanelSkinSchema,
  player: PlayerSchema,
  skin: SkinSchema,
  texture: TextureSchema,
  tile: TileSchema,
};

export const resolveResourceSchema = <T extends ResourceType>(type: T) => ResourceSchemaMap[type];
