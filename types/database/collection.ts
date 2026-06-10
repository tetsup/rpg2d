import z from 'zod';
import type { NamespaceDocumentSchema } from '@database/schemas/namespace';
import type { NamespaceMemberDocumentSchema } from '@database/schemas/namespace-member';
import type { createResourceDocumentSchema, createResourceMetaSchema } from '@database/schemas/resource';
import type { ResourceEdgeDocumentSchema } from '@database/schemas/resource-edge';
import type { UserDocumentSchema } from '@database/schemas/user';

export type CollectionName = 'namespace' | 'user' | 'resource';

export type WithTimestamp<T> = T & { createdAt: Date; updatedAt: Date };

export type NamespaceMemberDocument = WithTimestamp<z.infer<typeof NamespaceMemberDocumentSchema>>;

export type NamespaceDocument = WithTimestamp<z.infer<typeof NamespaceDocumentSchema>>;

export type ResourceEdgeDocument = z.infer<typeof ResourceEdgeDocumentSchema>;

export type ResourceDocument = WithTimestamp<z.infer<ReturnType<typeof createResourceDocumentSchema>>>;

export type ResourceMeta = z.infer<ReturnType<typeof createResourceMetaSchema>>;

export type UserDocument = WithTimestamp<z.infer<typeof UserDocumentSchema>>;

export type DocumentMap = {
  namespace: NamespaceDocument;
  resource: ResourceDocument;
  user: UserDocument;
};
