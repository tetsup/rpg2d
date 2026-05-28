import { UserDocumentSchema } from '@database/schemas/user';
import { usersCollection } from '../collections/users';
import { execute } from '@database/client/mongo-client';

export async function getUser(sub: string) {
  return await execute(async (tx) => {
    const users = usersCollection(tx);
    return users.findOne({
      sub,
    });
  });
}

export async function upsertUser(data: any) {
  return await execute(async (tx) => {
    const users = usersCollection(tx);
    const now = new Date();
    const user = UserDocumentSchema.parse({ ...data, createdAt: now, updatedAt: now });
    return users.updateOne(
      {
        sub: user.sub,
      },
      {
        $set: user,
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
