import { create } from 'zustand';

export type EditState = {
  isDirty?: boolean;
};

type LayoutStore = {
  editState: EditState;
  setEditState: (state: EditState) => void;
};

export const useLayoutStore = create<LayoutStore>((set) => ({
  editState: {},
  setEditState: (state) =>
    set((prevState) => ({
      ...prevState,
      state,
    })),
}));
