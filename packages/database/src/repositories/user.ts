import { Collection } from 'mongodb';
import type { UserDocument } from '@sharedTypes/database/collection';
import { UserDocumentSchema } from '@schema/database/user';
import { execute, TxContext } from '@database/client/mongo-client';
import { userCollectionBuilder } from '@database/collections/users';
import { RepositoryNotFoundError, repositorySafe } from './util';

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

  async get(id: string) {
    return await repositorySafe(async () => {
      return await execute(async (tx) => {
        const users = this.collectionBuilder(tx);
        const user = users.findOne({ id });
        if (!user) throw new RepositoryNotFoundError();

        return user;
      });
    });
  }

  async update(data: any, upsert: boolean = false) {
    return await repositorySafe(async () => {
      return await execute(async (tx) => {
        const users = this.collectionBuilder(tx);
        const now = new Date();
        const user = this.documentSchema.parse({ ...data, createdAt: now, updatedAt: now });
        return await users.updateOne({ id: user.id }, { $set: user, $setOnInsert: { createdAt: now } }, { upsert });
      });
    });
  }

  async upsert(data: any) {
    return await this.update(data, true);
  }
}
