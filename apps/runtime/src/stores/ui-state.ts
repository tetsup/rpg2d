import { create } from 'zustand';

export type RuntimeLayoutMode = 'auto' | 'portrait' | 'landscape';

type RuntimeUiStateStore = {
  layoutMode: RuntimeLayoutMode;
  showHud: boolean;
  showSoftPad: boolean;
  setLayoutMode: (mode: RuntimeLayoutMode) => void;
  toggleHud: () => void;
  toggleSoftPad: () => void;
};

export const useRuntimeUiStateStore = create<RuntimeUiStateStore>((set) => ({
  layoutMode: 'auto',
  showHud: true,
  showSoftPad: true,
  setLayoutMode: (layoutMode) =>
    set({
      layoutMode,
    }),
  toggleHud: () =>
    set((state) => ({
      showHud: !state.showHud,
    })),
  toggleSoftPad: () =>
    set((state) => ({
      showSoftPad: !state.showSoftPad,
    })),
}));
