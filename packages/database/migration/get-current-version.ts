import { execute } from '@database/index';
import { MIGRATION_COLLECTION, MIGRATION_DOCUMENT_ID } from './migration-state';

export async function getCurrentVersion() {
  return await execute(async (tx) => {
    const document = await tx.db
      .collection(MIGRATION_COLLECTION)
      .findOne<{ version: number }>({ _id: MIGRATION_DOCUMENT_ID as any });
    return document?.version ?? 0;
  });
}
