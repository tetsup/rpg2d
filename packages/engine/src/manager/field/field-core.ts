import type { GameRenderer } from '@tetsup/web2d';
import type { FieldState, LayerWithPos, RpgKey } from '@sharedTypes/engine';
import type { Movement } from '@sharedTypes/resource/action';
import { Queue } from '@engine/utils/queue';
import { calcDest, move, samePos } from '@engine/utils/pos';
import { Rect } from '@engine/utils/rect';
import type { GameContext } from '@engine/resource/core/game-context';
import type { Player } from '@engine/resource/domain/player';
import type { Action } from '@engine/resource/domain/action';
import type { Field } from '@engine/resource/domain/field';
import type { ActionManager } from '@engine/manager/action/action-manager';
import type { InputEngine } from '@engine/manager/input/input-engine';
import { EntityInstance } from '../entity';
import { FieldPos } from './field-pos';
import { calcViewPort, resolveEntitiesLayers, resolvePlayerLayers, retrieveLayers, sortLayers } from './layer-resolver';
import { moveEntity, movePlayer, resolveMove } from './movement-controller';

export class FieldEngine {
  private state: FieldState;

  constructor(
    private ctx: GameContext,
    private field: Field,
    initialState: FieldState,
    private actionManager: ActionManager
  ) {
    this.state = initialState;
  }

  static async factory(ctx: GameContext, players: Player[], actionManager: ActionManager) {
    const actions: Queue<Action> = new Queue();
    await Promise.all(
      ctx.manifest.initialState.field.actionIds.map(async (actionId) => {
        actions.push((await ctx.resources.get(actionId, 'action')) as Action);
      })
    );
    const field = await ctx.resources.get(ctx.manifest.initialState.field.fieldId, 'field');
    const fieldPosConfig = {
      moveDurationMs: ctx.manifest.config.moveDurationMs,
      blockSize: ctx.manifest.config.blockSize,
      initialPos: ctx.manifest.initialState.field.pos,
      initialDirection: ctx.manifest.initialState.field.direction,
    };

    const playerPos = new FieldPos(ctx, fieldPosConfig);
    const entities = Object.fromEntries(
      Object.entries(field.entityInstances ?? []).map(([instanceId, { entityId, initialState }]) => [
        instanceId,
        new EntityInstance(ctx, field.entities.get(entityId)!, initialState),
      ])
    );
    return new this(
      ctx,
      field,
      {
        playerPos,
        players,
        actions,
        entities,
      },
      actionManager
    );
  }

  movePlayer = (nowMs: number, movement: Movement) => {
    return movePlayer(this.state, this.field, calcDest, samePos, nowMs, movement);
  };

  moveEntity = (nowMs: number, entityId: string, movement: Movement) => {
    return moveEntity(this.state, this.field, calcDest, samePos, nowMs, entityId, movement);
  };

  checkTargetEntity = (): EntityInstance | undefined => {
    const target = move(this.state.playerPos.current, this.state.playerPos.direction);
    return Object.values(this.state.entities).find(
      (entity) => entity.state.visible && samePos(target, entity.state.pos.getDestination())
    );
  };

  onCheck = () => {
    const action = this.checkTargetEntity()?.getAction('onCheck');
    if (action == null) return;
    this.actionManager.start(action);
  };

  onTick = (input: InputEngine<RpgKey>, nowMs: number, renderer: GameRenderer) => {
    this.tickPlayerCheck(input);
    this.tickPlayerMove(input, nowMs);
    this.tickPlayerPos(nowMs);
    this.tickEntities(nowMs);
    this.renderField(nowMs, renderer);
  };

  private tickPlayerCheck(input: InputEngine<RpgKey>) {
    if (input.triggered.enter === true) this.onCheck();
  }

  calcViewPort = (nowMs: number) => {
    return calcViewPort(nowMs, this.state, this.ctx);
  };

  resolvePlayerLayers = (nowMs: number, viewport: Rect): LayerWithPos[] => {
    return resolvePlayerLayers(nowMs, viewport, this.state, this.ctx.manifest.config);
  };

  resolveEntitiesLayers = (nowMs: number, viewport: Rect): LayerWithPos[] => {
    return resolveEntitiesLayers(nowMs, viewport, this.state, this.ctx.manifest.config);
  };

  retrieveLayers = (nowMs: number, viewport: Rect): LayerWithPos[] => {
    return retrieveLayers(nowMs, viewport, this.state, this.ctx.manifest.config, this.field);
  };

  renderField = (nowMs: number, renderer: GameRenderer) => {
    const viewport = this.calcViewPort(nowMs);
    const sortedLayers = sortLayers(this.retrieveLayers(nowMs, viewport));
    this.renderLayers(sortedLayers, renderer);
  };

  retrieveSortedLayers = (nowMs: number): LayerWithPos[] => {
    const viewport = this.calcViewPort(nowMs);
    return sortLayers(this.retrieveLayers(nowMs, viewport));
  };

  renderLayers = (layers: LayerWithPos[], renderer: GameRenderer) => {
    const images = layers.map(({ rect, layer }) => ({
      pos: { x: rect.left, y: rect.top },
      imageId: layer.image,
    }));
    renderer.render(images);
  };

  tickPlayerMove = (input: InputEngine<RpgKey>, nowMs: number) => {
    const moveDirection = resolveMove(input);
    if (moveDirection != null)
      this.movePlayer(nowMs, { command: 'walk', direction: moveDirection, async: true, force: false });
  };

  tickPlayerPos = (nowMs: number) => {
    this.state.playerPos.tick(nowMs);
  };

  tickEntities = (nowMs: number) => {
    Object.values(this.state.entities).forEach((entity) => entity.state.pos.tick(nowMs));
  };
}
