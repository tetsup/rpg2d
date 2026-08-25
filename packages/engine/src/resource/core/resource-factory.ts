import type { GameContextLike } from './game-context';
import { Action } from '../domain/action';
import { Entity } from '../domain/entity';
import { Field } from '../domain/field';
import { Font } from '../domain/panel/font';
import { Panel } from '../domain/panel/panel';
import { PanelSkin } from '../domain/panel/panel-skin';
import { Player } from '../domain/player';
import { Skin } from '../domain/skin';
import { Texture } from '../domain/texture';
import { Tile } from '../domain/tile';
import { ImageLoader } from '../domain/imageLoader';

export type ResourceClassMapLike = Record<string, abstract new (...args: any) => any>;

export type ResourceInstanceMapLike<M extends ResourceClassMapLike> = {
  [K in keyof M]: InstanceType<M[K]>;
};

export interface ResourceFactoryLike<M extends ResourceInstanceMapLike<ResourceClassMapLike>> {
  create: <K extends keyof M>(id: string, data: any, type: K) => Promise<M[K]>;
}

export const ResourceClassMap = {
  action: Action,
  entity: Entity,
  field: Field,
  image: ImageLoader,
  panel: Panel,
  'panel-skin': PanelSkin,
  font: Font,
  player: Player,
  skin: Skin,
  texture: Texture,
  tile: Tile,
};

export type ResourceClassMap = typeof ResourceClassMap;

export type ResourceInstanceMap = {
  [K in keyof typeof ResourceClassMap]: InstanceType<(typeof ResourceClassMap)[K]>;
};

export class ResourceFactory implements ResourceFactoryLike<ResourceInstanceMap> {
  constructor(private ctx: GameContextLike) {}

  create = async <K extends keyof ResourceInstanceMap>(id: string, data: any, type: K) => {
    const cls = ResourceClassMap[type];
    const schema = this.ctx.schemas.get(type);
    const parsed = schema.parse(data) as any;
    const deps = (await cls.loadDeps(this.ctx, parsed)) as any;

    return new cls(this.ctx, id, parsed, deps) as ResourceInstanceMap[K];
  };
}
