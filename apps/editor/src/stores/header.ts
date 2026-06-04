import { create } from 'zustand';

export type HeaderState = {
  categoryKey?: string;
  titleKey?: string;
  subtitle?: string;
  isDirty?: boolean;
};

type LayoutStore = {
  header: HeaderState;
  setHeader: (header: HeaderState) => void;
};

export const useLayoutStore = create<LayoutStore>((set) => ({
  header: {},
  setHeader: (header) =>
    set((state) => ({
      ...state,
      header,
    })),
}));
