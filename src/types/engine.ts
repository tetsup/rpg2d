import type { Action } from '@/resource/domain/action';
import type { Field } from '@/resource/domain/field';
import type { Player } from '@/resource/domain/player';
import type { TexturePlayback } from '@/schemas/image/texture';
import type { Queue } from '@/utils/queue';

export type Point2d = {
  x: number;
  y: number;
};

export type Direction2d = 'left' | 'right' | 'up' | 'down';

export type WalkingState = {
  current: Point2d;
  direction: Direction2d;
  moving: boolean;
  stepMs: number;
  spendMsPerBlock: number;
};

export type FieldState = {
  field: Field;
  pos: WalkingState;
  players: Player[];
  actions: Queue<Action>;
};

export type Size2d = { width: number; height: number };

export type RpgMode = 'field' | 'menu' | 'battle';

export type VariableState = {};

export type EventState = {};

export type CoreState = {
  variableStates: Map<string, VariableState>;
  mode: RpgMode;
};

export type RpgConfig = {
  texture: {
    playback: TexturePlayback;
  };
};

export type RpgKey = 'left' | 'right' | 'up' | 'down' | 'enter' | 'cancel';
