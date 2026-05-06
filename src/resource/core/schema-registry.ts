import z from 'zod';
import type { Manifest } from '@/schemas/manifest';
import type { ResourceName } from '@/types/resource';
import { ActionSchema } from '@/schemas/action/action';
import { EntitySchema } from '@/schemas/entity';
import { FieldSchema } from '@/schemas/field';
import { FontSchema } from '@/schemas/panel/font';
import { PanelSchema } from '@/schemas/panel/panel';
import { PanelSkinSchema } from '@/schemas/panel/panel-skin';
import { buildPlayerSchema } from '@/schemas/player';
import { SkinSchema } from '@/schemas/image/skin';
import { TextureSchema } from '@/schemas/image/texture';
import { TileSchema } from '@/schemas/tile';

export class SchemaRegistry {
  private schemas = new Map<ResourceName, z.ZodTypeAny>();

  constructor(manifest: Manifest) {
    this.schemas.set('action', ActionSchema);
    this.schemas.set('entity', EntitySchema);
    this.schemas.set('field', FieldSchema);
    this.schemas.set('font', FontSchema);
    this.schemas.set('panel', PanelSchema);
    this.schemas.set('panel-skin', PanelSkinSchema);
    this.schemas.set('player', buildPlayerSchema(manifest.schemas.playerState));
    this.schemas.set('skin', SkinSchema);
    this.schemas.set('texture', TextureSchema);
    this.schemas.set('tile', TileSchema);
  }

  get(key: ResourceName) {
    return this.schemas.get(key)!;
  }
}
