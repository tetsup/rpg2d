import type { InputManager, GameRenderer } from '@tetsup/web2d';
import type { Direction2d, FieldState, Point2d, RpgKey } from '@/types/engine';
import { Queue } from '@/utils/queue';
import { calcDest, samePos } from '@/utils/pos';
import { Rect } from '@/utils/rect';
import type { GameContext } from '@/resource/core/game-context';
import type { Player } from '@/resource/domain/player';
import type { Action } from '@/resource/domain/action';
import type { Field } from '@/resource/domain/field';
import { Movement } from '@/schemas/actions/movement';
import { FieldPos } from './fieldPos';
import { EntityInstance } from './entity';

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
    return Object.values(this.state.entities).some(
      (entity) => !entity.state.allowOverwrap && samePos(dest, entity.state.pos.getDestination())
    );
  };

  checkTileReachable = (dest: Point2d): boolean => {
    return this.field.checkReachable(dest);
  };

  checkReachable = (dest: Point2d): boolean => {
    return this.checkTileReachable(dest) && !this.checkEntityInhibit(dest);
  };

  movePlayer = (nowMs: number, movement: Movement) => {
    if (this.state.playerPos.currentMovement != null) return;
    if (this.checkReachable(calcDest(this.state.playerPos.current, movement)))
      this.state.playerPos.move(nowMs, movement);
  };

  moveEntity = (nowMs: number, entityId: string, movement: Movement) => {
    const entity = this.state.entities[entityId];
    if (entity.state.pos.currentMovement != null) return;
    const dest = calcDest(entity.state.pos.current, movement);
    if (this.checkReachable(dest) && !samePos(this.state.playerPos.getDestination(), dest))
      entity.state.pos.move(nowMs, movement);
  };

  resolveMove = (input: InputManager<RpgKey>): Direction2d | null => {
    if (input.isPressed('left')) return 'left';
    if (input.isPressed('right')) return 'right';
    if (input.isPressed('up')) return 'up';
    if (input.isPressed('down')) return 'down';
    return null;
  };

  onTick = (input: InputManager<RpgKey>, nowMs: number, renderer: GameRenderer) => {
    const moveDirection = this.resolveMove(input);
    if (moveDirection != null)
      this.movePlayer(nowMs, { command: 'walk', direction: moveDirection, async: true, force: false });
    this.state.playerPos.tick(nowMs);
    Object.values(this.state.entities).forEach((entity) => entity.state.pos.tick(nowMs));
    const viewport = this.calcViewPort(nowMs);
    renderer.render(this.retrieveLayers(nowMs, viewport));
  };

  calcViewPort = (nowMs: number) => {
    const anchorLeftTop = this.state.playerPos.getCurrentPixel(nowMs);
    const cameraCenter = {
      x: anchorLeftTop.x + (this.ctx.manifest.config.blockSize.width >> 1),
      y: anchorLeftTop.y + (this.ctx.manifest.config.blockSize.height >> 1),
    };
    const width = this.ctx.manifest.config.screen.width;
    const height = this.ctx.manifest.config.screen.height;
    return new Rect(cameraCenter.x - (width >> 1), cameraCenter.y - (height >> 1), width, height);
  };

  resolvePlayerLayers = (nowMs: number) => {
    return this.state.players.flatMap((player) => {
      const rect = Rect.fromTopLeft(this.state.playerPos.getCurrentPixel(nowMs), this.ctx.manifest.config.blockSize);
      return player.skin.resolveLayers(nowMs, this.state.playerPos.direction).map((layer) => ({ rect, layer }));
    });
  };

  resolveEntitiesLayers = (nowMs: number, viewport: Rect) => {
    return Object.entries(this.state.entities)
      .filter(([_, entity]) => entity.state.visible)
      .map(([_, entity]) => {
        const rect = Rect.fromTopLeft(entity.state.pos.getCurrentPixel(nowMs), this.ctx.manifest.config.blockSize);
        return { rect, entity };
      })
      .filter(({ rect }) => rect.overwrap(viewport))
      .map(({ rect, entity }) => {
        const layers = entity.resolveLayers(nowMs);
        return layers.map((layer) => ({ rect, layer }));
      })
      .flat(1);
  };

  retrieveLayers = (nowMs: number, viewport: Rect) => {
    const playerLayers = this.resolvePlayerLayers(nowMs);
    const entityLayers = this.resolveEntitiesLayers(nowMs, viewport);
    const tileLayers = this.field.resolveLayers(nowMs, viewport);
    return [...playerLayers, ...entityLayers, ...tileLayers];
  };
}
