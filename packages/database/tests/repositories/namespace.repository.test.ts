import type { Collection } from 'mongodb';
import { MongoServerError } from 'mongodb';
import { NamespaceRepository } from '@database/repositories/namespace';
import type { NamespaceDocument, NamespaceMemberDocument } from '@database/types/collection';

describe('namespace repository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('create', () => {
    it('maps namespace insert failure', async () => {
      const error = new MongoServerError({
        message: 'duplicate namespace',
      });
      error.code = 11000;
      const insertNamespace = vi.fn().mockRejectedValue(error);
      const insertMember = vi.fn().mockResolvedValue({ acknowledged: true, insertedId: 'member-id' });
      const repository = new NamespaceRepository({
        mockCollectionBuilder: () =>
          ({
            insertOne: insertNamespace,
          }) as unknown as Collection<NamespaceDocument>,
        mockMemberCollectionBuilder: () =>
          ({
            insertOne: insertMember,
          }) as unknown as Collection<NamespaceMemberDocument>,
      });

      const result = await repository.create({
        id: 'sample',
        displayName: 'Sample',
        createdBy: 'owner-user',
      });

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('already_exists');
      }

      expect(insertMember).not.toHaveBeenCalled();
    });
  });
});
