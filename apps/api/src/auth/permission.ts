import { ForbiddenError } from '../errors/http-error';
import { User } from './middleware';

export enum Action {
  READ,
  CREATE,
  UPDATE,
  DELETE,
}

const canRead = (user: User, namespace: string) => true;
const canCreate = (user: User, namespace: string) => true;
const canUpdate = (user: User, namespace: string) => true;
const canDelete = (user: User, namespace: string) => true;

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
