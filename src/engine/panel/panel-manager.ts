import type { GameContext } from '@/resource/core/game-context';
import type { LayerWithPos, RpgKey } from '@/types/engine';
import type { InputEngine } from '@/engine/input/input-engine';
import { MessagePanel, type Message } from './message-panel';

export type PanelInput = {
  [K in RpgKey]?: boolean;
};

export type PanelTickInput = InputEngine<RpgKey>;

export interface ManagedPanel {
  id: string;
  active: boolean;
  tick?(nowMs: number, input: PanelInput): void | boolean;
  render(): void;
  onOpen?(): void;
  onClose?(): void;
  onActive?(): void;
  onInactive?(): void;
  isClosed?: boolean;
  sendKey?(key: RpgKey): void;
  resolveLayers(nowMs: number): LayerWithPos[];
}

export class PanelManager {
  private readonly stack: ManagedPanel[] = [];

  constructor(private readonly ctx?: GameContext) {}

  async openMessages(messages: Message[], panelId?: string): Promise<void> {
    if (!this.ctx) throw new Error('PanelManager requires GameContext to open message panels.');
    const panel = await this.ctx.resources.get(panelId ?? this.ctx.manifest.config.defaultMessagePanel, 'panel');
    this.push(new MessagePanel(this.ctx, panel, this.ctx.manifest.config.messageConfig, messages));
  }

  push(panel: ManagedPanel): void {
    this.assertPanel(panel);

    const currentTop = this.top();
    if (currentTop) {
      currentTop.active = false;
      currentTop.onInactive?.();
    }

    this.stack.push(panel);
    panel.active = true;
    panel.onOpen?.();
    panel.onActive?.();
    this.syncActiveState();
  }

  pop(): ManagedPanel | undefined {
    const closedPanel = this.stack.pop();
    if (!closedPanel) return undefined;

    closedPanel.active = false;
    closedPanel.onClose?.();

    const nextTop = this.top();
    if (nextTop) {
      nextTop.active = true;
      nextTop.onActive?.();
    }

    this.syncActiveState();
    return closedPanel;
  }

  replace(panel: ManagedPanel): ManagedPanel | undefined {
    const closedPanel = this.pop();
    this.push(panel);
    return closedPanel;
  }

  top(): ManagedPanel | undefined {
    return this.stack.at(-1);
  }

  hasOpenPanel(): boolean {
    return this.stack.length > 0;
  }

  tick(nowMs: number, input?: PanelTickInput): boolean {
    const edges = input ? { ...input.triggered } : {};
    const panelInput = input ? { ...input.pressed } : {};
    const panel = this.top();
    if (!panel) return false;

    this.tickPanel(panel, nowMs, edges, panelInput);
    if (panel.isClosed === true) this.pop();
    return true;
  }

  render(): void {
    for (const panel of this.stack) {
      panel.render();
    }
  }

  resolveLayers(nowMs: number): LayerWithPos[] {
    return this.stack.flatMap((panel) => panel.resolveLayers(nowMs));
  }

  size(): number {
    return this.stack.length;
  }

  clear(): void {
    while (this.stack.length > 0) {
      const panel = this.stack.pop();
      if (!panel) continue;
      panel.active = false;
      panel.onClose?.();
    }
  }

  private assertPanel(panel: ManagedPanel): void {
    if (panel === null || panel === undefined) {
      throw new TypeError('PanelManager requires a panel instance.');
    }
  }

  private tickPanel(panel: ManagedPanel, nowMs: number, edges: PanelInput, input: PanelInput): void {
    this.sendEdgeKeys(panel, edges);
    if (!panel.tick) return;
    panel.tick(nowMs, input);
  }

  private sendEdgeKeys(panel: ManagedPanel, input: PanelInput): void {
    if (!panel.sendKey) return;
    for (const key of this.keys()) {
      if (input[key] === true) panel.sendKey(key);
    }
  }

  private keys(): RpgKey[] {
    return ['left', 'right', 'up', 'down', 'enter', 'esc'];
  }

  private syncActiveState(): void {
    const topIndex = this.stack.length - 1;
    this.stack.forEach((panel, index) => {
      panel.active = index === topIndex;
    });
  }
}
