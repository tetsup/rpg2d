import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import { LocalLoader } from '@api/loaders/local-loader';
import { NotFoundError } from '@api/errors/http-error';

const parseResourceMock = vi.fn();

let watchCallback: ((event: string, filePath: string) => void) | undefined;

vi.mock('../../../../packages/schema/src/api/resource', () => ({
  resourceTypes: ['player', 'field'],
  parseResource: (...args: any[]) => parseResourceMock(...args),
}));

vi.mock('chokidar', () => ({
  default: {
    watch: vi.fn(() => ({
      on: vi.fn((event: string, cb: any) => {
        if (event === 'all') {
          watchCallback = cb;
        }
      }),
    })),
  },
}));

describe('LocalLoader', () => {
  let rootDir: string;

  beforeEach(() => {
    vi.clearAllMocks();
    watchCallback = undefined;

    rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'loader-test-'));

    fs.mkdirSync(path.join(rootDir, 'player'), { recursive: true });
    fs.mkdirSync(path.join(rootDir, 'field', 'town'), { recursive: true });

    fs.writeFileSync(
      path.join(rootDir, 'player', 'hero.yaml'),
      `
id: player/player/hero
type: player
name: Hero
hp: 100
`
    );

    fs.writeFileSync(
      path.join(rootDir, 'field', 'town', 'start-map.yaml'),
      `
id: field/field/start-map
type: field
name: Town
width: 20
`
    );

    parseResourceMock.mockImplementation((input: any) => input);
  });

  afterEach(() => {
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it('loads yaml files on startup', () => {
    const loader = new LocalLoader(rootDir);

    expect(parseResourceMock).toHaveBeenCalledTimes(2);

    expect(loader.readResource('player', 'player', 'hero')).toEqual({
      id: 'player/player/hero',
      type: 'player',
      name: 'Hero',
      hp: 100,
    });
  });

  it('loads nested yaml path as namespace/id', () => {
    const loader = new LocalLoader(rootDir);

    expect(loader.readResource('field', 'field', 'start-map')).toEqual({
      id: 'field/field/start-map',
      type: 'field',
      name: 'Town',
      width: 20,
    });
  });

  it('ignores non-yaml files during initial load', () => {
    fs.writeFileSync(path.join(rootDir, 'player', 'note.txt'), 'memo');

    new LocalLoader(rootDir);

    expect(parseResourceMock).toHaveBeenCalledTimes(2);
  });

  it('throws ZodError when parseResource validation fails', () => {
    parseResourceMock.mockImplementation(() => {
      throw new ZodError([]);
    });

    expect(() => new LocalLoader(rootDir)).toThrow(ZodError);
  });

  it('throws NotFoundError when type map has no resource', () => {
    const loader = new LocalLoader(rootDir);

    expect(() => loader.readResource('player', 'field', 'hero')).toThrow(NotFoundError);
  });

  it('throws NotFoundError when id does not exist', () => {
    const loader = new LocalLoader(rootDir);

    expect(() => loader.readResource('player', 'player', 'unknown')).toThrow(NotFoundError);
  });

  it('reloads yaml file when chokidar emits change event', () => {
    const loader = new LocalLoader(rootDir);

    fs.writeFileSync(
      path.join(rootDir, 'player', 'hero.yaml'),
      `
id: player/player/hero
type: player
name: Super Hero
hp: 999
`
    );

    expect(watchCallback).toBeDefined();

    watchCallback?.('change', path.join(rootDir, 'player', 'hero.yaml'));

    expect(loader.readResource('player', 'player', 'hero')).toEqual({
      id: 'player/player/hero',
      type: 'player',
      name: 'Super Hero',
      hp: 999,
    });
  });

  it('ignores non-yaml watch events', () => {
    new LocalLoader(rootDir);

    parseResourceMock.mockClear();

    watchCallback?.('change', path.join(rootDir, 'player', 'memo.txt'));

    expect(parseResourceMock).not.toHaveBeenCalled();
  });

  it('updates existing resource on repeated yaml changes', () => {
    const loader = new LocalLoader(rootDir);

    fs.writeFileSync(
      path.join(rootDir, 'player', 'hero.yaml'),
      `
id: player/player/hero
type: player
name: Hero2
hp: 200
`
    );

    watchCallback?.('change', path.join(rootDir, 'player', 'hero.yaml'));

    expect(loader.readResource('player', 'player', 'hero')).toEqual({
      id: 'player/player/hero',
      type: 'player',
      name: 'Hero2',
      hp: 200,
    });

    fs.writeFileSync(
      path.join(rootDir, 'player', 'hero.yaml'),
      `
id: player/player/hero
type: player
name: Hero3
hp: 300
`
    );

    watchCallback?.('change', path.join(rootDir, 'player', 'hero.yaml'));

    expect(loader.readResource('player', 'player', 'hero')).toEqual({
      id: 'player/player/hero',
      type: 'player',
      name: 'Hero3',
      hp: 300,
    });
  });

  it('registers chokidar watcher on constructor', async () => {
    const chokidar = await import('chokidar');

    new LocalLoader(rootDir);

    expect(chokidar.default.watch).toHaveBeenCalledWith(rootDir);
  });

  it('throws if watcher reload triggers validation error', () => {
    new LocalLoader(rootDir);

    parseResourceMock.mockImplementation(() => {
      throw new ZodError([]);
    });

    expect(() => watchCallback?.('change', path.join(rootDir, 'player', 'hero.yaml'))).toThrow(ZodError);
  });

  it('keeps multiple resource types independently', () => {
    const loader = new LocalLoader(rootDir);

    expect(loader.readResource('player', 'player', 'hero')).toEqual({
      id: 'player/player/hero',
      type: 'player',
      name: 'Hero',
      hp: 100,
    });

    expect(loader.readResource('field', 'field', 'start-map')).toEqual({
      id: 'field/field/start-map',
      type: 'field',
      name: 'Town',
      width: 20,
    });
  });
});
