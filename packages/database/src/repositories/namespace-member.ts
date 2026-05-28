import { execute } from '@database/client/mongo-client';
import { namespaceMembersCollection } from '../collections/namespace-members';

type FindNamespaceMemberParams = { namespaceId: string; userId: string };

type UpsertNamespaceMemberParams = {
  namespaceId: string;
  userId: string;
  permissions: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
};

export async function findNamespaceMember({ namespaceId, userId }: FindNamespaceMemberParams) {
  return await execute(async (tx) => {
    const members = namespaceMembersCollection(tx);
    return members.findOne({
      namespaceId,
      userId,
    });
  });
}

export async function upsertNamespaceMember({ namespaceId, userId, permissions }: UpsertNamespaceMemberParams) {
  return await execute(async (tx) => {
    const members = namespaceMembersCollection(tx);
    const now = new Date();
    return await members.updateOne(
      {
        namespaceId,
        userId,
      },
      {
        $set: {
          permissions,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      {
        upsert: true,
      }
    );
  });
}
