import { execute, withTransaction } from '../src/client/mongo-client';
import { MIGRATION_COLLECTION, MIGRATION_DOCUMENT_ID } from './migration-state';
import { migrations } from './versions';
import { getCurrentVersion } from './get-current-version';

export async function migrate() {
  const currentVersion = await getCurrentVersion();
  const pending = migrations.filter((v) => v.version > currentVersion).sort((a, b) => a.version - b.version);
  for (const migration of pending) {
    console.log(`[migration] start v${migration.version}: ${migration.name}`);
    if (migration.transactional) {
      await withTransaction(async (tx) => {
        await migration.up(tx);
        await migration.verify?.(tx);
        await tx.db
          .collection(MIGRATION_COLLECTION)
          .updateOne(
            { _id: MIGRATION_DOCUMENT_ID as any },
            { $set: { version: migration.version } },
            { upsert: true, session: tx.session }
          );
      });
    } else {
      await execute(async (tx) => {
        await migration.up(tx);
        await migration.verify?.(tx);
        await tx.db
          .collection(MIGRATION_COLLECTION)
          .updateOne({ _id: MIGRATION_DOCUMENT_ID as any }, { $set: { version: migration.version } }, { upsert: true });
      });
    }
    console.log(`[migration] complete v${migration.version}`);
  }
  console.log('[migration] up to date');
}
