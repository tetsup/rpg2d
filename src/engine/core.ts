import type { InputManager, Game, GameRenderer } from '@tetsup/web2d';
import type { RpgKey, RpgMode } from '@/types/engine';
import type { Manifest } from '@/schemas/manifest';
import { ResourceConfig } from '@/schemas/resource-config';
import { GameContext } from '@/resource/core/game-context';
import type { Player } from '@/resource/domain/player';
import { ActionManager } from './action/action-manager';
import { FieldEngine } from './field/field-core';
import { PanelManager } from './panel/panel-manager';

export class RpgCore implements Game<RpgKey> {
  private ctx: GameContext;
  private panels: PanelManager;
  private actions: ActionManager;
  private mode: RpgMode = 'field';
  private field: FieldEngine | null = null;
  private players: Player[] = [];
  constructor(manifest: Manifest, config: ResourceConfig) {
    this.ctx = new GameContext(manifest, config);
    this.panels = new PanelManager(this.ctx);
    this.ctx.panels = this.panels;
    this.actions = new ActionManager({ ctx: this.ctx, panelManager: this.panels });
  }

  onInit = async (renderer: GameRenderer) => {
    this.ctx.assets.setRenderer(renderer);
    this.players = await Promise.all(
      this.ctx.manifest.initialState.core.players.map(
        async (playerId) => await this.ctx.resources.get(playerId, 'player')
      )
    );
    this.field = await FieldEngine.factory(this.ctx, this.players, this.actions);
    this.mode = 'field';
    return true;
  };

  onTick = async (input: InputManager<RpgKey>, clock: number, renderer: GameRenderer) => {
    switch (this.mode) {
      case 'field':
        this.actions.tick(clock, input);
        this.panels.render();
        if (!this.panels.hasOpenPanel() && !this.actions.hasPlayerBlock()) {
          this.field?.onTick(input, clock, renderer);
        } else {
          this.field?.tickWorld(clock);
        }
        this.renderFieldWithPanels(clock, renderer);
        break;
      default:
        break;
    }
    return true;
  };

  private renderFieldWithPanels(clock: number, renderer: GameRenderer): void {
    const panelLayers = this.panels.resolveLayers(clock);
    this.field?.renderLayers([...this.field?.retrieveSortedLayers(clock), ...panelLayers], renderer);
  }
}
