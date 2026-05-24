import type { User } from '../types/auth';
import { ForbiddenError } from '../errors/http-error';

export enum Action {
  READ,
  CREATE,
  UPDATE,
  DELETE,
}

const canRead = (user: User, namespace: string) => {
  void user;
  void namespace;
  return true;
};
const canCreate = (user: User, namespace: string) => {
  void user;
  void namespace;
  return true;
};
const canUpdate = (user: User, namespace: string) => {
  void user;
  void namespace;
  return true;
};
const canDelete = (user: User, namespace: string) => {
  void user;
  void namespace;
  return true;
};

export const authorize = (user: User, namespace: string, action: Action) => {
  switch (action) {
    case Action.READ:
      if (!canRead(user, namespace)) throw new ForbiddenError();
      break;
    case Action.CREATE:
      if (!canCreate(user, namespace)) throw new ForbiddenError();
      break;
    case Action.UPDATE:
      if (!canUpdate(user, namespace)) throw new ForbiddenError();
      break;
    case Action.DELETE:
      if (!canDelete(user, namespace)) throw new ForbiddenError();
      break;
  }
};
