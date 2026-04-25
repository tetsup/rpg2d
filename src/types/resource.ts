import z from 'zod';
import type { GameContext } from '@/resource/core/game-context';
import type { SchemaRegistry } from '@/resource/core/schema-registry';
import type { Action } from '@/resource/domain/action';
import type { Entity } from '@/resource/domain/entity';
import type { Field } from '@/resource/domain/field';
import type { Player } from '@/resource/domain/player';
import type { Skin } from '@/resource/domain/skin';
import type { Texture } from '@/resource/domain/texture';
import type { Tile } from '@/resource/domain/tile';
import type { ActionData, ActionDeps } from '@/schemas/action';
import type { EntityData, EntityDeps } from '@/schemas/entity';
import type { FieldData, FieldDeps } from '@/schemas/field';
import type { PlayerData, PlayerDeps } from '@/schemas/player';
import type { SkinData, SkinDeps } from '@/schemas/image/skin';
import type { TextureData, TextureDeps } from '@/schemas/image/texture';
import type { TileData, TileDeps } from '@/schemas/tile';
import type { Condition } from '@/schemas/condition';

export type Layers = Record<string, Skin | null>;
export type Rule = { when: Condition; set: Layers };

export type ResourceName = 'action' | 'entity' | 'field' | 'player' | 'skin' | 'texture' | 'tile';

export type ResourceData<Name extends ResourceName> = Name extends 'action'
  ? ActionData
  : Name extends 'entity'
    ? EntityData
    : Name extends 'field'
      ? FieldData
      : Name extends 'player'
        ? PlayerData
        : Name extends 'skin'
          ? SkinData
          : Name extends 'texture'
            ? TextureData
            : Name extends 'tile'
              ? TileData
              : never;

export type ResourceClass<Name extends ResourceName> = Name extends 'action'
  ? typeof Action
  : Name extends 'entity'
    ? typeof Entity
    : Name extends 'field'
      ? typeof Field
      : Name extends 'player'
        ? typeof Player
        : Name extends 'skin'
          ? typeof Skin
          : Name extends 'texture'
            ? typeof Texture
            : Name extends 'tile'
              ? typeof Tile
              : never;

export type ResourceDeps<Name extends ResourceName> = Name extends 'action'
  ? ActionDeps
  : Name extends 'entity'
    ? EntityDeps
    : Name extends 'field'
      ? FieldDeps
      : Name extends 'player'
        ? PlayerDeps
        : Name extends 'skin'
          ? SkinDeps
          : Name extends 'texture'
            ? TextureDeps
            : Name extends 'tile'
              ? TileDeps
              : never;

export type ResourceConstructor<K extends ResourceName> = new (
  ctx: GameContext,
  data: ResourceData<K>,
  deps: ResourceDeps<K>
) => InstanceType<ResourceClass<K>>;

export type ResourceStatic<K extends ResourceName> = {
  getSchema: (schemas: SchemaRegistry) => z.ZodType<ResourceData<K>>;
  loadDeps: (ctx: GameContext, data: ResourceData<K>) => Promise<ResourceDeps<K>>;
} & ResourceConstructor<K>;
