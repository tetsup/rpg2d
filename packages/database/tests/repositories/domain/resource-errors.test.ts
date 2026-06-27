import { MongoNetworkError, MongoServerError, MongoServerSelectionError } from 'mongodb';
import { ZodError } from 'zod';
import type { ResourcePath } from '@sharedTypes/resource/common';
import type { ResourceMeta } from '@sharedTypes/database/collection';
import { ResourceRepository } from '@database/repositories/resource';

const validPath = {
  namespace: 'sample',
  type: 'player',
  name: 'hero',
} as ResourcePath;

const validMetadata = {
  ...validPath,
  version: 0,
  isReadOnly: false,
  isValid: true,
  description: 'this is resource',
} as ResourceMeta;

const validData = {
  name: {
    type: 'fixed',
    value: 'hero',
  },
  initialSkin: 'sample/skin/hero.v0',
  initialState: {
    hp: 100,
  },
} as const;

const validDocument = {
  ...validMetadata,
  data: validData,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('resource repository error mapping', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('maps MongoNetworkError', async () => {
      const resources = new ResourceRepository({
        mockCollectionBuilder: () =>
          ({
            findOne: vi.fn().mockRejectedValue(new MongoNetworkError('network')),
          }) as any,
      });

      const result = await resources.get(validPath);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('network_error');
    });

    it('maps MongoServerSelectionError', async () => {
      const resources = new ResourceRepository({
        mockCollectionBuilder: () =>
          ({
            findOne: vi.fn().mockRejectedValue(new MongoServerSelectionError('selection', {} as any)),
          }) as any,
      });
      const result = await resources.get(validPath);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('network_error');
    });

    it('maps unknown error', async () => {
      const resources = new ResourceRepository({
        mockCollectionBuilder: () =>
          ({
            findOne: vi.fn().mockRejectedValue(new Error('unknown')),
          }) as any,
      });

      const result = await resources.get(validPath);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('unknown');
    });
  });

  describe('create', () => {
    it('maps validation_failed', async () => {
      const resources = new ResourceRepository({
        mockResourceDocumentSchema: () => ({ parse: vi.fn().mockThrow(new ZodError([])) }) as any,
      });
      const result = await resources.create(validPath, validDocument);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('validation_failed');
    });

    it('maps already_exists', async () => {
      const error = new MongoServerError({
        message: 'duplicate',
      });
      error.code = 11000;

      const resources = new ResourceRepository({
        mockCollectionBuilder: () =>
          ({
            insertOne: vi.fn().mockRejectedValue(error),
          }) as any,
      });
      const result = await resources.create(validPath, validDocument);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('already_exists');
    });

    it('maps timeout', async () => {
      const error = new MongoServerError({
        message: 'timeout',
      });
      error.code = 50;

      const resources = new ResourceRepository({
        mockCollectionBuilder: () =>
          ({
            insertOne: vi.fn().mockRejectedValue(error),
          }) as any,
      });
      const result = await resources.create(validPath, validDocument);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('database_error');
    });

    it('maps database_error', async () => {
      const error = new MongoServerError({
        message: 'write conflict',
      });
      error.code = 112;

      const resources = new ResourceRepository({
        mockCollectionBuilder: () =>
          ({
            insertOne: vi.fn().mockRejectedValue(error),
          }) as any,
      });
      const result = await resources.create(validPath, validDocument);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('database_error');
    });

    it('maps network_error', async () => {
      const resources = new ResourceRepository({
        mockCollectionBuilder: () =>
          ({
            insertOne: vi.fn().mockRejectedValue(new MongoNetworkError('network')),
          }) as any,
      });

      const result = await resources.create(validPath, validDocument);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('network_error');
    });

    it('maps unknown', async () => {
      const resources = new ResourceRepository({
        mockCollectionBuilder: () =>
          ({
            insertOne: vi.fn().mockRejectedValue(new Error('unknown')),
          }) as any,
      });
      const result = await resources.create(validPath, validDocument);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('unknown');
    });
  });

  describe('update', () => {
    it('maps validation_failed', async () => {
      const resources = new ResourceRepository({
        mockResourceDocumentSchema: () => ({ parse: vi.fn().mockThrow(new ZodError([])) }) as any,
      });
      const result = await resources.update(validPath, {} as any);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('validation_failed');
    });

    it('maps timeout', async () => {
      const error = new MongoServerError({
        message: 'timeout',
      });
      error.code = 50;

      const resources = new ResourceRepository({
        mockCollectionBuilder: () => ({ updateOne: vi.fn().mockRejectedValue(error) }) as any,
      });
      const result = await resources.update(validPath, validDocument);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('database_error');
    });

    it('maps database_error', async () => {
      const error = new MongoServerError({
        message: 'db',
      });
      error.code = 112;

      const resources = new ResourceRepository({
        mockCollectionBuilder: () => ({ updateOne: vi.fn().mockRejectedValue(error) }) as any,
      });

      const result = await resources.update(validPath, validDocument);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('database_error');
    });
  });

  describe('find', () => {
    it('maps network_error', async () => {
      const resources = new ResourceRepository({
        mockCollectionBuilder: () =>
          ({
            find: vi.fn().mockThrow(new MongoNetworkError('network error')),
          }) as any,
      });

      const result = await resources.find({});

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('network_error');
    });
  });

  describe('findIncomingReferences', () => {
    it('maps network_error', async () => {
      const resources = new ResourceRepository({
        mockEdgeCollectionBuilder: () =>
          ({
            find: vi.fn(() => ({
              toArray: vi.fn().mockRejectedValue(new MongoNetworkError('network')),
            })),
          }) as any,
      });
      const result = await resources.findIncomingReferences(validPath);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('network_error');
    });
  });

  describe('delete', () => {
    it('maps timeout', async () => {
      const error = new MongoServerError({
        message: 'timeout',
      });
      error.code = 50;

      const resources = new ResourceRepository({
        mockCollectionBuilder: () => ({ deleteOne: vi.fn().mockRejectedValue(error) }) as any,
      });
      const result = await resources.delete(validPath);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('database_error');
    });

    it('maps database_error', async () => {
      const error = new MongoServerError({
        message: 'shutdown',
      });
      error.code = 91;

      const resources = new ResourceRepository({
        mockCollectionBuilder: () => ({ deleteOne: vi.fn().mockRejectedValue(error) }) as any,
      });
      const result = await resources.delete(validPath);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('database_error');
    });

    it('maps network_error', async () => {
      const resources = new ResourceRepository({
        mockCollectionBuilder: () =>
          ({ deleteOne: vi.fn().mockRejectedValue(new MongoNetworkError('network')) }) as any,
      });
      const result = await resources.delete(validPath);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('network_error');
    });

    it('maps unknown', async () => {
      const resources = new ResourceRepository({
        mockCollectionBuilder: () => ({ deleteOne: vi.fn().mockRejectedValue(new Error('unknown')) }) as any,
      });
      const result = await resources.delete(validPath);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('unknown');
    });
  });
});
