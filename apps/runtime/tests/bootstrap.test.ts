import { describe, expect, it, vi } from 'vitest';
import { applyStartOverrides, parseRuntimeSearchParams, resolveResourceUri } from '../src/runtime-config';
import { loadManifest } from '../src/load-manifest';

describe('parseRuntimeSearchParams', () => {
  it('defaults to mock mode and sample manifest', () => {
    expect(parseRuntimeSearchParams(new URLSearchParams())).toEqual({
      mode: 'mock',
      manifestId: 'sample/manifest/v0',
      startFieldId: undefined,
      startX: undefined,
      startY: undefined,
    });
  });

  it('reads standalone URL overrides', () => {
    const params = new URLSearchParams({
      mode: 'api',
      manifest: 'game/manifest/v1',
      field: 'game/field/town',
      x: '3',
      y: '7',
    });
    expect(parseRuntimeSearchParams(params)).toEqual({
      mode: 'api',
      manifestId: 'game/manifest/v1',
      startFieldId: 'game/field/town',
      startX: 3,
      startY: 7,
    });
  });
});

describe('resolveResourceUri', () => {
  it('uses same-origin resources in mock mode', () => {
    expect(resolveResourceUri({ mode: 'mock', manifestId: 'sample/manifest/v0' }, 'http://localhost:5174')).toBe(
      '/api/resources'
    );
  });

  it('honors explicit resourceUri override', () => {
    expect(
      resolveResourceUri(
        {
          mode: 'api',
          manifestId: 'game/manifest/v0',
          resourceUri: '/api/resources',
        },
        'http://localhost:3000'
      )
    ).toBe('/api/resources');
  });
});

describe('applyStartOverrides', () => {
  const manifest = {
    initialState: {
      core: { players: [], variables: {}, mode: 'field' as const },
      field: {
        fieldId: 'sample/field/v0',
        pos: { x: 1, y: 2 },
        direction: 'down' as const,
        actionIds: [],
      },
    },
    schemas: { playerState: {} },
    config: {
      blockSize: { width: 16, height: 16 },
      textSize: { width: 7, height: 7 },
      moveDurationMs: 500,
      screen: { width: 320, height: 240 },
      defaultMessagePanel: 'sample/panel/v0',
      messageConfig: { speedMs: 100, margin: { left: 0, top: 0, right: 1, bottom: 1 } },
    },
  };

  it('overrides starting field position from URL config', () => {
    const resolved = applyStartOverrides(manifest, {
      mode: 'mock',
      manifestId: 'sample/manifest/v0',
      startFieldId: 'sample/field/v1',
      startX: 9,
      startY: 4,
    });
    expect(resolved.initialState.field).toEqual({
      fieldId: 'sample/field/v1',
      pos: { x: 9, y: 4 },
      direction: 'down',
      actionIds: [],
    });
  });
});

describe('loadManifest', () => {
  it('extracts manifest payload from a ResourceRecord response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'sample/manifest/v0',
          namespace: 'sample',
          type: 'manifest',
          name: 'v0',
          version: 0,
          isDraft: false,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          createdBy: 'test-user',
          data: {
            initialState: {
              core: { players: [], variables: {}, mode: 'field' },
              field: {
                fieldId: 'sample/field/v0',
                pos: { x: 0, y: 0 },
                direction: 'down',
                actionIds: [],
              },
            },
            schemas: { playerState: {} },
            config: {
              blockSize: { width: 16, height: 16 },
              textSize: { width: 8, height: 8 },
              moveDurationMs: 200,
              screen: { width: 320, height: 240 },
              defaultMessagePanel: 'sample/panel/v0',
              messageConfig: { speedMs: 100, margin: { left: 0, top: 0, right: 1, bottom: 1 } },
            },
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const manifest = await loadManifest('sample/manifest/v0', '/api/resources');

    expect(fetchMock).toHaveBeenCalledWith('/api/resources/sample/manifest/v0', { credentials: 'include' });
    expect(manifest.initialState.field.fieldId).toBe('sample/field/v0');

    vi.unstubAllGlobals();
  });
});
