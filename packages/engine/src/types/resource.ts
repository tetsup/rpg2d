import z from 'zod';
import type { GameContext } from '@engine/resource/core/game-context';
import type { SchemaRegistry } from '@engine/resource/core/schema-registry';
import type { Action } from '@engine/resource/domain/action';
import type { Entity } from '@engine/resource/domain/entity';
import type { Field } from '@engine/resource/domain/field';
import type { Font } from '@engine/resource/domain/panel/font';
import type { ImageLoader } from '@engine/resource/domain/imageLoader';
import type { Panel } from '@engine/resource/domain/panel/panel';
import type { PanelSkin } from '@engine/resource/domain/panel/panel-skin';
import type { Player } from '@engine/resource/domain/player';
import type { Skin } from '@engine/resource/domain/skin';
import type { Texture } from '@engine/resource/domain/texture';
import type { Tile } from '@engine/resource/domain/tile';
import type { ActionData } from '@sharedTypes/resource/action';
import type { EntityData } from '@sharedTypes/resource/entity';
import type { FieldData } from '@sharedTypes/resource/field';
import type { FontData } from '@sharedTypes/resource/font';
import type { ImageData } from '@sharedTypes/resource/image';
import type { PanelData } from '@sharedTypes/resource/panel';
import type { PanelSkinData } from '@sharedTypes/resource/panel-skin';
import type { PlayerData } from '@sharedTypes/resource/player';
import type { SkinData } from '@sharedTypes/resource/skin';
import type { TextureData } from '@sharedTypes/resource/texture';
import type { TileData } from '@sharedTypes/resource/tile';
import type { ResourceDeps } from './resource-deps';
import { ResourceType } from '@sharedTypes/resource/common';

export type ResourceData<Name extends ResourceType> = Name extends 'action'
  ? ActionData
  : Name extends 'entity'
    ? EntityData
    : Name extends 'field'
      ? FieldData
      : Name extends 'font'
        ? FontData
        : Name extends 'image'
          ? ImageData
          : Name extends 'panel'
            ? PanelData
            : Name extends 'panel-skin'
              ? PanelSkinData
              : Name extends 'player'
                ? PlayerData
                : Name extends 'skin'
                  ? SkinData
                  : Name extends 'texture'
                    ? TextureData
                    : Name extends 'tile'
                      ? TileData
                      : never;

export type ResourceClass<Name extends ResourceType> = Name extends 'action'
  ? typeof Action
  : Name extends 'entity'
    ? typeof Entity
    : Name extends 'field'
      ? typeof Field
      : Name extends 'font'
        ? typeof Font
        : Name extends 'image'
          ? typeof ImageLoader
          : Name extends 'panel'
            ? typeof Panel
            : Name extends 'panel-skin'
              ? typeof PanelSkin
              : Name extends 'player'
                ? typeof Player
                : Name extends 'skin'
                  ? typeof Skin
                  : Name extends 'texture'
                    ? typeof Texture
                    : Name extends 'tile'
                      ? typeof Tile
                      : never;

export type ResourceConstructor<K extends ResourceType> = new (
  ctx: GameContext,
  data: ResourceData<K>,
  deps: ResourceDeps<K>
) => InstanceType<ResourceClass<K>>;

export type ResourceStatic<K extends ResourceType> = {
  getSchema: (schemas: SchemaRegistry) => z.ZodType<ResourceData<K>>;
  loadDeps: (ctx: GameContext, data: ResourceData<K>) => Promise<ResourceDeps<K>>;
} & ResourceConstructor<K>;
