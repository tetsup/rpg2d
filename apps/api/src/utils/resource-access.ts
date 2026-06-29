import { ResourceRepository } from '@database/repositories/resource';
import type { ResourcePath } from '@sharedTypes/resource/common';
import type { UserDocument } from '@sharedTypes/database/collection';
import { ApiError, NotFoundError, UnauthorizedError } from '@api/errors/http-error';
import { Action, authorize } from '@api/utils/authorize';

export async function ensureResourceAccess(
  user: UserDocument | undefined,
  path: ResourcePath,
  action: Action
): Promise<UserDocument> {
  if (user == null) throw new UnauthorizedError();

  if (action === Action.UPDATE || action === Action.DELETE) {
    const ownership = await new ResourceRepository().getCreatedBy(path);
    if (!ownership.ok) {
      if (ownership.reason === 'not_found') throw new NotFoundError();
      throw new ApiError(503);
    }
    await authorize(user, path.namespace, action, ownership.data);
    return user;
  }

  await authorize(user, path.namespace, action);
  return user;
}
