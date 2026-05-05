import type { InputManager } from '@tetsup/web2d';
import type { GameContext } from '@/resource/core/game-context';
import type { RpgKey } from '@/types/engine';
import { MessagePanel, type Message } from './message-panel';

export type PanelInput = {
  [K in RpgKey]?: boolean;
};

export type PanelTickInput = InputManager<RpgKey> | PanelInput;

type ManagedPanelTick = ((input: unknown) => void | boolean) | ((nowMs: number, enter: boolean, esc: boolean) => boolean);

export interface ManagedPanel {
  id: string;
  active: boolean;
  tick?: ManagedPanelTick;
  render?(): void;
  onOpen?(): void;
  onClose?(): void;
  onActive?(): void;
  onInactive?(): void;
  isClosed?: boolean;
  sendKey?(key: RpgKey): void;
}

export class PanelManager {
  private readonly buttons: Record<RpgKey, boolean> = {
    left: false,
    right: false,
    up: false,
    down: false,
    enter: false,
    esc: false,
  };
  private readonly stack: ManagedPanel[] = [];

  constructor(private readonly ctx?: GameContext) {}

  async open(id: string): Promise<void> {
    if (!this.ctx) throw new Error('PanelManager requires GameContext to open panel resources.');
    const panel = await this.ctx.resources.get(id, 'panel');
    this.push(panel);
  }

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

  tick(nowMsOrInput?: number | PanelTickInput, input?: PanelTickInput): boolean {
    const legacyInput = typeof nowMsOrInput === 'number' ? undefined : nowMsOrInput;
    const panelInput = typeof nowMsOrInput === 'number' ? input : nowMsOrInput;
    const edges = this.resolveInputEdges(panelInput);
    const panel = this.top();
    if (!panel) return false;

    const nowMs = typeof nowMsOrInput === 'number' ? nowMsOrInput : 0;
    this.tickPanel(panel, nowMs, edges, legacyInput);
    if (panel.isClosed === true) this.pop();
    return true;
  }

  render(): void {
    for (const panel of this.stack) {
      panel.render?.();
    }
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

  private tickPanel(panel: ManagedPanel, nowMs: number, input: PanelInput, legacyInput?: PanelTickInput): void {
    if (this.isMessagePanel(panel)) {
      panel.tick(nowMs, input.enter === true, input.esc === true);
      return;
    }
    this.sendEdgeKeys(panel, input);
    if (!panel.tick) return;
    panel.tick(legacyInput ?? input);
  }

  private sendEdgeKeys(panel: ManagedPanel, input: PanelInput): void {
    if (!panel.sendKey) return;
    for (const key of this.keys()) {
      if (input[key] === true) panel.sendKey(key);
    }
  }

  private resolveInputEdges(input?: PanelTickInput): PanelInput {
    const edges: PanelInput = {};
    for (const key of this.keys()) {
      const pressed = this.isPressed(input, key);
      edges[key] = !this.buttons[key] && pressed;
      this.buttons[key] = pressed;
    }
    return edges;
  }

  private isPressed(input: PanelTickInput | undefined, key: RpgKey): boolean {
    if (!input) return false;
    if (this.isInputManager(input)) return input.isPressed(key);
    return input[key] === true;
  }

  private isInputManager(input: PanelTickInput): input is InputManager<RpgKey> {
    return typeof (input as { isPressed?: unknown }).isPressed === 'function';
  }

  private keys(): RpgKey[] {
    return ['left', 'right', 'up', 'down', 'enter', 'esc'];
  }

  private isMessagePanel(
    panel: ManagedPanel
  ): panel is ManagedPanel & { tick: (nowMs: number, enter: boolean, esc: boolean) => boolean } {
    return panel.tick !== undefined && 'status' in panel;
  }

  private syncActiveState(): void {
    const topIndex = this.stack.length - 1;
    this.stack.forEach((panel, index) => {
      panel.active = index === topIndex;
    });
  }
}
