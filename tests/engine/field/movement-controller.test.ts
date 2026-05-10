/**
 * 対象:
 * - movePlayer
 * - moveEntity
 * - resolveMove
 *
 * 方針:
 * - calcDest / samePos はモックして制御
 * - Field / state.playerPos / entity.pos は stub
 * - 分岐網羅重視
 */

import { movePlayer, moveEntity, resolveMove } from '@/engine/field/movement-controller';

describe('movePlayer', () => {
  let state: any;
  let field: any;
  let calcDest: any;
  let samePos: any;

  beforeEach(() => {
    state = {
      entities: {},
      playerPos: {
        current: { x: 1, y: 1 },
        currentMovement: null,
        setDirection: vi.fn(),
        move: vi.fn(),
      },
    };

    field = {
      checkReachable: vi.fn(() => true),
    };

    calcDest = vi.fn(() => ({ x: 2, y: 1 }));
    samePos = vi.fn((a, b) => a?.x === b?.x && a?.y === b?.y);
  });

  it('移動中なら何もしない', () => {
    state.playerPos.currentMovement = {};

    movePlayer(state, field, calcDest, samePos, 1000, { command: 'walk', direction: 'right' } as any);

    expect(state.playerPos.move).not.toHaveBeenCalled();
    expect(state.playerPos.setDirection).not.toHaveBeenCalled();
  });

  it('walk のとき方向更新する', () => {
    movePlayer(state, field, calcDest, samePos, 1000, { command: 'walk', direction: 'left' } as any);

    expect(state.playerPos.setDirection).toHaveBeenCalledWith('left');
  });

  it('walk 以外なら方向更新しない', () => {
    movePlayer(state, field, calcDest, samePos, 1000, { command: 'warp', direction: 'left' } as any);

    expect(state.playerPos.setDirection).not.toHaveBeenCalled();
  });

  it('到達不能タイルなら move しない', () => {
    field.checkReachable.mockReturnValue(false);

    movePlayer(state, field, calcDest, samePos, 1000, { command: 'walk', direction: 'right' } as any);

    expect(state.playerPos.move).not.toHaveBeenCalled();
  });

  it('重なり禁止 entity がいる座標なら move しない', () => {
    state.entities = {
      npc: {
        state: {
          allowOverwrap: false,
          pos: {
            getDestination: () => ({ x: 2, y: 1 }),
          },
        },
      },
    };

    movePlayer(state, field, calcDest, samePos, 1000, { command: 'walk', direction: 'right' } as any);

    expect(state.playerPos.move).not.toHaveBeenCalled();
  });

  it('allowOverwrap=true entity なら move できる', () => {
    state.entities = {
      npc: {
        state: {
          allowOverwrap: true,
          pos: {
            getDestination: () => ({ x: 2, y: 1 }),
          },
        },
      },
    };

    movePlayer(state, field, calcDest, samePos, 1000, { command: 'walk', direction: 'right' } as any);

    expect(state.playerPos.move).toHaveBeenCalledWith(1000, expect.objectContaining({ direction: 'right' }));
  });

  it('到達可能なら move 実行', () => {
    movePlayer(state, field, calcDest, samePos, 500, { command: 'walk', direction: 'right' } as any);

    expect(state.playerPos.move).toHaveBeenCalledWith(500, expect.objectContaining({ direction: 'right' }));
  });
});

describe('moveEntity', () => {
  let state: any;
  let field: any;
  let calcDest: any;
  let samePos: any;
  let entity: any;

  beforeEach(() => {
    entity = {
      state: {
        pos: {
          current: { x: 5, y: 5 },
          currentMovement: null,
          getDestination: vi.fn(() => ({ x: 5, y: 5 })),
          setDirection: vi.fn(),
          move: vi.fn(),
        },
      },
    };

    state = {
      playerPos: {
        getDestination: () => ({ x: 1, y: 1 }),
      },
      entities: {
        npc: entity,
      },
    };

    field = {
      checkReachable: vi.fn(() => true),
    };

    calcDest = vi.fn(() => ({ x: 6, y: 5 }));
    samePos = vi.fn((a, b) => a?.x === b?.x && a?.y === b?.y);
  });

  it('entity移動中なら何もしない', () => {
    entity.state.pos.currentMovement = {};

    moveEntity(state, field, calcDest, samePos, 1000, 'npc', { command: 'walk', direction: 'right' } as any);

    expect(entity.state.pos.move).not.toHaveBeenCalled();
  });

  it('walk のとき方向更新する', () => {
    moveEntity(state, field, calcDest, samePos, 1000, 'npc', { command: 'walk', direction: 'up' } as any);

    expect(entity.state.pos.setDirection).toHaveBeenCalledWith('up');
  });

  it('walk 以外なら方向更新しない', () => {
    moveEntity(state, field, calcDest, samePos, 1000, 'npc', { command: 'warp', direction: 'up' } as any);

    expect(entity.state.pos.setDirection).not.toHaveBeenCalled();
  });

  it('到達不能なら move しない', () => {
    field.checkReachable.mockReturnValue(false);

    moveEntity(state, field, calcDest, samePos, 1000, 'npc', { command: 'walk', direction: 'right' } as any);

    expect(entity.state.pos.move).not.toHaveBeenCalled();
  });

  it('プレイヤー移動先と同座標なら move しない', () => {
    calcDest.mockReturnValue({ x: 1, y: 1 });

    moveEntity(state, field, calcDest, samePos, 1000, 'npc', { command: 'walk', direction: 'left' } as any);

    expect(entity.state.pos.move).not.toHaveBeenCalled();
  });

  it('重なり禁止 entity がいる場所なら move しない', () => {
    state.entities.blocker = {
      state: {
        allowOverwrap: false,
        pos: {
          getDestination: () => ({ x: 6, y: 5 }),
        },
      },
    };

    moveEntity(state, field, calcDest, samePos, 1000, 'npc', { command: 'walk', direction: 'right' } as any);

    expect(entity.state.pos.move).not.toHaveBeenCalled();
  });

  it('到達可能かつプレイヤーと被らなければ move', () => {
    moveEntity(state, field, calcDest, samePos, 1000, 'npc', { command: 'walk', direction: 'right' } as any);

    expect(entity.state.pos.move).toHaveBeenCalledWith(1000, expect.objectContaining({ direction: 'right' }));
  });
});

describe('resolveMove', () => {
  const createInput = (pressed: string[]) =>
    ({
      isPressed: (key: string) => pressed.includes(key),
    }) as any;

  it('left 押下で left', () => {
    expect(resolveMove(createInput(['left']))).toBe('left');
  });

  it('right 押下で right', () => {
    expect(resolveMove(createInput(['right']))).toBe('right');
  });

  it('up 押下で up', () => {
    expect(resolveMove(createInput(['up']))).toBe('up');
  });

  it('down 押下で down', () => {
    expect(resolveMove(createInput(['down']))).toBe('down');
  });

  it('何も押されていなければ null', () => {
    expect(resolveMove(createInput([]))).toBeNull();
  });

  it('複数押下時は left 優先', () => {
    expect(resolveMove(createInput(['left', 'right', 'up']))).toBe('left');
  });

  it('left 無し複数押下時は right 優先', () => {
    expect(resolveMove(createInput(['right', 'down']))).toBe('right');
  });

  it('right 無し複数押下時は up 優先', () => {
    expect(resolveMove(createInput(['up', 'down']))).toBe('up');
  });
});
