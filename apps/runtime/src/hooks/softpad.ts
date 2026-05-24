import { useEffect, useRef } from 'react';
import { InputManager } from '@tetsup/web2d';
import { RpgKey } from '@sharedTypes/engine';

export const useAssignPad = () => {
  const inputRef = useRef<InputManager<RpgKey> | null>(null);

  useEffect(() => {
    const keyMap: Record<string, RpgKey> = {
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

      if (key) {
        inputRef.current?.press(key);
      }
    };

    const release = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('[data-pad]');
      if (!button) return;

      const key = keyMap[(button as HTMLElement).dataset.pad ?? ''];

      if (key) {
        inputRef.current?.release(key);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);

    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);

      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, []);

  return (input: InputManager<RpgKey>) => {
    console.log('softpad attached');
    inputRef.current = input;
  };
};
