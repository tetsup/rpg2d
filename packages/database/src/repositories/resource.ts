import type { Collection, DeleteResult, Filter } from 'mongodb';
import type { ResourceType } from '@sharedTypes/resource/common';
import { ResourceSchemaUnion } from '@schema/resource/common/resolver';
import { splitId } from '@schema/resource/common/base';
import { extractResourceRefs } from '@database/utils/refs';
import { RepositoryNotFoundError, RepositoryResult, repositorySafe } from './util';
import { execute, TxContext, withTransaction } from '@database/client/mongo-client';
import { ResourceDocument, ResourceEdgeDocument } from '@database/types/collection';
import { resourceCollectionBuilder } from '@database/collections/resources';
import { resourceEdgeCollectionBuilder } from '@database/collections/resource-edges';
import { createResourceDocumentSchema } from '@database/schemas/resource';

type SaveParams = {
  data: object;
  create: boolean;
};

type FindParams = {
  query?: string;
  type?: string;
  namespace?: string;
  cursor?: string;
  limit?: number;
};

type ResourceRepositoryOptions = {
  mockCollectionBuilder?: (tx: TxContext) => Collection<ResourceDocument>;
  mockEdgeCollectionBuilder?: (tx: TxContext) => Collection<ResourceEdgeDocument>;
  mockResourceSchema?: typeof ResourceSchemaUnion;
  mockSplitIdSchema?: typeof splitId;
  mockDocumentSchema?: typeof createResourceDocumentSchema;
};

export class ResourceRepository {
  private collectionBuilder: (tx: TxContext) => Collection<ResourceDocument>;
  private edgeCollectionBuilder: (tx: TxContext) => Collection<ResourceEdgeDocument>;
  private resourceSchema: typeof ResourceSchemaUnion;
  private splitIdSchema: typeof splitId;
  private documentSchema: typeof createResourceDocumentSchema;

  constructor({
    mockCollectionBuilder,
    mockEdgeCollectionBuilder,
    mockResourceSchema,
    mockSplitIdSchema,
    mockDocumentSchema,
  }: ResourceRepositoryOptions = {}) {
    ((this.collectionBuilder = mockCollectionBuilder ?? resourceCollectionBuilder),
      (this.edgeCollectionBuilder = mockEdgeCollectionBuilder ?? resourceEdgeCollectionBuilder),
      (this.resourceSchema = mockResourceSchema ?? ResourceSchemaUnion),
      (this.splitIdSchema = mockSplitIdSchema ?? splitId),
      (this.documentSchema = mockDocumentSchema ?? createResourceDocumentSchema));
  }

  async create(data: object): Promise<RepositoryResult<void>> {
    return await this.save({ data, create: true });
  }

  async update(data: object): Promise<RepositoryResult<void>> {
    return await this.save({ data, create: false });
  }

  async save({ data, create }: SaveParams): Promise<RepositoryResult<void>> {
    return await withTransaction(async (tx) => {
      return await repositorySafe(async () => {
        const resources = this.collectionBuilder(tx);
        const edges = this.edgeCollectionBuilder(tx);
        const parsed = this.resourceSchema.parse(data);
        const id = parsed.id;
        const { namespace, type, name } = this.splitIdSchema.parse(parsed.id);
        const refs = extractResourceRefs(parsed);
        const document = this.documentSchema(type as ResourceType).parse({
          id,
          namespace,
          type,
          name,
          refs,
          data,
        });
        const now = new Date();
        if (create) {
          await resources.insertOne({
            ...document,
            createdAt: now,
            updatedAt: now,
          });
        } else {
          const result = await resources.updateOne(
            { id },
            { $set: { ...document, updatedAt: now } },
            { upsert: false }
          );
          if (result.matchedCount === 0) throw new RepositoryNotFoundError();
          await edges.deleteMany({ from: id });
        }
        if (refs.length > 0) {
          await edges.insertMany(refs.map((ref) => ({ from: id, to: ref, type: 'reference' })));
        }
      });
    });
  }

  async get(id: string): Promise<RepositoryResult<any>> {
    return await execute(async (tx) => {
      return await repositorySafe(async () => {
        const resources = this.collectionBuilder(tx);
        const resource = await resources.findOne({ id });
        if (!resource) throw new RepositoryNotFoundError();

        return resource.data;
      });
    });
  }

  async find({ query, type, namespace, cursor, limit = 40 }: FindParams): Promise<
    RepositoryResult<{
      items: any[];
      hasMore: boolean;
      nextCursor?: string;
    }>
  > {
    return await withTransaction(async (tx) => {
      return await repositorySafe(async () => {
        const resources = this.collectionBuilder(tx);
        const filter: Filter<any> = {};
        if (type) filter.type = type;

        if (namespace) filter.namespace = namespace;
        if (query) filter.id = { $regex: query, $options: 'i' };
        if (cursor) filter.id = { ...(filter.id ?? {}), $gt: cursor };
        console.log(resources.find);
        const items = await resources
          .find(filter)
          .sort({ id: 1 })
          .limit(limit + 1)
          .map((row) => row.data)
          .toArray();
        const hasMore = items.length > limit;
        const sliced = items.slice(0, limit);

        return {
          items: sliced,
          hasMore,
          nextCursor: hasMore ? sliced.at(-1)?.id : undefined,
        };
      });
    });
  }

  async findIncomingReferences(id: string): Promise<RepositoryResult<any[]>> {
    return await execute(async (tx) => {
      return await repositorySafe(async () => {
        const edges = this.edgeCollectionBuilder(tx);
        return edges.find({ to: id }).toArray();
      });
    });
  }

  async delete(id: string): Promise<RepositoryResult<DeleteResult>> {
    return await withTransaction(async (tx) => {
      return await repositorySafe(async () => {
        const resources = this.collectionBuilder(tx);
        const edges = this.edgeCollectionBuilder(tx);
        const result = await resources.deleteOne({ id });
        if (result.deletedCount === 0) throw new RepositoryNotFoundError();
        return await edges.deleteMany({
          $or: [{ from: id }, { to: id }],
        });
      });
    });
  }
}
