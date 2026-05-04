import type { ResourceData, ResourceName, ResourceStatic } from '@/types/resource';
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

const getResourceClass = <K extends ResourceName>(type: K) =>
  type === 'action'
    ? Action
    : type === 'entity'
      ? Entity
      : type === 'field'
        ? Field
        : type === 'panel'
          ? Panel
          : type === 'panel-skin'
            ? PanelSkin
            : type === 'font'
              ? Font
              : type === 'player'
                ? Player
                : type === 'skin'
                  ? Skin
                  : type === 'texture'
                    ? Texture
                    : Tile;

export class ResourceFactory {
  constructor(private ctx: GameContext) {}

  create = async <K extends ResourceName>(data: any, type: K) => {
    const cls = getResourceClass(type) as ResourceStatic<K>;
    const schema = this.ctx.schemas.get(type);
    const parsed = schema.parse(data) as ResourceData<K>;
    const deps = await cls.loadDeps(this.ctx, parsed);
    return new cls(this.ctx, parsed, deps);
  };
}
