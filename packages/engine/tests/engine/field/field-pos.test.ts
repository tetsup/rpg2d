/**
 * - calcDest はモックしない（実実装を使用）
 * - FieldPos の外部仕様として移動先が正しいことまで検証
 * - util 依存込みの振る舞いテスト
 */

import { FieldPos } from '@engine/manager/field/field-pos';

describe('FieldPos', () => {
  let ctx: any;
  let config: any;
  let pos: FieldPos;

  beforeEach(() => {
    ctx = {
      manifest: {
        config: {
          moveDurationMs: 300,
        },
      },
    };

    config = {
      moveDurationMs: 300,
      blockSize: {
        width: 16,
        height: 24,
      },
      initialPos: {
        x: 2,
        y: 3,
      },
      initialDirection: 'down',
    };

    pos = new FieldPos(ctx, config);
  });

  describe('constructor / getters', () => {
    it('初期位置を保持', () => {
      expect(pos.current).toEqual({ x: 2, y: 3 });
    });

    it('初期方向を保持', () => {
      expect(pos.direction).toBe('down');
    });

    it('初期状態では移動していない', () => {
      expect(pos.currentMovement).toBeNull();
    });

    it('初期 destination は current', () => {
      expect(pos.getDestination()).toEqual({ x: 2, y: 3 });
    });
  });

  describe('setDirection()', () => {
    it('向きを更新する', () => {
      pos.setDirection('left');

      expect(pos.direction).toBe('left');
    });
  });

  describe('move()', () => {
    it('right 移動で destination が +1 される', () => {
      pos.move(1000, {
        command: 'walk',
        direction: 'right',
      } as any);

      expect(pos.getDestination()).toEqual({ x: 3, y: 3 });
    });

    it('left 移動で destination が -1 される', () => {
      pos.move(1000, {
        command: 'walk',
        direction: 'left',
      } as any);

      expect(pos.getDestination()).toEqual({ x: 1, y: 3 });
    });

    it('up 移動で destination y が -1', () => {
      pos.move(1000, {
        command: 'walk',
        direction: 'up',
      } as any);

      expect(pos.getDestination()).toEqual({ x: 2, y: 2 });
    });

    it('down 移動で destination y が +1', () => {
      pos.move(1000, {
        command: 'walk',
        direction: 'down',
      } as any);

      expect(pos.getDestination()).toEqual({ x: 2, y: 4 });
    });

    it('durationMs 未指定時は manifest 設定値を使う', () => {
      pos.move(1000, {
        command: 'walk',
        direction: 'down',
      } as any);

      expect(pos.currentMovement?.durationMs).toBe(300);
    });

    it('durationMs 指定時は上書きされる', () => {
      pos.move(1000, {
        command: 'walk',
        direction: 'down',
        durationMs: 900,
      } as any);

      expect(pos.currentMovement?.durationMs).toBe(900);
    });
  });

  describe('tick()', () => {
    it('移動していない場合は変化しない', () => {
      pos.tick(1000);

      expect(pos.current).toEqual({ x: 2, y: 3 });
      expect(pos.currentMovement).toBeNull();
    });

    it('移動途中では current は変わらない', () => {
      pos.move(1000, {
        command: 'walk',
        direction: 'down',
      } as any);

      pos.tick(1200);

      expect(pos.current).toEqual({ x: 2, y: 3 });
      expect(pos.currentMovement).not.toBeNull();
    });

    it('duration 到達で current 更新', () => {
      pos.move(1000, {
        command: 'walk',
        direction: 'down',
      } as any);

      pos.tick(1300);

      expect(pos.current).toEqual({ x: 2, y: 4 });
    });

    it('duration 到達で movement 終了', () => {
      pos.move(1000, {
        command: 'walk',
        direction: 'down',
      } as any);

      pos.tick(1300);

      expect(pos.currentMovement).toBeNull();
    });

    it('duration 超過でも正常完了', () => {
      pos.move(1000, {
        command: 'walk',
        direction: 'right',
      } as any);

      pos.tick(9999);

      expect(pos.current).toEqual({ x: 3, y: 3 });
      expect(pos.currentMovement).toBeNull();
    });
  });

  describe('getCurrentPixel()', () => {
    it('停止中は tile座標 × blockSize', () => {
      expect(pos.getCurrentPixel(1000)).toEqual({
        x: 32,
        y: 72,
      });
    });

    it('右移動50%で中間座標', () => {
      pos.move(1000, {
        command: 'walk',
        direction: 'right',
        durationMs: 400,
      } as any);

      expect(pos.getCurrentPixel(1200)).toEqual({
        x: 40, // 2.5 * 16
        y: 72,
      });
    });

    it('下移動50%で中間座標', () => {
      pos.move(1000, {
        command: 'walk',
        direction: 'down',
        durationMs: 400,
      } as any);

      expect(pos.getCurrentPixel(1200)).toEqual({
        x: 32,
        y: 84, // 3.5 * 24
      });
    });

    it('開始直後は current 座標', () => {
      pos.move(1000, {
        command: 'walk',
        direction: 'right',
        durationMs: 400,
      } as any);

      expect(pos.getCurrentPixel(1000)).toEqual({
        x: 32,
        y: 72,
      });
    });
  });
});
