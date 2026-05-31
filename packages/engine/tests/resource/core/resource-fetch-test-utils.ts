import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { http, HttpResponse } from 'msw';
import yaml from 'yaml';
import { GameContext } from '@engine/resource/core/game-context';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { ResourceConfig } from '@sharedTypes/config';
import { server } from '@tests/setup/setup';

export const resourceUri = 'https://resources.example.test/resources';

export const actionId = 'sample/action/welcome.v0';
export const entityId = 'sample/entity/welcome.v0';

export const isoTimestamp = '2026-05-31T02:38:38.467Z';

const makeManifest = (): ManifestData =>
  ({
    initialState: {
      core: { players: [], variables: new Map(), mode: 'field' },
      field: { fieldId: 'sample/field/start-field.v0', pos: { x: 0, y: 0 }, direction: 'down', actionIds: [] },
    },
    schemas: { playerState: {} },
    config: {
      blockSize: { width: 16, height: 16 },
      textSize: { width: 8, height: 8 },
      moveDurationMs: 200,
      screen: { width: 320, height: 240 },
      defaultMessagePanel: 'sample/panel/message.v0',
      messageConfig: { speedMs: 100, margin: { left: 2, right: 2, top: 1, bottom: 1 } },
    },
  }) as ManifestData;

export const createContext = (config: ResourceConfig = { resourceUri }): GameContext =>
  new GameContext(makeManifest(), config);

export const loadResourceFixture = <T = unknown>(relativePath: string): T => {
  const file = fileURLToPath(new URL(`../../../../../fixtures/resources/sample/${relativePath}`, import.meta.url));
  return yaml.parse(readFileSync(file, 'utf8')) as T;
};

export const useResourceResponses = (resources: Record<string, unknown>) => {
  server.use(
    http.get(`${resourceUri}/:namespace/:type/:name`, ({ params }) => {
      const id = `${params.namespace}/${params.type}/${params.name}`;
      const resource = resources[id];

      if (resource === undefined) {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      }

      return HttpResponse.json(resource);
    })
  );
};

export const expectIsoString = (value: unknown) => {
  expect(typeof value).toBe('string');
  expect(new Date(value as string).toISOString()).toBe(value);
};
