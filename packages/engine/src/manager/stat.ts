import { EngineStat } from '@engine/types/stat';

const calcCps = (startMs: number, nowMs: number, count: number) => (count / (nowMs - startMs)) * 1000;

export class StatManager {
  private stat: EngineStat;
  private totalTickCount: number = 0;
  private totalStartMs: number;
  private intervalTickCount: number = 0;
  private intervalStartMs: number;

  constructor(
    initialStat?: EngineStat,
    private intervalMs: number = 1000
  ) {
    const anchorTime = performance.now();
    if (initialStat) this.stat = { ...initialStat };
    else
      this.stat = {
        isReady: false,
        isRunning: false,
        speed: 1,
        recentErrors: [],
        frameCount: 0,
        anchorTime,
        recentFrameCount: 0,
        recentAnchorTime: anchorTime,
      };
    this.totalStartMs = anchorTime;
    this.intervalStartMs = anchorTime;
  }

  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit = () => {
    console.log('emit');
    for (const listener of [...this.listeners]) {
      listener();
    }
  };

  private update = (values: Partial<EngineStat>) => {
    this.stat = { ...this.stat, ...values };
    this.emit();
  };

  getSnapshot = () => this.stat;

  ready = () => {
    this.update({ isReady: true });
  };

  start = () => {
    this.update({ isRunning: true });
    this.resetCount();
  };

  pause = () => {
    this.update({ isRunning: false });
  };

  setSpeed = (speed: number) => {
    this.update({ speed });
  };

  private resetCount = () => {
    const nowMs = performance.now();
    this.totalTickCount = 0;
    this.totalStartMs = nowMs;
    this.intervalTickCount = 0;
    this.intervalStartMs = nowMs;
  };

  tick = () => {
    this.totalTickCount += 1;
    this.intervalTickCount += 1;
    const now = performance.now();
    if (now >= this.intervalStartMs + this.intervalMs) {
      this.updateTps(now);
    }
  };

  private updateTps = (nowMs: number) => {
    const tps = calcCps(this.totalStartMs, nowMs, this.totalTickCount);

    const intervalTps = calcCps(this.intervalStartMs, nowMs, this.intervalTickCount);
    this.update({ tps, intervalTps });
    this.intervalTickCount = 0;
    this.intervalStartMs = nowMs;
  };
}
