import { Sequence } from '@/engine/action/sequence';

type MockGameContext = {
  state: {
    variables: Map<string, unknown>;
  };
};

type MockPanelManager = {
  openMessages: ReturnType<typeof vi.fn>;
};

describe('Sequence', () => {
  let ctx: MockGameContext;
  let panelManager: MockPanelManager;

  beforeEach(() => {
    ctx = {
      state: {
        variables: new Map(),
      },
    };

    panelManager = {
      openMessages: vi.fn(),
    };
  });

  describe('初期状態', () => {
    it('constructor直後は init 状態', () => {
      const sequence = new Sequence(ctx as any, panelManager as any, []);

      expect(sequence.status).toBe('init');
      expect(sequence.currentIndex).toBe(0);
      expect(sequence.nextIndex).toBe(0);
      expect(sequence.externals.size).toBe(0);
      expect(sequence.variables.size).toBe(0);
    });
  });

  describe('tick / nextCommand', () => {
    it('tick() 初回実行で init → running になる', () => {
      const data = [
        {
          command: 'sendMessage',
          messages: ['A'],
        },
      ];

      const sequence = new Sequence(ctx as any, panelManager as any, data as any);

      sequence.tick();

      expect(sequence.status).toBe('running');
      expect(sequence.currentIndex).toBe(0);
    });

    it('done 状態では tick() しても何も起きない', () => {
      const data = [
        {
          command: 'sendMessage',
          messages: ['A'],
        },
      ];

      const sequence = new Sequence(ctx as any, panelManager as any, data as any);

      sequence.status = 'done';

      sequence.tick();

      expect(sequence.status).toBe('done');
      expect(panelManager.openMessages).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage command', () => {
    it('sendMessage 実行時に panelManager.openMessages が呼ばれる', async () => {
      panelManager.openMessages.mockResolvedValue(undefined);

      const data = [
        {
          command: 'sendMessage',
          messages: ['こんにちは', '世界'],
        },
      ];

      const sequence = new Sequence(ctx as any, panelManager as any, data as any);

      sequence.tick();

      expect(panelManager.openMessages).toHaveBeenCalledTimes(1);
      expect(panelManager.openMessages).toHaveBeenCalledWith([
        { type: 'simple', message: 'こんにちは' },
        { type: 'simple', message: '世界' },
      ]);
    });

    it('sendMessage 実行後 nextIndex は次の位置になる', () => {
      panelManager.openMessages.mockResolvedValue(undefined);

      const data = [
        {
          command: 'sendMessage',
          messages: ['A'],
        },
      ];

      const sequence = new Sequence(ctx as any, panelManager as any, data as any);

      sequence.tick();

      expect(sequence.nextIndex).toBe(1);
    });

    it('ExternalMethod 完了前は tick() しても進行しない', () => {
      let resolver!: () => void;

      panelManager.openMessages.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolver = resolve;
          })
      );

      const data = [
        {
          command: 'sendMessage',
          messages: ['A'],
        },
      ];

      const sequence = new Sequence(ctx as any, panelManager as any, data as any);

      sequence.tick(); // sendMessage開始

      expect(sequence.status).toBe('running');
      expect(panelManager.openMessages).toHaveBeenCalledTimes(1);

      sequence.tick(); // まだ完了していないので止まる

      expect(sequence.status).toBe('running');
      expect(panelManager.openMessages).toHaveBeenCalledTimes(1);

      resolver();
    });

    it('ExternalMethod 完了後は次の tick() で done まで進む', async () => {
      panelManager.openMessages.mockResolvedValue(undefined);

      const data = [
        {
          command: 'sendMessage',
          messages: ['A'],
        },
      ];

      const sequence = new Sequence(ctx as any, panelManager as any, data as any);

      sequence.tick(); // 開始

      // Promise解決待ち
      await Promise.resolve();
      await Promise.resolve();

      sequence.tick(); // 外部処理完了確認
      sequence.tick(); // nextIndex >= length で done

      expect(sequence.status).toBe('done');
    });

    it('ExternalMethod の戻り値があれば variables に保存される', async () => {
      panelManager.openMessages.mockResolvedValue(123);

      const data = [
        {
          command: 'sendMessage',
          messages: ['A'],
        },
      ];

      const sequence = new Sequence(ctx as any, panelManager as any, data as any);

      sequence.tick();

      await Promise.resolve();
      await Promise.resolve();

      sequence.tick();

      expect(sequence.variables.get(0)).toBe(123);
    });
  });

  describe('GameContext variables（将来の条件分岐向け土台確認）', () => {
    it('ctx.state.variables に値を保持できる', () => {
      ctx.state.variables.set('player.level', 10);

      expect(ctx.state.variables.get('player.level')).toBe(10);
    });
  });
});
