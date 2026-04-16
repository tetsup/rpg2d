import './debug/log-forwarder';
import './debug/error-forwarder';
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
  bind('esc', 'esc');
}

const manifest: RpgManifest = {
  initialState: {
    variableStates: new Map(),
    mode: 'field',
    playerPos: { fieldId: 'local:field:startField:v0', pos: { x: 10, y: 10 } },
    presenceWindows: [],
  },
  config: { texture: { playback: { repeat: true, tickMs: 500 } } },
};

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

(document.getElementById('start') as HTMLButtonElement).onclick = () => {
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
