import type { Game, GameRenderer } from '@tetsup/web2d';
import type { RpgKey, RpgMode } from '@sharedTypes/engine';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import { ResourceConfig } from '@sharedTypes/config';
import { GameContext } from '@engine/resource/core/game-context';
import type { Player } from '@engine/resource/domain/player';
import { ActionManager } from './manager/action/action-manager';
import { FieldEngine } from './manager/field/field-core';
import { PanelManager } from './manager/panel/panel-manager';
import { DEFAULT_RPG_KEYS, InputEngine } from './manager/input/input-engine';
import { StatManager } from './manager/stat';

type RawInput = Parameters<InputEngine<RpgKey>['tick']>[1];

export class RpgCore implements Game<RpgKey> {
  private ctx: GameContext;
  private input: InputEngine;
  private panels: PanelManager;
  private actions: ActionManager;
  private mode: RpgMode = 'field';
  private field: FieldEngine | null = null;
  private players: Player[] = [];
  readonly stat: StatManager;

  constructor(manifest: ManifestData, config: ResourceConfig) {
    this.ctx = new GameContext(manifest, config);
    this.input = new InputEngine(DEFAULT_RPG_KEYS);
    this.panels = new PanelManager(this.ctx);
    this.ctx.panels = this.panels;
    this.actions = new ActionManager(this.ctx, this.panels);
    this.stat = new StatManager();
  }

  onInit = async (renderer: GameRenderer) => {
    this.ctx.assets.setRenderer(renderer);
    this.input.reset();
    this.players = await Promise.all(
      this.ctx.manifest.initialState.core.players.map(
        async (playerId: string) => await this.ctx.resources.get(playerId, 'player')
      )
    );
    this.field = await FieldEngine.factory(this.ctx, this.players, this.actions);
    this.mode = 'field';
    console.log('init comp');
    return true;
  };

  onTick = async (input: RawInput, nowMs: number, renderer: GameRenderer) => {
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
