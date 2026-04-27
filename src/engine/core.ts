import type { InputManager, Game, GameRenderer } from '@tetsup/web2d';
import type { RpgKey, RpgMode } from '@/types/engine';
import type { Manifest } from '@/schemas/manifest';
import { GameContext } from '@/resource/core/game-context';
import { FieldEngine } from './field';
import type { Player } from '@/resource/domain/player';
import { ResourceConfig } from '@/schemas/resource-config';

export class RpgCore implements Game<RpgKey> {
  private ctx: GameContext;
  private mode: RpgMode = 'field';
  private field: FieldEngine | null = null;
  private players: Player[] = [];
  constructor(manifest: Manifest, config: ResourceConfig) {
    this.ctx = new GameContext(manifest, config);
  }

  onInit = async (renderer: GameRenderer) => {
    this.players = await Promise.all(
      this.ctx.manifest.initialState.core.players.map(
        async (playerId) => (await this.ctx.resources.get(playerId, 'player')) as Player
      )
    );
    this.field = await FieldEngine.factory(this.ctx, this.players);
    return true;
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
