import type { ResourceData, ResourceName, ResourceStatic } from '@/types/resource';
import type { GameContext } from './game-context';
import { Entity } from '../domain/entity';
import { Field } from '../domain/field';
import { Player } from '../domain/player';
import { Skin } from '../domain/skin';
import { Texture } from '../domain/texture';
import { Tile } from '../domain/tile';
import { Action } from '../domain/action';

const resourceClassMap = {
  action: Action,
  entity: Entity,
  field: Field,
  player: Player,
  skin: Skin,
  texture: Texture,
  tile: Tile,
};

export class ResourceFactory {
  constructor(private ctx: GameContext) {}

  async create<K extends ResourceName>(data: any, type: K) {
    const cls = resourceClassMap[type] as ResourceStatic<K>;
    const schema = this.ctx.schemas.get(type);
    const parsed = schema.parse(data) as ResourceData<K>;
    const deps = await cls.loadDeps(this.ctx, parsed);
    return new cls(this.ctx, parsed, deps);
  }
}
