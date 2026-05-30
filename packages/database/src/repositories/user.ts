import { Collection } from 'mongodb';
import { UserDocumentSchema } from '@database/schemas/user';
import { execute, TxContext } from '@database/client/mongo-client';
import { UserDocument } from '@database/types/collection';
import { userCollectionBuilder } from '@database/collections/users';

type UserRepositoryOptions = {
  mockCollectionBuilder?: (tx: TxContext) => Collection<UserDocument>;
  mockDocumentSchema?: typeof UserDocumentSchema;
};

export class UserRepository {
  private collectionBuilder: (tx: TxContext) => Collection<UserDocument>;
  private documentSchema: typeof UserDocumentSchema;

  constructor({ mockCollectionBuilder, mockDocumentSchema }: UserRepositoryOptions = {}) {
    this.collectionBuilder = mockCollectionBuilder ?? userCollectionBuilder;
    this.documentSchema = mockDocumentSchema ?? UserDocumentSchema;
  }

  async getUser(sub: string) {
    return await execute(async (tx) => {
      const users = this.collectionBuilder(tx);
      return users.findOne({ sub });
    });
  }

  async upsertUser(data: any) {
    return await execute(async (tx) => {
      const users = this.collectionBuilder(tx);
      const now = new Date();
      const user = this.documentSchema.parse({ ...data, createdAt: now, updatedAt: now });
      return users.updateOne({ sub: user.sub }, { $set: user, $setOnInsert: { createdAt: now } }, { upsert: true });
    });
  }
}
