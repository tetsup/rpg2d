import './debug/log-forwarder';
import './debug/error-forwarder';
import { GameApp, resolveTransparentMode, type KeyAssignment, type TransparentMode } from '@tetsup/web2d';
import { worker } from '@dev/mocks/api/browser';
import { RpgCore } from '@/engine/core';
import type { RpgKey } from '@/types/engine';
import { Manifest } from '@/schemas/manifest';

await worker.start({
  onUnhandledRequest(req) {
    const url = req.url;
    if (!url.includes('/api/')) return;
  },
});

const canvas = document.getElementById('game') as HTMLCanvasElement;

const keyAssignment: KeyAssignment<RpgKey> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Enter: 'enter',
  Escape: 'esc',
};

function assignPad(input: any) {
  const bind = (id: string, key: string) => {
    const el = document.getElementById(id)!;
    el.onpointerdown = () => input.press(key);
    el.onpointerup = () => input.release(key);
  };

  bind('left', 'left');
  bind('right', 'right');
  bind('up', 'up');
  bind('down', 'down');
  bind('enter', 'enter');
  bind('esc', 'esc');

  return {} as any;
}

const manifest: Manifest = {
  initialState: {
    core: {
      variables: new Map(),
      mode: 'field',
      players: ['local.player.hero.v0'],
    },
    field: {
      fieldId: 'local.field.startField.v0',
      pos: { x: 5, y: 5 },
      direction: 'down',
      actionIds: [],
    },
  },
  config: {
    blockSize: { width: 16, height: 16 },
    textSize: { width: 8, height: 8 },
    moveDurationMs: 500,
    screen: { width: 320, height: 240 },
    defaultMessagePanel: 'local.panel.message.v0',
    messageConfig: { speedMs: 100, margin: { left: 2, right: 2, top: 1, bottom: 1 } },
  },
  schemas: { playerState: { hp: { type: 'number', asInt: true } } },
};

const config = { resourceUri: '/api/resource', imageUri: '/api/image' };

const app = new GameApp(canvas, new RpgCore(manifest, config), {
  maxObjects: 3000,
  rectSize: { width: 320, height: 240 },
  keyAssignment,
  assignPad,
});

const params = new URLSearchParams(location.search);
const modeParam = params.get('mode');
const mode: TransparentMode = modeParam === 'sab' || modeParam === 'message' ? modeParam : resolveTransparentMode();
app.setTransparentMode(mode);

(document.getElementById('start') as HTMLButtonElement).onclick = () => {
  console.log(`starting with mode ${mode}`);
  app.start();
};

(document.getElementById('pause') as HTMLButtonElement).onclick = () => {
  app.pause();
};

(document.getElementById('step') as HTMLButtonElement).onclick = () => {
  app.advance(1000);
};

(window as any).app = app;
