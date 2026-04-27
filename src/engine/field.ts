import type { InputManager, GameRenderer } from '@tetsup/web2d';
import type { Direction2d, FieldState, Point2d, RpgKey } from '@/types/engine';
import { Queue } from '@/utils/queue';
import { calcDest, samePos } from '@/utils/pos';
import { Rect } from '@/utils/rect';
import type { GameContext } from '@/resource/core/game-context';
import type { Player } from '@/resource/domain/player';
import type { Action } from '@/resource/domain/action';
import type { Field } from '@/resource/domain/field';
import type { Movement } from '@/schemas/actions/movement';
import { FieldPos } from './fieldPos';
import { EntityInstance } from './entity';
import { resolveMove } from './field/resolve-move';
import { calcViewPort } from './field/calc-viewport';
import { resolveEntitiesLayers, resolvePlayerLayers, retrieveLayers } from './field/layer-resolver';
import { checkEntityInhibit, checkReachable, checkTileReachable, moveEntity, movePlayer } from './field/movement-controller';

export class FieldEngine {
  private state: FieldState;

  constructor(
    private ctx: GameContext,
    private field: Field,
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
    const fieldPosConfig = {
      moveDurationMs: ctx.manifest.config.moveDurationMs,
      blockSize: ctx.manifest.config.blockSize,
      initialPos: ctx.manifest.initialState.field.pos,
      initialDirection: ctx.manifest.initialState.field.direction,
    };

    const playerPos = new FieldPos(ctx, fieldPosConfig);
    const entities = Object.fromEntries(
      Object.entries(field.entityInstances).map(([instanceId, { entityId, initialState }]) => [
        instanceId,
        new EntityInstance(ctx, field.entities.get(entityId)!, initialState),
      ])
    );
    return new this(ctx, field, {
      playerPos,
      players,
      actions,
      entities,
    });
  }

  checkEntityInhibit = (dest: Point2d): boolean => {
    return checkEntityInhibit(this.state, samePos, dest);
  };

  checkTileReachable = (dest: Point2d): boolean => {
    return checkTileReachable(this.field, dest);
  };

  checkReachable = (dest: Point2d): boolean => {
    return checkReachable(this.state, this.field, samePos, dest);
  };

  movePlayer = (nowMs: number, movement: Movement) => {
    return movePlayer(this.state, this.field, calcDest, samePos, nowMs, movement);
  };

  moveEntity = (nowMs: number, entityId: string, movement: Movement) => {
    return moveEntity(this.state, this.field, calcDest, samePos, nowMs, entityId, movement);
  };

  resolveMove = (input: InputManager<RpgKey>): Direction2d | null => {
    return resolveMove(input);
  };

  onTick = (input: InputManager<RpgKey>, nowMs: number, renderer: GameRenderer) => {
    tickPlayerMove(this, input, nowMs);
    tickPlayerPos(this.state, nowMs);
    tickEntities(this.state, nowMs);
    renderField(this, nowMs, renderer);
  };

  calcViewPort = (nowMs: number) => {
    return calcViewPort(nowMs, this.state, this.ctx);
  };

  resolvePlayerLayers = (nowMs: number) => {
    return resolvePlayerLayers(nowMs, this.state, this.ctx.manifest.config);
  };

  resolveEntitiesLayers = (nowMs: number, viewport: Rect) => {
    return resolveEntitiesLayers(nowMs, viewport, this.state, this.ctx.manifest.config);
  };

  retrieveLayers = (nowMs: number, viewport: Rect) => {
    return retrieveLayers(nowMs, viewport, this.state, this.ctx.manifest.config, this.field);
  };
}

const tickPlayerMove = (engine: FieldEngine, input: InputManager<RpgKey>, nowMs: number) => {
  const moveDirection = engine.resolveMove(input);
  if (moveDirection != null)
    engine.movePlayer(nowMs, { command: 'walk', direction: moveDirection, async: true, force: false });
};

const tickPlayerPos = (state: FieldState, nowMs: number) => {
  state.playerPos.tick(nowMs);
};

const tickEntities = (state: FieldState, nowMs: number) => {
  Object.values(state.entities).forEach((entity) => entity.state.pos.tick(nowMs));
};

const renderField = (engine: FieldEngine, nowMs: number, renderer: GameRenderer) => {
  const viewport = engine.calcViewPort(nowMs);
  renderer.render(engine.retrieveLayers(nowMs, viewport));
};
