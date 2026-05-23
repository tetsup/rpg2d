export type EngineStat = {
  fps?: number;
  intervalFps?: number;
  tps?: number;
  intervalTps?: number;
  isReady: boolean;
  isRunning: boolean;
  speed: number;
  recentErrors: string[];
  frameCount: number;
  anchorTime: number;
  recentFrameCount: number;
  recentAnchorTime: number;
};
