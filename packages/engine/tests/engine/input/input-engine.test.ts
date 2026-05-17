import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_RPG_KEYS, InputEngine } from '@/engine/input/input-engine';

type Key = 'left' | 'right' | 'up' | 'down' | 'enter' | 'esc';

describe('InputEngine', () => {
  let state: Partial<Record<Key, boolean>>;
  let input: {
    isPressed: (key: Key) => boolean;
  };

  beforeEach(() => {
    state = {};

    input = {
      isPressed: (key: Key) => state[key] === true,
    };
  });

  describe('tick()', () => {
    it('何も押していなければ全て空', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS);

      const result = engine.tick(1000, input as any);

      expect(result).toEqual({
        pressed: {},
        triggered: {},
        released: {},
        repeated: {},
      });
    });

    it('OFF→ON で triggered になる', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS);

      engine.tick(1000, input as any);

      state.enter = true;

      const result = engine.tick(1016, input as any);

      expect(result.pressed.enter).toBe(true);
      expect(result.triggered.enter).toBe(true);
      expect(result.released.enter).toBeUndefined();
    });

    it('押しっぱなしでは triggered されない', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS);

      state.enter = true;

      engine.tick(1000, input as any);

      const result = engine.tick(1016, input as any);

      expect(result.pressed.enter).toBe(true);
      expect(result.triggered.enter).toBeUndefined();
    });

    it('ON→OFF で released になる', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS);

      state.enter = true;
      engine.tick(1000, input as any);

      state.enter = false;

      const result = engine.tick(1016, input as any);

      expect(result.released.enter).toBe(true);
      expect(result.pressed.enter).toBeUndefined();
    });

    it('複数キー同時押しも判定できる', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS);

      state.left = true;
      state.enter = true;

      const result = engine.tick(1000, input as any);

      expect(result.triggered.left).toBe(true);
      expect(result.triggered.enter).toBe(true);
      expect(result.pressed.left).toBe(true);
      expect(result.pressed.enter).toBe(true);
    });
  });

  describe('repeat', () => {
    it('delay 前は repeated されない', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS, {
        delayMs: 300,
        intervalMs: 100,
      });

      state.down = true;
      engine.tick(1000, input as any);

      const result = engine.tick(1200, input as any);

      expect(result.repeated.down).toBeUndefined();
    });

    it('delay 到達で repeated される', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS, {
        delayMs: 300,
        intervalMs: 100,
      });

      state.down = true;
      engine.tick(1000, input as any);

      const result = engine.tick(1300, input as any);

      expect(result.repeated.down).toBe(true);
    });

    it('interval ごとに repeated される', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS, {
        delayMs: 300,
        intervalMs: 100,
      });

      state.down = true;

      engine.tick(1000, input as any); // trigger
      engine.tick(1300, input as any); // first repeat

      const result = engine.tick(1400, input as any);

      expect(result.repeated.down).toBe(true);
    });

    it('押し直しで repeat 状態はリセットされる', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS, {
        delayMs: 300,
        intervalMs: 100,
      });

      state.down = true;
      engine.tick(1000, input as any);

      state.down = false;
      engine.tick(1100, input as any);

      state.down = true;

      const result = engine.tick(1110, input as any);

      expect(result.triggered.down).toBe(true);
      expect(result.repeated.down).toBeUndefined();
    });
  });

  describe('isPressed()', () => {
    it('現在押されている状態を返す', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS);

      state.left = true;
      engine.tick(1000, input as any);

      expect(engine.isPressed('left')).toBe(true);
      expect(engine.isPressed('right')).toBe(false);
    });
  });

  describe('resolveDirection()', () => {
    it('left を返す', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS);

      state.left = true;
      engine.tick(1000, input as any);

      expect(engine.resolveDirection()).toBe('left');
    });

    it('left > right > up > down の優先順', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS);

      state.right = true;
      state.up = true;
      engine.tick(1000, input as any);

      expect(engine.resolveDirection()).toBe('right');

      state.left = true;
      engine.tick(1016, input as any);

      expect(engine.resolveDirection()).toBe('left');
    });

    it('方向キーがなければ null', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS);

      state.enter = true;
      engine.tick(1000, input as any);

      expect(engine.resolveDirection()).toBe(null);
    });
  });

  describe('reset()', () => {
    it('状態を初期化し、再度 trigger される', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS, {
        delayMs: 300,
        intervalMs: 100,
      });

      state.enter = true;
      engine.tick(1000, input as any);

      engine.reset();

      const result = engine.tick(1010, input as any);

      expect(result.triggered.enter).toBe(true);
    });

    it('現在の pressed snapshot も初期化する', () => {
      const engine = new InputEngine<Key>(DEFAULT_RPG_KEYS);

      state.enter = true;
      engine.tick(1000, input as any);

      engine.reset();

      expect(engine.isPressed('enter')).toBe(false);
      expect(engine.resolveDirection()).toBe(null);
    });
  });
});
