import { describe, expect, it } from 'vitest';
import {
  clampZoom,
  computeFitCellSize,
  formatZoomLabel,
  toCellSize,
  zoomIn,
  zoomOut,
} from '@editor/lib/paint-editor/zoom';

describe('zoom', () => {
  it('computes the viewport-fit cell size', () => {
    expect(computeFitCellSize(16, 16, 800, 600)).toBe(37.5);
    expect(computeFitCellSize(32, 16, 800, 600)).toBe(25);
    expect(computeFitCellSize(800, 600, 400, 300)).toBe(0.5);
  });

  it('treats viewport fit as 100% in the UI', () => {
    expect(formatZoomLabel(1)).toBe('100%');
    expect(formatZoomLabel(2)).toBe('200%');
    expect(toCellSize(37.5, 1)).toBe(37.5);
    expect(toCellSize(37.5, 2)).toBe(75);
  });

  it('clamps relative zoom adjustments', () => {
    expect(zoomIn(1)).toBe(1.25);
    expect(zoomOut(1)).toBe(0.75);
    expect(clampZoom(100)).toBe(64);
    expect(clampZoom(0.1)).toBe(0.5);
  });

  it('returns 1 for invalid fit dimensions', () => {
    expect(computeFitCellSize(0, 16, 800, 600)).toBe(1);
    expect(computeFitCellSize(16, 16, 0, 600)).toBe(1);
  });
});
