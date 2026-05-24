import type { GameRenderer, InputManager } from '@tetsup/web2d';
import { RpgCore } from '@engine/index';
import { FieldEngine } from '@engine/manager/field/field-core';
import { InputEngine } from '@engine/manager/input/input-engine';
import { PanelManager } from '@engine/manager/panel/panel-manager';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { ResourceConfig } from '@sharedTypes/config';
import type { RpgKey } from '@sharedTypes/engine';

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
} as unknown as ManifestData;

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
      retrieveSortedLayers: vi.fn().mockReturnValue([]),
      renderLayers: vi.fn(),
    } as unknown as FieldEngine);
    vi.spyOn(PanelManager.prototype, 'hasOpenPanel').mockReturnValue(true);

    await core.onInit({} as GameRenderer);
    await core.onTick(makeInput(), 100, {} as GameRenderer);

    expect(fieldOnTick).not.toHaveBeenCalled();
  });

  it('panelがなければfield onTickを呼ぶ', async () => {
    const core = new RpgCore(manifest, config);
    const fieldOnTick = vi.fn();
    vi.spyOn(FieldEngine, 'factory').mockResolvedValue({
      onTick: fieldOnTick,
      retrieveSortedLayers: vi.fn().mockReturnValue([]),
      renderLayers: vi.fn(),
    } as unknown as FieldEngine);
    vi.spyOn(PanelManager.prototype, 'hasOpenPanel').mockReturnValue(false);
    const input = makeInput();
    const renderer = {} as GameRenderer;

    await core.onInit(renderer);
    await core.onTick(input, 100, renderer);

    expect(fieldOnTick).toHaveBeenCalledWith(expect.any(InputEngine), 100, renderer);
  });
});
