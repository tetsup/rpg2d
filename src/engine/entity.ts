import type { EntityState } from '@/types/engine';
import type { Movement } from '@/schemas/actions/movement';
import type { EntityInitialState } from '@/schemas/field';
import { Queue } from '@/utils/queue';
import type { GameContext } from '@/resource/core/game-context';
import type { Entity } from '@/resource/domain/entity';
import type { Action } from '@/resource/domain/action';
import { FieldPos } from './fieldPos';

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
}
