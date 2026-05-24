import { User } from 'apps/api/types/auth';

const store = new Map<string, User>();

export const sessionStore = {
  set(id: string, user: User) {
    store.set(id, user);
  },
  get(id: string) {
    return store.get(id);
  },
  delete(id: string) {
    store.delete(id);
  },
};
