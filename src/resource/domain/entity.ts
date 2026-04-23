import type { EntityData, EntityDeps } from '@/schemas/entity';
import { ResourceBase } from '../core/resource-base';
import { GameContext } from '../core/game-context';
import { Action } from './action';
import { Skin } from './skin';
import { Direction2d, Point2d } from '@/types/engine';

export class Entity extends ResourceBase<'entity'> {
  pos: Point2d = { x: 0, y: 0 };
  direction: Direction2d = 'down';
  visible: boolean = true;

  static async loadDeps(ctx: GameContext, data: EntityData): Promise<EntityDeps> {
    const skin = (await ctx.resources.get(data.skin, 'skin')) as Skin;
    const actions = await Promise.all(
      data.actions.map(async ({ trigger, action }) => ({
        trigger,
        action: (await ctx.resources.get(action, 'action')) as Action,
      }))
    );
    return { skin, actions };
  }

  jump(pos: Point2d, direction: Direction2d) {
    this.pos = pos;
    this.direction = direction;
  }
}
