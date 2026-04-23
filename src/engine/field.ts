import type { InputManager, GameRenderer } from '@tetsup/web2d';
import type { FieldState } from '@/types/engine';
import { Queue } from '@/utils/queue';
import { GameContext } from '@/resource/core/game-context';
import { Player } from '@/resource/domain/player';
import { Action } from '@/resource/domain/action';
import { Field } from '@/resource/domain/field';

export class FieldEngine {
  private state: FieldState;

  constructor(
    private ctx: GameContext,
    initialState: FieldState
  ) {
    this.state = initialState;
  }

  static async factory(ctx: GameContext, players: Player[]) {
    const actions: Queue<Action> = new Queue();
    await Promise.all(
      ctx.manifest.initialState.field.actionIds.map(async (actionId) => {
        actions.push((await ctx.resources.get(actionId, 'action')) as Action);
      })
    );
    const field = (await ctx.resources.get(ctx.manifest.initialState.field.fieldId, 'field')) as Field;
    const pos = {
      current: ctx.manifest.initialState.field.pos,
      direction: 'down' as const,
      moving: false,
      stepMs: 0,
      spendMsPerBlock: ctx.manifest.config.walkingTimePerBlock,
    };
    return new this(ctx, {
      field,
      pos,
      players,
      actions,
    });
  }

  onTick(input: InputManager, nowMs: number, renderer: GameRenderer) {
    renderer.render();
  }
}
