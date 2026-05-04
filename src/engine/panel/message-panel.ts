import { GameContext } from '@/resource/core/game-context';
import { Panel } from '@/resource/domain/panel/panel';
import type { MessageConfig } from '@/schemas/manifest';
import { Queue } from '@/utils/queue';
import { Rect } from '@/utils/rect';

export type Message = {
  type: 'simple';
  message: string;
};

type MessageStatus =
  | {
      phase: 'running';
      currentMessage: string;
      currentPos: number;
      lastTickTime: number;
    }
  | {
      phase: 'waiting' | 'pause';
      currentMessage: string;
      currentPos: number;
    }
  | {
      phase: 'loading';
      currentMessage: string;
      currentPos: number;
    }
  | { phase: 'inActive' };

export class MessagePanel {
  status: MessageStatus;
  private messageRect: Rect;
  private queue: Queue<Message> = new Queue();

  constructor(
    private ctx: GameContext,
    private panel: Panel,
    private config: MessageConfig,
    messages: Message[] = []
  ) {
    const { left, right, top, bottom } = this.ctx.manifest.config.messageConfig.margin;
    this.messageRect = new Rect(
      left,
      top,
      (panel.panelRect.width - left - right) * 2,
      (panel.panelRect.height - top - bottom) * 2
    );
    this.status = { phase: 'loading', currentMessage: '', currentPos: 0 };
    this.addQueue(messages);
  }

  private updateStatus = (newStatus: MessageStatus) => {
    this.status = newStatus;
    this.render();
  };

  private tickCurrentMessage = (nowMs: number) => {
    if (this.status.phase !== 'running') return;
    const diff = Math.floor((nowMs - this.status.lastTickTime) / this.config.speedMs);
    if (this.status.currentPos + diff >= this.status.currentMessage.length)
      this.updateStatus({
        ...this.status,
        phase: 'waiting',
        currentPos: this.status.currentMessage.length,
      });
    else
      this.updateStatus({
        ...this.status,
        currentPos: this.status.currentPos + diff,
        lastTickTime: this.status.lastTickTime + diff * this.config.speedMs,
      });
  };

  private pop = (nowMs: number) => {
    if (this.status.phase !== 'loading') return;
    const next = this.queue.pop();
    if (next == null) return false;
    this.updateStatus({
      phase: 'running',
      currentMessage: this.status.currentMessage + next.message,
      currentPos: this.status.currentPos,
      lastTickTime: nowMs,
    });
  };

  private render = () => {
    if (this.status.phase === 'inActive') return;
    this.panel.setTextAreas([
      {
        rect: this.messageRect,
        message: this.status.currentMessage.slice(0, this.status.currentPos).split('\n'),
        overflowX: 'wrap',
        overflowY: 'scroll',
      },
    ]);
  };

  addQueue = (messages: Message[]) => messages.forEach((message) => this.queue.push(message));

  tick = (nowMs: number, enter: boolean, esc: boolean): boolean => {
    switch (this.status.phase) {
      case 'inActive':
        return false;
      case 'pause':
        return false;
      case 'loading':
        this.pop(nowMs);
        return true;
      case 'running':
        if (enter || esc)
          this.updateStatus({ ...this.status, phase: 'waiting', currentPos: this.status.currentMessage.length });
        else this.tickCurrentMessage(nowMs);
        return true;
      case 'waiting':
        if (enter || esc) this.updateStatus({ ...this.status, phase: 'loading' });
        return true;
    }
  };

  resume = () => {
    if (this.status.phase !== 'pause') throw new Error('cannot resume');
    this.updateStatus({ ...this.status, phase: 'loading' });
  };
}
