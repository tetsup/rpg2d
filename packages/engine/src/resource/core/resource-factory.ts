import type { ExecutableResourceType, ResourceData } from '@sharedTypes/resource/common';
import { ResourceStatic } from '@engine/types/resource';
import type { GameContext } from './game-context';
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

export class ResourceFactory {
  constructor(private ctx: GameContext) {}

  create = async <K extends ExecutableResourceType>(data: any, type: K) => {
    const cls = ResourceClassMap[type] as ResourceStatic<K>;
    const schema = this.ctx.schemas.get(type);
    const parsed = schema.parse(data) as ResourceData<K>;
    const deps = await cls.loadDeps(this.ctx, parsed);
    return new cls(this.ctx, parsed, deps);
  };
}
