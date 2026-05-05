import type { GameRenderer, InputManager } from '@tetsup/web2d';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RpgCore } from '@/engine/core';
import { FieldEngine } from '@/engine/field/field-core';
import { PanelManager } from '@/engine/panel/panel-manager';
import type { Manifest } from '@/schemas/manifest';
import type { ResourceConfig } from '@/schemas/resource-config';
import type { RpgKey } from '@/types/engine';

const manifest = {
  initialState: {
    core: {
      players: [],
      variables: new Map(),
      mode: 'field',
    },
    field: {
      fieldId: 'field.start',
      pos: { x: 0, y: 0 },
      direction: 'down',
      actionIds: [],
    },
  },
  schemas: {
    playerState: {},
  },
  config: {
    blockSize: { width: 16, height: 16 },
    textSize: { width: 8, height: 8 },
    moveDurationMs: 100,
    screen: { width: 160, height: 144 },
    defaultMessagePanel: 'panel.message',
    messageConfig: {
      speedMs: 0,
      margin: { left: 0, right: 0, top: 0, bottom: 0 },
    },
  },
} as unknown as Manifest;

const config = {
  resourceUri: '/resources',
} as ResourceConfig;

function makeInput(): InputManager<RpgKey> {
  return {
    isPressed: vi.fn().mockReturnValue(false),
  } as unknown as InputManager<RpgKey>;
}

describe('RpgCore PanelManager coordination', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('panelがactiveならfield onTickを呼ばない', async () => {
    const core = new RpgCore(manifest, config);
    const fieldOnTick = vi.fn();
    vi.spyOn(FieldEngine, 'factory').mockResolvedValue({
      onTick: fieldOnTick,
    } as unknown as FieldEngine);
    vi.spyOn(PanelManager.prototype, 'tick').mockReturnValue(true);

    await core.onInit({} as GameRenderer);
    await core.onTick(makeInput(), 100, {} as GameRenderer);

    expect(fieldOnTick).not.toHaveBeenCalled();
  });

  it('panelがなければfield onTickを呼ぶ', async () => {
    const core = new RpgCore(manifest, config);
    const fieldOnTick = vi.fn();
    vi.spyOn(FieldEngine, 'factory').mockResolvedValue({
      onTick: fieldOnTick,
    } as unknown as FieldEngine);
    vi.spyOn(PanelManager.prototype, 'tick').mockReturnValue(false);
    const input = makeInput();
    const renderer = {} as GameRenderer;

    await core.onInit(renderer);
    await core.onTick(input, 100, renderer);

    expect(fieldOnTick).toHaveBeenCalledWith(input, 100, renderer);
  });
});
