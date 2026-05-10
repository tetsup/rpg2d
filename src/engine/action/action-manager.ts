import type { PanelManager } from '@/engine/panel/panel-manager';
import type { GameContext } from '@/resource/core/game-context';
import type { Action } from '@/resource/domain/action';
import { Sequence } from './sequence';

export class ActionManager {
  private sequences: Sequence[] = [];

  constructor(
    private ctx: GameContext,
    private panelManager: PanelManager
  ) {}

  start = (action: Action) => {
    this.sequences.push(new Sequence(this.ctx, this.panelManager, action.getSequence()));
  };

  tick = () => {
    for (const sequence of this.sequences) {
      if (sequence.status === 'done') continue;
      if (this.isParallelBlocked(sequence)) continue;
      sequence.tick();
    }
    this.removeDone();
  };

  hasPlayerBlock = (): boolean => this.sequences.some((sequence) => sequence.blockingPlayerInput);

  hasParallelBlock = (): boolean => this.sequences.some((sequence) => sequence.blockingParallelActions);

  count = (): number => this.sequences.filter((sequence) => sequence.status === 'running').length;

  runnableSequences = () => {
    const blockingSequence = this.sequences.find(
      (sequence) => sequence.status === 'running' && sequence.blockingParallelActions
    );
    if (blockingSequence) return [blockingSequence];
    return this.sequences.filter((sequence) => sequence.status === 'running');
  };

  clear = () => {
    this.sequences = [];
  };

  private removeDone(): void {
    for (let index = this.sequences.length - 1; index >= 0; index -= 1) {
      if (this.sequences[index]?.status === 'done') this.sequences.splice(index, 1);
    }
  }

  private isParallelBlocked(sequence: Sequence): boolean {
    return this.sequences.some((other) => other !== sequence && other.blockingParallelActions);
  }
}
