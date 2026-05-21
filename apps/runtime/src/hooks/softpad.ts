import { useEffect } from 'react';
import { InputManager } from '@tetsup/web2d';
import { RpgKey } from '@sharedTypes/engine';

export const useAssignPad = () => (input: InputManager<RpgKey>) => {
  useEffect(() => {
    if (!input) return;

    const keyMap: Record<string, string> = {
      left: 'left',
      right: 'right',
      up: 'up',
      down: 'down',
      enter: 'enter',
      esc: 'esc',
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('[data-pad]');
      if (!button) return;
      const key = keyMap[(button as HTMLElement).dataset.pad ?? ''];
      if (key) input.press(key as RpgKey);
    };

    const release = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('[data-pad]');
      if (!button) return;
      const key = keyMap[(button as HTMLElement).dataset.pad ?? ''];
      if (key) input.release(key as RpgKey);
    };

    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, [input]);
};
