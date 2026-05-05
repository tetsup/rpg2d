import { MessagePanel, type Message } from '@/engine/panel/message-panel';
import { PanelManager, type PanelInput, type ManagedPanel } from '@/engine/panel/panel-manager';
import type { GameContext } from '@/resource/core/game-context';
import type { Panel } from '@/resource/domain/panel/panel';
import type { PrimitiveValue } from '@/schemas/common';
import type { Condition } from '@/schemas/condition';

export type Command =
  | { type: 'message'; messages: Message[] }
  | { type: 'wait'; ticks: number }
  | { type: 'branch'; condition: Condition; trueTo: number; falseTo: number }
  | { type: 'jump'; to: number }
  | { type: 'end' };

type LegacyCommand = () => void;
type SupportedCommand = Command | LegacyCommand;

export interface Sequence {
  blockPlayerInput: boolean;
  blockParallelActions: boolean;
  commands: SupportedCommand[];
}

export type ActionStartContext = {
  parallel?: boolean;
};

export type ActionManagerDeps = {
  ctx?: GameContext;
  panelManager?: PanelManager;
};

type RunningSequence = {
  sequence: Sequence;
  index: number;
  parallel: boolean;
  waitRemaining?: number;
  waitingPanel?: ManagedPanel;
  openingPanel: boolean;
  done: boolean;
};

export class ActionManager {
  private readonly panelManager?: PanelManager;
  private readonly ctx?: GameContext;
  private readonly running: RunningSequence[] = [];

  constructor(deps: ActionManagerDeps = {}) {
    this.ctx = deps.ctx;
    this.panelManager = deps.panelManager ?? deps.ctx?.panels;
  }

  start(sequence: Sequence, runtimeContext: ActionStartContext = {}): void {
    this.running.push({
      sequence,
      index: 0,
      parallel: runtimeContext.parallel === true,
      openingPanel: false,
      done: false,
    });
  }

  tick(nowMs = 0, input: PanelInput = {}): void {
    this.panelManager?.tick(nowMs, input);

    for (const item of this.running) {
      if (item.done) continue;
      if (this.isParallelBlocked(item)) continue;
      this.tickSequence(item);
    }
    this.removeDone();
  }

  hasPlayerBlock(): boolean {
    return this.running.some((item) => !item.done && item.sequence.blockPlayerInput);
  }

  hasParallelBlock(): boolean {
    return this.running.some((item) => !item.done && item.sequence.blockParallelActions);
  }

  count(): number {
    return this.running.filter((item) => !item.done).length;
  }

  runFieldActions(nowMs = 0): void {
    for (const item of this.running) {
      if (item.done) continue;
      if (this.isParallelBlocked(item)) continue;
      this.tickSequence(item);
    }
    this.removeDone();
  }

  clear(): void {
    this.running.length = 0;
  }

  private tickSequence(item: RunningSequence): void {
    if (this.releaseWaitingPanel(item)) return;
    if (item.openingPanel) return;
    if (this.tickWait(item)) return;

    while (item.index < item.sequence.commands.length && !item.done) {
      const command = item.sequence.commands[item.index];
      if (typeof command === 'function') {
        command();
        item.index += 1;
        continue;
      }

      if (this.runCommand(item, command)) return;
    }
  }

  private releaseWaitingPanel(item: RunningSequence): boolean {
    if (!item.waitingPanel) return false;
    if (item.waitingPanel.isClosed !== true) return true;
    item.waitingPanel = undefined;
    item.index += 1;
    return false;
  }

  private tickWait(item: RunningSequence): boolean {
    if (item.waitRemaining === undefined) return false;
    item.waitRemaining -= 1;
    if (item.waitRemaining <= 0) {
      item.waitRemaining = undefined;
      item.index += 1;
      return false;
    }
    return true;
  }

  private runCommand(item: RunningSequence, command: Command): boolean {
    switch (command.type) {
      case 'message':
        this.openMessagePanel(item, command.messages);
        return true;
      case 'wait':
        item.waitRemaining = command.ticks;
        return this.tickWait(item);
      case 'branch':
        item.index = this.evaluateCondition(command.condition) ? command.trueTo : command.falseTo;
        return false;
      case 'jump':
        item.index = command.to;
        return false;
      case 'end':
        item.done = true;
        return true;
    }
  }

  private openMessagePanel(item: RunningSequence, messages: Message[]): void {
    if (!this.ctx || !this.panelManager) {
      throw new Error('ActionManager requires ctx and panelManager to run message commands.');
    }

    item.openingPanel = true;
    void this.createMessagePanel(messages)
      .then((panel) => {
        this.panelManager?.push(panel);
        item.waitingPanel = panel;
      })
      .finally(() => {
        item.openingPanel = false;
      });
  }

  private async createMessagePanel(messages: Message[]): Promise<MessagePanel> {
    if (!this.ctx) throw new Error('ActionManager requires ctx to create message panels.');
    const panel = await this.ctx.resources.get(this.ctx.manifest.config.defaultMessagePanel, 'panel');
    return new MessagePanel(this.ctx, panel as Panel, this.ctx.manifest.config.messageConfig, messages);
  }

  private evaluateCondition(condition: Condition): boolean {
    if ('all' in condition) return condition.all.every((child) => this.evaluateCondition(child));
    if ('any' in condition) return condition.any.some((child) => this.evaluateCondition(child));

    const actual = this.getVariable(condition.path);
    switch (condition.operator) {
      case '==':
        return actual === condition.value;
      case '!=':
        return actual !== condition.value;
      case '<':
        return typeof actual === 'number' && typeof condition.value === 'number' && actual < condition.value;
      case '<=':
        return typeof actual === 'number' && typeof condition.value === 'number' && actual <= condition.value;
      case '>':
        return typeof actual === 'number' && typeof condition.value === 'number' && actual > condition.value;
      case '>=':
        return typeof actual === 'number' && typeof condition.value === 'number' && actual >= condition.value;
    }
  }

  private getVariable(path: string): PrimitiveValue | undefined {
    const value = this.ctx?.state.variables.get(path);
    if (typeof value === 'string' || typeof value === 'number') return value;
    return undefined;
  }

  private removeDone(): void {
    for (let index = this.running.length - 1; index >= 0; index -= 1) {
      if (this.running[index]?.done) this.running.splice(index, 1);
    }
  }

  private isParallelBlocked(item: RunningSequence): boolean {
    return item.parallel && this.running.some((other) => other !== item && !other.done && other.sequence.blockParallelActions);
  }
}
