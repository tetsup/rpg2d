import { type ClientSession, type Collection, type DeleteResult, type Filter, ObjectId } from 'mongodb';
import type {
  ResourceDocument,
  ResourceEdgeDocument,
  ResourceMeta,
  WithTimestamp,
} from '@sharedTypes/database/collection';
import type { ResourceId, ResourcePath } from '@sharedTypes/resource/common';
import { splitId } from '@schema/resource/common/base';
import { createResourceDocumentSchema } from '@schema/database/resource';
import { buildId, extractResourceRefs } from '@database/utils/resource';
import { RepositoryNotFoundError, RepositoryResult, repositorySafe } from './util';
import { execute, withTransaction, type TxContext } from '@database/client/mongo-client';
import { resourceCollectionBuilder } from '@database/collections/resources';
import { resourceEdgeCollectionBuilder } from '@database/collections/resource-edges';

type FindParams = {
  name?: string;
  type?: string;
  namespace?: string;
  cursor?: string;
  limit?: number;
};

type ResourceRepositoryOptions = {
  mockCollectionBuilder?: (tx: TxContext) => Collection<WithTimestamp<ResourceDocument>>;
  mockEdgeCollectionBuilder?: (tx: TxContext) => Collection<ResourceEdgeDocument>;
  mockResourceDocumentSchema?: typeof createResourceDocumentSchema;
  mockSplitIdSchema?: typeof splitId;
};

async function cleanRefs(path: ResourcePath, collection: Collection<ResourceEdgeDocument>, session?: ClientSession) {
  await collection.deleteMany({ from: buildId(path) }, { session });
}

async function updateRefs(
  path: ResourcePath,
  refs: ResourceId[],
  collection: Collection<ResourceEdgeDocument>,
  session?: ClientSession
) {
  if (!refs) return;
  await collection.insertMany(
    refs.map((ref) => ({ from: buildId(path), to: ref, type: 'reference' })),
    { session }
  );
}

function getPath(meta: ResourceMeta) {
  return { namespace: meta.namespace, type: meta.type, name: meta.name };
}
export class ResourceRepository {
  private collectionBuilder: (tx: TxContext) => Collection<WithTimestamp<ResourceDocument>>;
  private edgeCollectionBuilder: (tx: TxContext) => Collection<ResourceEdgeDocument>;
  private resourceDocumentSchema: typeof createResourceDocumentSchema;

  constructor({
    mockCollectionBuilder,
    mockEdgeCollectionBuilder,
    mockResourceDocumentSchema,
  }: ResourceRepositoryOptions = {}) {
    this.collectionBuilder = mockCollectionBuilder ?? resourceCollectionBuilder;
    this.edgeCollectionBuilder = mockEdgeCollectionBuilder ?? resourceEdgeCollectionBuilder;
    this.resourceDocumentSchema = mockResourceDocumentSchema ?? createResourceDocumentSchema;
  }

  async create(path: ResourcePath, data: object): Promise<RepositoryResult<void>> {
    return await repositorySafe(async () => {
      const parsed = this.resourceDocumentSchema(path.type).parse(data);
      if (parsed.namespace !== path.namespace) throw new Error('namespace does not match');
      if (parsed.type !== path.type) throw new Error('type does not match');
      if (parsed.name !== path.name) throw new Error('name does not match');
      const now = new Date();
      return await withTransaction(async (tx) => {
        const resources = this.collectionBuilder(tx);
        const edges = this.edgeCollectionBuilder(tx);
        await resources.insertOne({ ...parsed, createdAt: now, updatedAt: now }, { session: tx.session });
        await updateRefs(path, extractResourceRefs(data), edges, tx.session);
      });
    });
  }

  async update(path: ResourcePath, data: object): Promise<RepositoryResult<void>> {
    return await repositorySafe(async () => {
      const parsed = this.resourceDocumentSchema(path.type).parse(data);
      if (parsed.namespace !== path.namespace) throw new Error('cannot change namespace');
      if (parsed.type !== path.type) throw new Error('cannot change type');
      const now = new Date();
      const newPath = getPath(parsed);
      return await withTransaction(async (tx) => {
        const resources = this.collectionBuilder(tx);
        const edges = this.edgeCollectionBuilder(tx);
        const result = await resources.updateOne(
          path,
          { $set: { ...parsed, updatedAt: now } },
          { session: tx.session }
        );
        if (result.matchedCount == 0) throw new RepositoryNotFoundError();
        await cleanRefs(path, edges, tx.session);
        await updateRefs(newPath, extractResourceRefs(data), edges, tx.session);
      });
    });
  }

  async get(path: ResourcePath): Promise<RepositoryResult<any>> {
    return await repositorySafe(async () => {
      return await execute(async (tx) => {
        const resources = this.collectionBuilder(tx);
        const resource = await resources.findOne(path);
        if (!resource) throw new RepositoryNotFoundError();

        return resource.data;
      });
    });
  }

  async find({ name, type, namespace, cursor, limit = 40 }: FindParams): Promise<
    RepositoryResult<{
      items: any[];
      hasMore: boolean;
      nextCursor?: string;
    }>
  > {
    return await repositorySafe(async () => {
      return await withTransaction(async (tx) => {
        const resources = this.collectionBuilder(tx);
        const filter: Filter<any> = {};
        if (type) filter.type = type;
        if (namespace) filter.namespace = namespace;
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (cursor) filter._id = { $gt: new ObjectId(cursor) };
        const items = await resources
          .find(filter)
          .sort({ _id: 1 })
          .limit(limit + 1)
          .toArray();
        const hasMore = items.length > limit;
        const sliced = items.slice(0, limit);

        return {
          items: sliced,
          hasMore,
          nextCursor: hasMore ? sliced.at(-1)?._id?.toHexString() : undefined,
        };
      });
    });
  }

  async findIncomingReferences(path: ResourcePath): Promise<RepositoryResult<any[]>> {
    return await repositorySafe(async () => {
      return await execute(async (tx) => {
        const edges = this.edgeCollectionBuilder(tx);
        return edges.find({ to: buildId(path) }).toArray();
      });
    });
  }

  async delete(path: ResourcePath): Promise<RepositoryResult<DeleteResult>> {
    return await repositorySafe(async () => {
      return await withTransaction(async (tx) => {
        const resources = this.collectionBuilder(tx);
        const edges = this.edgeCollectionBuilder(tx);
        const result = await resources.deleteOne(path);
        if (result.deletedCount === 0) throw new RepositoryNotFoundError();

        const id = buildId(path);
        await edges.deleteMany({
          $or: [{ from: id }, { to: id }],
        });
        return result;
      });
    });
  }
}
