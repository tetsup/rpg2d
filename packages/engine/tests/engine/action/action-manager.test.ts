import { ActionManager } from '@engine/manager/action/action-manager';
import { Sequence } from '@engine/manager/action/sequence';

vi.mock('@/engine/action/sequence', () => {
  class MockSequence {
    status: 'init' | 'running' | 'done' = 'running';
    blockingPlayerInput = false;
    blockingParallelActions = false;
    tick = vi.fn();

    constructor(
      public ctx: unknown,
      public panelManager: unknown,
      public sequenceData: unknown
    ) {}
  }

  return {
    Sequence: MockSequence,
  };
});

describe('ActionManager', () => {
  let ctx: any;
  let panelManager: any;
  let manager: ActionManager;

  beforeEach(() => {
    ctx = {};

    panelManager = {};

    manager = new ActionManager(ctx, panelManager);
  });

  const createAction = (sequenceData: any[] = []) => ({
    getSequence: vi.fn(() => sequenceData),
  });

  const getSequences = (): any[] => (manager as any).sequences;

  describe('start()', () => {
    it('Action から Sequence を生成して追加する', () => {
      const action = createAction([{ command: 'sendMessage' }]);

      manager.start(action as any);

      const sequences = getSequences();

      expect(sequences).toHaveLength(1);
      expect(action.getSequence).toHaveBeenCalledTimes(1);
      expect(sequences[0]).toBeInstanceOf(Sequence);
      expect(sequences[0].ctx).toBe(ctx);
      expect(sequences[0].panelManager).toBe(panelManager);
      expect(sequences[0].sequenceData).toEqual([{ command: 'sendMessage' }]);
    });

    it('複数 start で蓄積される', () => {
      manager.start(createAction([{ id: 1 }]) as any);
      manager.start(createAction([{ id: 2 }]) as any);

      expect(getSequences()).toHaveLength(2);
    });
  });

  describe('tick()', () => {
    it('done でない Sequence に tick する', () => {
      manager.start(createAction() as any);
      manager.start(createAction() as any);

      const [a, b] = getSequences();

      manager.tick();

      expect(a.tick).toHaveBeenCalledTimes(1);
      expect(b.tick).toHaveBeenCalledTimes(1);
    });

    it('done 状態の Sequence は tick しない', () => {
      manager.start(createAction() as any);

      const [seq] = getSequences();
      seq.status = 'done';

      manager.tick();

      expect(seq.tick).not.toHaveBeenCalled();
    });

    it('parallel block を持つ別 Sequence があると他は停止する', () => {
      manager.start(createAction() as any);
      manager.start(createAction() as any);

      const [blocking, blocked] = getSequences();

      blocking.blockingParallelActions = true;

      manager.tick();

      expect(blocking.tick).toHaveBeenCalledTimes(1);
      expect(blocked.tick).not.toHaveBeenCalled();
    });

    it('done は tick 後に removeDone で削除される', () => {
      manager.start(createAction() as any);
      manager.start(createAction() as any);

      const [alive, done] = getSequences();
      done.status = 'done';

      manager.tick();

      const sequences = getSequences();

      expect(sequences).toHaveLength(1);
      expect(sequences[0]).toBe(alive);
    });
  });

  describe('hasPlayerBlock()', () => {
    it('blockingPlayerInput が1件でもあれば true', () => {
      manager.start(createAction() as any);
      manager.start(createAction() as any);

      const [, seq] = getSequences();
      seq.blockingPlayerInput = true;

      expect(manager.hasPlayerBlock()).toBe(true);
    });

    it('なければ false', () => {
      manager.start(createAction() as any);

      expect(manager.hasPlayerBlock()).toBe(false);
    });
  });

  describe('hasParallelBlock()', () => {
    it('blockingParallelActions が1件でもあれば true', () => {
      manager.start(createAction() as any);

      const [seq] = getSequences();
      seq.blockingParallelActions = true;

      expect(manager.hasParallelBlock()).toBe(true);
    });

    it('なければ false', () => {
      expect(manager.hasParallelBlock()).toBe(false);
    });
  });

  describe('count()', () => {
    it('running の件数のみ返す', () => {
      manager.start(createAction() as any);
      manager.start(createAction() as any);
      manager.start(createAction() as any);

      const [a, b, c] = getSequences();

      a.status = 'running';
      b.status = 'done';
      c.status = 'init';

      expect(manager.count()).toBe(1);
    });
  });

  describe('runnableSequences()', () => {
    it('parallel block の running があればその1件だけ返す', () => {
      manager.start(createAction() as any);
      manager.start(createAction() as any);

      const [a, b] = getSequences();

      a.status = 'running';
      a.blockingParallelActions = true;
      b.status = 'running';

      expect(manager.runnableSequences()).toEqual([a]);
    });

    it('なければ running 全件返す', () => {
      manager.start(createAction() as any);
      manager.start(createAction() as any);
      manager.start(createAction() as any);

      const [a, b, c] = getSequences();

      a.status = 'running';
      b.status = 'done';
      c.status = 'running';

      expect(manager.runnableSequences()).toEqual([a, c]);
    });
  });

  describe('clear()', () => {
    it('全 Sequence を削除する', () => {
      manager.start(createAction() as any);
      manager.start(createAction() as any);

      expect(getSequences()).toHaveLength(2);

      manager.clear();

      expect(getSequences()).toHaveLength(0);
    });
  });
});
