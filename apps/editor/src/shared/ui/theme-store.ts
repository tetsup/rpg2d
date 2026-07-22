import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'adult' | 'kids';
export type ColorMode = 'light' | 'dark' | 'system';

export type ThemeStore = {
  theme: AppTheme;
  mode: ColorMode;
  setTheme: (theme: AppTheme) => void;
  setMode: (mode: ColorMode) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'kids',
      mode: 'system',
      setTheme: (theme) => set({ theme }),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'app-theme',
    }
  )
);
