import type { Command, Sequence } from '@/engine/action/action-manager';
import type { Message } from '@/engine/panel/message-panel';
import type { ActionData, ActionDeps } from '@/schemas/action/action';
import { ResourceBase } from '../core/resource-base';

export class Action extends ResourceBase<'action'> {
  static async loadDeps(): Promise<ActionDeps> {
    return {};
  }

  toSequence = (): Sequence => ({
    blockPlayerInput: true,
    blockParallelActions: false,
    commands: [...this.data.sequence.map(this.toCommand), { type: 'end' }],
  });

  private toCommand = (element: ActionData['sequence'][number]): Command => {
    switch (element.command) {
      case 'sendMessage':
        return {
          type: 'message',
          messages: element.messages.map((message): Message => ({ type: 'simple', message })),
        };
    }
  };
}
