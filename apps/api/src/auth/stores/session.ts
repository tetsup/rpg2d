import type { SessionUser } from '@api/types/auth';

const store = new Map<string, SessionUser>();

export const sessionStore = {
  set(id: string, user: SessionUser) {
    store.set(id, user);
  },
  get(id: string) {
    return store.get(id);
  },
  delete(id: string) {
    store.delete(id);
  },
};
