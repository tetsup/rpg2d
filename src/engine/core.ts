import type { InputManager, Game, GameRenderer } from '@tetsup/web2d';
import type { RpgKey, RpgMode } from '@/types/engine';
import type { Manifest } from '@/schemas/manifest';
import { ResourceConfig } from '@/schemas/resource-config';
import { GameContext } from '@/resource/core/game-context';
import type { Player } from '@/resource/domain/player';
import { FieldEngine } from './field/field-core';

export class RpgCore implements Game<RpgKey> {
  private ctx: GameContext;
  private mode: RpgMode = 'field';
  private field: FieldEngine | null = null;
  private players: Player[] = [];
  constructor(manifest: Manifest, config: ResourceConfig) {
    this.ctx = new GameContext(manifest, config);
  }

  onInit = async (renderer: GameRenderer) => {
    try {
      this.players = await Promise.all(
        this.ctx.manifest.initialState.core.players.map(
          async (playerId) => (await this.ctx.resources.get(playerId, 'player')) as Player
        )
      );
      this.field = await FieldEngine.factory(this.ctx, this.players);
      this.mode = 'field';
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  onTick = async (input: InputManager<RpgKey>, clock: number, renderer: GameRenderer) => {
    switch (this.mode) {
      case 'field':
        this.field?.onTick(input, clock, renderer);
        break;
      default:
        break;
    }
    return true;
  };
}
