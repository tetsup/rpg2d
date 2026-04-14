import type { Battle } from '@/engine/battle';
import type { MenuWindow } from '@/engine/menu';
import { TexturePlayback } from '@/schemas/image/texture';

export type ResourceId = string;

export type Point2d = {
  x: number;
  y: number;
};

export type Size2d = { width: number; height: number };

export type RpgMode = 'field' | 'menu' | 'battle';

export type VariableState = {};

export type EventState = {};

export type RpgState = {
  variableStates: Map<string, VariableState>;
  mode: RpgMode;
  playerPos: {
    fieldId: string;
    pos: Point2d;
  };
  presenceWindows: MenuWindow[];
  activeEventState?: EventState;
  battle?: Battle;
};

export type RpgConfig = {
  texture: {
    playback: TexturePlayback;
  };
};

export type RpgManifest = {
  initialState: RpgState;
  config: RpgConfig;
};
