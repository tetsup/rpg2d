import { NamespaceRepository } from '@database/repositories/namespace';
import type { NamespaceCapabilities } from '@schema/database/namespace-capabilities';
import type { UserDocument } from '@sharedTypes/database/collection';
import { ForbiddenError } from '../errors/http-error';

export enum Action {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ADMIN = 'admin',
}

type AuthorizeDependencies = {
  checkPermissions: typeof NamespaceRepository.prototype.checkPermissions;
};

const defaultDependencies: AuthorizeDependencies = {
  checkPermissions: (...args) => new NamespaceRepository().checkPermissions(...args),
};

function isAdmin(user: UserDocument) {
  return user.roles.includes('admin');
}

async function resolveCapabilities(
  user: UserDocument,
  namespace: string,
  dependencies: AuthorizeDependencies
): Promise<NamespaceCapabilities> {
  if (isAdmin(user)) {
    return { read: true, create: true, update: true, admin: true };
  }

  const permissions = await dependencies.checkPermissions({
    namespaceId: namespace,
    userId: user.id,
  });
  if (!permissions.ok) throw new ForbiddenError();

  return permissions.data;
}

export function createAuthorize(dependencies: AuthorizeDependencies = defaultDependencies) {
  return async function authorize(
    user: UserDocument,
    namespace: string,
    action: Action,
    resourceCreatedBy?: string
  ) {
    const capabilities = await resolveCapabilities(user, namespace, dependencies);

    switch (action) {
      case Action.ADMIN:
        if (!capabilities.admin) throw new ForbiddenError();
        return;
      case Action.READ:
        if (!capabilities.read) throw new ForbiddenError();
        return;
      case Action.CREATE:
        if (!capabilities.create) throw new ForbiddenError();
        return;
      case Action.UPDATE:
      case Action.DELETE:
        if (capabilities.update) return;
        if (!capabilities.create) throw new ForbiddenError();
        if (resourceCreatedBy == null || resourceCreatedBy !== user.id) throw new ForbiddenError();
        return;
    }
  };
}

export const authorize = createAuthorize();
