import { NamespaceRepository } from '@database/repositories/namespace';
import type { UserDocument } from '@sharedTypes/database/collection';
import { ForbiddenError } from '../errors/http-error';

export enum Action {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ADMIN = 'admin',
}

function isAdmin(user: UserDocument) {
  return user.roles.includes('admin');
}

export async function authorize(user: UserDocument, namespace: string, action: Action) {
  if (isAdmin(user)) return;

  const permissions = await new NamespaceRepository().checkPermissions({
    namespaceId: namespace,
    userId: user.id,
  });
  if (!permissions.ok) throw new ForbiddenError();

  if (permissions.data.admin) return;

  switch (action) {
    case Action.ADMIN:
      throw new ForbiddenError();
    case Action.READ:
      if (!permissions.data.read) {
        throw new ForbiddenError();
      }
      break;
    case Action.CREATE:
      if (!permissions.data.create) {
        throw new ForbiddenError();
      }
      break;
    case Action.UPDATE:
      if (!permissions.data.update) {
        throw new ForbiddenError();
      }
      break;
    case Action.DELETE:
      if (!permissions.data.delete) {
        throw new ForbiddenError();
      }
      break;
  }
}
