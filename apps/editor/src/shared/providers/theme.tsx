import { PropsWithChildren, useEffect } from 'react';
import { useThemeStore } from '../ui/theme-store';

export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useThemeStore((s) => s.theme);
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyMode = () => {
      root.classList.remove('light', 'dark');
      const resolvedMode = mode === 'system' ? (media.matches ? 'dark' : 'light') : mode;
      root.classList.add(resolvedMode);
    };
    applyMode();

    if (mode !== 'system') {
      return;
    }
    media.addEventListener('change', applyMode);

    return () => {
      media.removeEventListener('change', applyMode);
    };
  }, [theme, mode]);

  return children;
}
