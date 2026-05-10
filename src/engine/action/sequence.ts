import type { SequenceData } from '@/schemas/action/sequence';
import type { PrimitiveValue } from '@/schemas/common';
import type { ConditionData } from '@/schemas/condition';
import type { GameContext } from '@/resource/core/game-context';
import type { PanelManager } from '../panel/panel-manager';
import { Message } from '../panel/message-panel';

type RunningStatus = 'init' | 'running' | 'done';

type MethodReturnValue = number | string | void;

export class ExternalMethod {
  status: RunningStatus;
  returnValue?: MethodReturnValue;

  constructor(method: () => Promise<MethodReturnValue>) {
    this.status = 'running';
    method().then((returnValue) => {
      this.status = 'done';
      this.returnValue = returnValue;
    });
  }
}

export class Sequence {
  currentIndex: number = 0;
  nextIndex: number = 0;
  blockingPlayerInput: boolean = false;
  blockingParallelActions: boolean = false;
  externals: Map<number, ExternalMethod> = new Map();
  variables: Map<number, PrimitiveValue> = new Map();
  status: RunningStatus = 'init';

  constructor(
    private ctx: GameContext,
    private panelManager: PanelManager,
    private sequenceData: SequenceData
  ) {}

  nextCommand = () => {
    switch (this.status) {
      case 'init':
        this.status = 'running';
        this.currentIndex = 0;
        break;
      case 'running':
        if (this.nextIndex >= this.sequenceData.length) {
          this.status = 'done';
          return;
        }
    }
    this.runCurrent();
  };

  private runCurrent = () => {
    const element = this.sequenceData[this.currentIndex];
    if (element.command === 'sendMessage') {
      this.nextIndex = this.currentIndex + 1;
      this.sendMessage(
        this.currentIndex,
        element.messages.map((message) => ({ type: 'simple', message: message }))
      );
    }
  };

  private sendMessage = (index: number, messages: Message[]) => {
    this.externals.set(index, new ExternalMethod(async () => await this.panelManager.openMessages(messages)));
  };

  private evaluateCondition(condition: ConditionData): boolean {
    if ('all' in condition) return condition.all.every((child: ConditionData) => this.evaluateCondition(child));
    if ('any' in condition) return condition.any.some((child: ConditionData) => this.evaluateCondition(child));

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
      default:
        return false;
    }
  }

  private getVariable(path: string): PrimitiveValue | undefined {
    const value = this.ctx?.state.variables.get(path);
    if (typeof value === 'string' || typeof value === 'number') return value;
    return undefined;
  }

  private checkExternal = (index: number): boolean => {
    const external = this.externals.get(index);
    if (external == null) return true;
    if (external.status === 'done') {
      external.returnValue != null && this.variables.set(index, external.returnValue);
      return true;
    }
    return false;
  };

  tick = () => {
    if (this.status === 'done') return;
    if (this.status === 'running' && !this.checkExternal(this.currentIndex)) return;
    this.nextCommand();
  };
}
