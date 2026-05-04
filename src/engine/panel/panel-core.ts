import { InputManager } from '@tetsup/web2d';
import { GameContext } from '@/resource/core/game-context';
import { Panel } from '@/resource/domain/panel/panel';
import { RpgKey } from '@/types/engine';
import { MessagePanel, type Message } from './message-panel';

export class PanelEngine {
  private panels: Panel[] = [];
  private messagePanel?: MessagePanel;
  private buttons: Record<RpgKey, boolean> = {
    left: false,
    right: false,
    up: false,
    down: false,
    enter: false,
    esc: false,
  };

  constructor(private ctx: GameContext) {}

  open = async (id: string) => {
    const top = await this.ctx.resources.get(id, 'panel');
    this.panels.push(top);
  };

  openMessages = async (messages: Message[], panelId?: string) => {
    const panel = await this.ctx.resources.get(panelId ?? this.ctx.manifest.config.defaultMessagePanel, 'panel');
    this.messagePanel = new MessagePanel(this.ctx, panel, this.ctx.manifest.config.messageConfig, messages);
  };

  tick = (nowMs: number, input: InputManager<RpgKey>): boolean => {
    const isMessageActive = this.messagePanel?.tick(nowMs, input.isPressed('enter'), input.isPressed('esc'));
    if (isMessageActive) return true;
    const currentPanel = this.panels.at(-1);
    if (!currentPanel) return false;
    (['left', 'right', 'up', 'down', 'enter', 'esc'] as RpgKey[]).forEach((key) => {
      if (!this.buttons[key] && input.isPressed(key)) {
        this.buttons[key] = true;
        currentPanel.sendKey(key);
      } else if (this.buttons[key] && !input.isPressed(key)) this.buttons[key] = false;
    });
    return true;
  };
}
