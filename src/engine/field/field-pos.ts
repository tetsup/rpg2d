import { GameContext } from '@/resource/core/game-context';
import { Movement } from '@/schemas/action/movement';
import type { Direction2d, Point2d, Size2d } from '@/types/engine';
import { calcDest } from '@/utils/pos';

export type InitialFieldPos = {
  current: Point2d;
  direction: Direction2d;
};

export type FieldPosConfig = {
  moveDurationMs: number;
  blockSize: Size2d;
  initialPos: Point2d;
  initialDirection: Direction2d;
};

export type OnComp = () => any;

type MovementExecution = {
  dest: Point2d;
  timeMsStart: number;
  durationMs: number;
};

export class FieldPos {
  private _current: Point2d;
  private _direction: Direction2d;
  private _currentMovement: MovementExecution | null = null;

  constructor(
    private ctx: GameContext,
    private config: FieldPosConfig
  ) {
    this._current = config.initialPos;
    this._direction = config.initialDirection;
  }

  move = (nowMs: number, movement: Movement) => {
    this._currentMovement = {
      dest: calcDest(this._current, movement),
      timeMsStart: nowMs,
      durationMs: movement.durationMs ?? this.ctx.manifest.config.moveDurationMs,
    };
  };

  setDirection = (direction: Direction2d) => {
    this._direction = direction;
  };

  tick = (nowMs: number) => {
    if (this._currentMovement == null) return;
    const elapsedMs = nowMs - this._currentMovement.timeMsStart;
    if (elapsedMs >= this._currentMovement.durationMs) {
      this._current = this._currentMovement.dest;
      this._currentMovement = null;
    }
  };

  getCurrentPixel = (nowMs: number) => {
    if (this._currentMovement == null) {
      return { x: this._current.x * this.config.blockSize.width, y: this._current.y * this.config.blockSize.height };
    } else {
      const proceed = (nowMs - this._currentMovement.timeMsStart) / this._currentMovement.durationMs;
      const dx = this._currentMovement.dest.x - this._current.x;
      const x = this._current.x + dx * proceed;
      const dy = this._currentMovement.dest.y - this._current.y;
      const y = this._current.y + dy * proceed;
      return { x: x * this.config.blockSize.width, y: y * this.config.blockSize.height };
    }
  };

  getDestination = () => {
    return this._currentMovement?.dest ?? this._current;
  };

  get current() {
    return this._current;
  }

  get direction() {
    return this._direction;
  }

  get currentMovement() {
    return this._currentMovement;
  }
}
