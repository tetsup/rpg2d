import { ResourceRepository } from '@database/repositories/resource';
import type { ResourcePath } from '@sharedTypes/resource/common';
import type { UserDocument } from '@sharedTypes/database/collection';
import { ApiError, NotFoundError, UnauthorizedError } from '@api/errors/http-error';
import { Action, createAuthorize } from '@api/utils/authorize';

type EnsureResourceAccessDependencies = {
  getCreatedBy: typeof ResourceRepository.prototype.getCreatedBy;
  authorize: ReturnType<typeof createAuthorize>;
};

const defaultDependencies: EnsureResourceAccessDependencies = {
  getCreatedBy: (path) => new ResourceRepository().getCreatedBy(path),
  authorize: createAuthorize(),
};

export function createEnsureResourceAccess(dependencies: EnsureResourceAccessDependencies = defaultDependencies) {
  return async function ensureResourceAccess(
    user: UserDocument | undefined,
    path: ResourcePath,
    action: Action
  ): Promise<UserDocument> {
    if (user == null) throw new UnauthorizedError();

    if (action === Action.UPDATE || action === Action.DELETE) {
      const ownership = await dependencies.getCreatedBy(path);
      if (!ownership.ok) {
        if (ownership.reason === 'not_found') throw new NotFoundError();
        throw new ApiError(503);
      }
      await dependencies.authorize(user, path.namespace, action, ownership.data);
      return user;
    }

    await dependencies.authorize(user, path.namespace, action);
    return user;
  };
}

export const ensureResourceAccess = createEnsureResourceAccess();
