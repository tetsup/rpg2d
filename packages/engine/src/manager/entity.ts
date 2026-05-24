import type { EntityState } from '@sharedTypes/engine';
import type { Movement } from '@sharedTypes/resource/action';
import type { EntityInitialState } from '@sharedTypes/resource/field';
import { Queue } from '@engine/utils/queue';
import type { GameContext } from '@engine/resource/core/game-context';
import type { Entity } from '@engine/resource/domain/entity';
import type { Action } from '@engine/resource/domain/action';
import { FieldPos } from './field/field-pos';

export class EntityInstance {
  state: EntityState;
  queue: Queue<Movement> = new Queue();

  constructor(
    private ctx: GameContext,
    private entity: Entity,
    initialState: EntityInitialState
  ) {
    const fieldPosConfig = {
      moveDurationMs: entity.moveDurationMs ?? ctx.manifest.config.moveDurationMs,
      blockSize: this.ctx.manifest.config.blockSize,
      initialPos: initialState.pos,
      initialDirection: initialState.direction,
    };
    const pos = new FieldPos(ctx, fieldPosConfig);
    const actions = new Queue<Action>();
    this.state = { pos, actions, visible: initialState.visible, allowOverwrap: this.entity.allowOverwrap };
  }
  getAction = (trigger: string): Action | undefined => {
    return this.entity.getAction(trigger);
  };

  resolveLayers = (nowMs: number) => {
    return this.entity.resolveLayers(nowMs, this.state.pos.direction);
  };
}
