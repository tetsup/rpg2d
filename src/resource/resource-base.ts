import z from 'zod';
import type { ResourceManager } from './resource-manager';
import type { ActionData } from '@/schemas/action';
import type { AppearanceData } from '@/schemas/appearance';
import type { EntityData } from '@/schemas/entity';
import type { FieldData } from '@/schemas/field';
import type { SkinData } from '@/schemas/image/skin';
import type { TextureData } from '@/schemas/image/texture';
import type { TileActionTrigger, TileData } from '@/schemas/tile';
import type { Position } from '@/schemas/common';
import type { Action } from './action';
import type { Appearance, AppearanceDeps } from './appearance';
import type { Entity } from './entity';
import type { Field } from './field';
import type { Skin } from './skin';
import type { Texture } from './texture';
import type { Tile } from './tile';

export type ResourceDefinition = {
  action: {
    data: ActionData;
    class: typeof Action;
    deps: {};
  };
  appearance: {
    data: AppearanceData;
    class: typeof Appearance;
    deps: AppearanceDeps;
  };
  entity: {
    data: EntityData;
    class: typeof Entity;
    deps: { appearance: Appearance };
  };
  field: {
    data: FieldData;
    class: typeof Field;
    deps: {
      tiles: Map<string, Tile>;
      entities: Map<string, { pos: Position; class: Entity }>;
    };
  };
  skin: {
    data: SkinData;
    class: typeof Skin;
    deps: { textures: { left: Texture; right: Texture; up: Texture; down: Texture } };
  };
  texture: { data: TextureData; class: typeof Texture; deps: {} };
  tile: {
    data: TileData;
    class: typeof Tile;
    deps: {
      texture: Texture;
      actions: Record<TileActionTrigger, Action>;
    };
  };
};

type ResourceConstructor<K extends keyof ResourceDefinition> = new (
  resources: ResourceManager,
  data: ResourceDefinition[K]['data'],
  deps: ResourceDefinition[K]['deps']
) => InstanceType<ResourceDefinition[K]['class']>;

type ResourceStatic<K extends keyof ResourceDefinition> = {
  schema: z.ZodType<ResourceDefinition[K]['data']>;
  loadDeps: (resources: ResourceManager, data: ResourceDefinition[K]['data']) => Promise<ResourceDefinition[K]['deps']>;
} & ResourceConstructor<K>;

export abstract class ResourceBase<K extends keyof ResourceDefinition> {
  constructor(
    protected resources: ResourceManager,
    protected data: ResourceDefinition[K]['data'],
    protected deps: ResourceDefinition[K]['deps']
  ) {}

  static async loadDeps(_resources: ResourceManager, _data: unknown): Promise<any> {
    return {};
  }

  static async factory<K extends keyof ResourceDefinition = any>(
    this: ResourceStatic<K>,
    resources: ResourceManager,
    data: unknown
  ): Promise<InstanceType<ResourceDefinition[K]['class']>> {
    const parsed = this.schema.parse(data);
    const deps = await this.loadDeps(resources, parsed);
    return new this(resources, parsed, deps);
  }
}
