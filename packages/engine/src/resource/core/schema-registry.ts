import z from 'zod';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import { ResourceType } from '@sharedTypes/resource/common';
import { ActionSchema } from '@schema/resource/action';
import { EntitySchema } from '@schema/resource/entity';
import { FieldSchema } from '@schema/resource/field';
import { FontSchema } from '@schema/resource/font';
import { ImageSchema } from '@schema/resource/image';
import { PanelSchema } from '@schema/resource/panel';
import { PanelSkinSchema } from '@schema/resource/panel-skin';
import { buildPlayerSchema } from '@schema/resource/player';
import { SkinSchema } from '@schema/resource/skin';
import { TextureSchema } from '@schema/resource/texture';
import { TileSchema } from '@schema/resource/tile';

export class SchemaRegistry {
  private schemas = new Map<ResourceType, z.ZodTypeAny>();

  constructor(manifest: ManifestData) {
    this.schemas.set('action', ActionSchema);
    this.schemas.set('entity', EntitySchema);
    this.schemas.set('field', FieldSchema);
    this.schemas.set('font', FontSchema);
    this.schemas.set('image', ImageSchema);

    this.schemas.set('panel', PanelSchema);
    this.schemas.set('panel-skin', PanelSkinSchema);
    this.schemas.set('player', buildPlayerSchema(manifest.schemas.playerState));
    this.schemas.set('skin', SkinSchema);
    this.schemas.set('texture', TextureSchema);
    this.schemas.set('tile', TileSchema);
  }

  get(key: ResourceType) {
    return this.schemas.get(key)!;
  }
}
