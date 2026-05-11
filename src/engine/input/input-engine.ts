import type { InputManager } from '@tetsup/web2d';
import type { RpgKey } from '@/types/engine';

export type InputSnapshot<K extends string = RpgKey> = Partial<Record<K, boolean>>;

export type RepeatConfig = {
  delayMs: number;
  intervalMs: number;
};

export type InputCommand<K extends string = RpgKey> = {
  pressed: InputSnapshot<K>;
  triggered: InputSnapshot<K>;
  released: InputSnapshot<K>;
  repeated: InputSnapshot<K>;
};

type RepeatState = {
  nextRepeatAtMs: number;
};

export const DEFAULT_RPG_KEYS = ['left', 'right', 'up', 'down', 'enter', 'esc'] as const;

export class InputEngine<K extends string = RpgKey> {
  private lastState: InputSnapshot<K> = {};
  private repeatState: Partial<Record<K, RepeatState>> = {};

  constructor(
    private readonly keys: readonly K[],
    private readonly repeatConfig?: RepeatConfig
  ) {}

  tick(nowMs: number, input: InputManager<K>): InputCommand<K> {
    const pressed: InputSnapshot<K> = {};
    const triggered: InputSnapshot<K> = {};
    const released: InputSnapshot<K> = {};
    const repeated: InputSnapshot<K> = {};

    for (const key of this.keys) {
      const current = input.isPressed(key);
      const prev = this.lastState[key] === true;

      if (current) pressed[key] = true;

      if (!prev && current) {
        triggered[key] = true;

        if (this.repeatConfig) {
          this.repeatState[key] = {
            nextRepeatAtMs: nowMs + this.repeatConfig.delayMs,
          };
        }
      }

      if (prev && !current) {
        released[key] = true;
        delete this.repeatState[key];
      }

      if (
        current &&
        prev &&
        this.repeatConfig &&
        this.repeatState[key] &&
        nowMs >= this.repeatState[key]!.nextRepeatAtMs
      ) {
        repeated[key] = true;
        this.repeatState[key]!.nextRepeatAtMs += this.repeatConfig.intervalMs;
      }

      this.lastState[key] = current;
    }

    return {
      pressed,
      triggered,
      released,
      repeated,
    };
  }

  isPressed(key: K, input: InputManager<K>): boolean {
    return input.isPressed(key);
  }

  resolveDirection(input: InputManager<K>): 'left' | 'right' | 'up' | 'down' | null {
    if (input.isPressed('left' as K)) return 'left';
    if (input.isPressed('right' as K)) return 'right';
    if (input.isPressed('up' as K)) return 'up';
    if (input.isPressed('down' as K)) return 'down';
    return null;
  }

  reset() {
    this.lastState = {};
    this.repeatState = {};
  }
}
