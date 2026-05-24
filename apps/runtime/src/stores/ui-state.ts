import { create } from 'zustand';

type RuntimeUiStateStore = {
  showHud: boolean;
  showSoftPad: boolean;
  toggleHud: () => void;
  toggleSoftPad: () => void;
};

export const useRuntimeUiStateStore = create<RuntimeUiStateStore>((set) => ({
  showHud: true,
  showSoftPad: true,
  toggleHud: () =>
    set((state) => ({
      showHud: !state.showHud,
    })),
  toggleSoftPad: () =>
    set((state) => ({
      showSoftPad: !state.showSoftPad,
    })),
}));
