import { EngineStat } from '@engine/types/stat';

export class StatManager {
  private stat: EngineStat;
  constructor(initialStat?: EngineStat) {
    if (initialStat) this.stat = initialStat;
    else this.stat = { isRunning: false, speed: 1, recentErrors: [] };
  }
  get isRunning() {
    return this.stat.isRunning;
  }
  get speed() {
    return this.stat.speed;
  }
  get recentErrors() {
    return this.stat.recentErrors;
  }
  get fps() {
    return this.stat.fps;
  }
  get tps() {
    return this.stat.tps;
  }
}
