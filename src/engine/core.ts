import type { InputManager, Game, GameRenderer } from '@tetsup/web2d';
import type { RpgKey, RpgMode } from '@/types/engine';
import type { Manifest } from '@/schemas/manifest';
import { ResourceConfig } from '@/schemas/resource-config';
import { GameContext } from '@/resource/core/game-context';
import type { Player } from '@/resource/domain/player';
import { ActionManager } from './action/action-manager';
import { FieldEngine } from './field/field-core';
import { PanelManager } from './panel/panel-manager';
import { DEFAULT_RPG_KEYS, InputEngine } from './input/input-engine';

export class RpgCore implements Game<RpgKey> {
  private ctx: GameContext;
  private input: InputEngine;
  private panels: PanelManager;
  private actions: ActionManager;
  private mode: RpgMode = 'field';
  private field: FieldEngine | null = null;
  private players: Player[] = [];

  constructor(manifest: Manifest, config: ResourceConfig) {
    this.ctx = new GameContext(manifest, config);
    this.input = new InputEngine(DEFAULT_RPG_KEYS);
    this.panels = new PanelManager(this.ctx);
    this.ctx.panels = this.panels;
    this.actions = new ActionManager(this.ctx, this.panels);
  }

  onInit = async (renderer: GameRenderer) => {
    this.ctx.assets.setRenderer(renderer);
    this.input.reset();
    this.players = await Promise.all(
      this.ctx.manifest.initialState.core.players.map(
        async (playerId) => await this.ctx.resources.get(playerId, 'player')
      )
    );
    this.field = await FieldEngine.factory(this.ctx, this.players, this.actions);
    this.mode = 'field';
    return true;
  };

  onTick = async (input: InputManager<RpgKey>, nowMs: number, renderer: GameRenderer) => {
    this.input.tick(nowMs, input);
    switch (this.mode) {
      case 'field':
        this.actions.tick();
        this.panels.tick(nowMs, this.input);
        this.panels.render();
        if (!this.panels.hasOpenPanel() && !this.actions.hasPlayerBlock()) {
          this.field?.onTick(this.input, nowMs, renderer);
        }
        this.renderFieldWithPanels(nowMs, renderer);
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
