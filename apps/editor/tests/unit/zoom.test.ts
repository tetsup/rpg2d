import { describe, expect, it } from 'vitest';
import { autoFitZoom, fitZoom } from '@editor/lib/paint-editor/zoom';

describe('zoom', () => {
  it('fits the canvas inside the container', () => {
    expect(fitZoom(16, 16, 800, 600)).toBe(37.5);
    expect(fitZoom(32, 16, 800, 600)).toBe(25);
  });

  it('returns null when the canvas already fills the viewport', () => {
    expect(autoFitZoom(800, 600, 800, 600)).toBeNull();
    expect(autoFitZoom(900, 500, 800, 600)).toBeNull();
    expect(autoFitZoom(700, 700, 800, 600)).toBeNull();
  });

  it('returns a fit zoom when the canvas is smaller than the viewport', () => {
    expect(autoFitZoom(16, 16, 800, 600)).toBe(37.5);
    expect(autoFitZoom(64, 64, 400, 300)).toBeCloseTo(4.6875);
  });

  it('returns null for invalid dimensions', () => {
    expect(autoFitZoom(0, 16, 800, 600)).toBeNull();
    expect(autoFitZoom(16, 16, 0, 600)).toBeNull();
  });
});
