import type { EntityInstance } from '@/engine/entity';
import { FieldPos } from '@/engine/fieldPos';
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

export type FieldState = {
  playerPos: FieldPos;
  players: Player[];
  actions: Queue<Action>;
  entities: Record<string, EntityInstance>;
};

export type EntityState = {
  pos: FieldPos;
  actions: Queue<Action>;
  visible: boolean;
  allowOverwrap: boolean;
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
