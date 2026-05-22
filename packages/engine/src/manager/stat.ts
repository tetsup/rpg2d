import { EngineStat } from '@engine/types/stat';

export class StatManager {
  private stat: EngineStat;
  constructor(initialStat?: EngineStat) {
    if (initialStat) this.stat = initialStat;
    else this.stat = { isRunning: false, speed: 1, recentErrors: [] };
  }

  snapShot = () => this.stat;
}
