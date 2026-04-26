import './debug/log-forwarder';
import './debug/error-forwarder';
import { worker } from './mocks/api/browser';
import { GameApp, resolveTransparentMode, type KeyAssignment, type TransparentMode } from '@tetsup/web2d';
import { RpgCore } from '@/engine/core';
import type { RpgManifest, RpgKey } from '@/types/engine';

const canvas = document.getElementById('game') as HTMLCanvasElement;

const keyAssignment: KeyAssignment<RpgKey> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Enter: 'enter',
  Escape: 'cancel',
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
  bind('esc', 'cancel');
}

const manifest: RpgManifest = {
  initialState: {
    core: {
      players: ['local.player.hero.v0'],
      variables: new Map(),
      mode: 'field',
    },
    field: {
      fieldId: 'local.field.startField.v0',
      pos: { x: 1, y: 1 },
      direction: 'down',
      actionIds: [],
    },
  },
  schemas: {
    playerState: {},
  },
  config: {
    blockSize: { width: 16, height: 16 },
    moveDurationMs: 200,
    screen: { width: 320, height: 240 },
  },
};

await worker.start({
  onUnhandledRequest: 'bypass',
});

const app = new GameApp(canvas, new RpgCore(manifest), {
  maxObjects: 10,
  rectSize: { width: 320, height: 240 },
  keyAssignment,
  assignPad,
});

const params = new URLSearchParams(location.search);
const modeParam = params.get('mode');
const mode: TransparentMode = modeParam === 'sab' || modeParam === 'message' ? modeParam : resolveTransparentMode();
app.setTransparentMode(mode);

(document.getElementById('start') as HTMLButtonElement).onclick = async () => {
  console.log(`starting with mode ${modeParam}`);
  app.start();
};

(document.getElementById('pause') as HTMLButtonElement).onclick = () => {
  app.pause();
};

(document.getElementById('step') as HTMLButtonElement).onclick = () => {
  app.advance(1000);
};

(window as any).app = app;
