import type { EntityInstance } from '@engine/manager/entity';
import type { FieldPos } from '@engine/manager/field/field-pos';
import type { Action } from '@engine/resource/domain/action';
import type { Player } from '@engine/resource/domain/player';
import type { Queue } from '@engine/utils/queue';
import type { Rect } from '@engine/utils/rect';
import type { TexturePlayback } from './resource/texture';

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

export type RpgKey = 'left' | 'right' | 'up' | 'down' | 'enter' | 'esc';

export type ImageLayer = { priority: number; image: string };

export type LayerWithPos = { rect: Rect; layer: ImageLayer };
