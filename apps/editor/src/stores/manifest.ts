import { create } from 'zustand';

export type WorkspaceState = {
  manifestId?: string;
};

type WorkspaceStore = {
  current: WorkspaceState;
  setCurrent: (workspace: WorkspaceState) => void;
};

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  current: {},
  setCurrent: (current) =>
    set((state) => ({
      ...state,
      current,
    })),
}));
