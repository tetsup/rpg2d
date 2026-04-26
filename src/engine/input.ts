import type { InputManager } from '@tetsup/web2d';
import type { RpgKey } from '@/types/engine';

export class InputEngine {
  lastState: InputManager<RpgKey>['state'];
  constructor(private input: InputManager<RpgKey>) {
    this.lastState = input.state;
  }

  toCommand = () => {
    this.lastState.left;
  };
}
