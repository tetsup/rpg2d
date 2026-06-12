import z from 'zod';
import type { NamespaceDocumentSchema } from '@schema/database/namespace';
import type { NamespaceMemberDocumentSchema } from '@schema/database/namespace-member';
import type { createResourceDocumentSchema, createResourceMetaSchema } from '@schema/database/resource';
import type { ResourceEdgeDocumentSchema } from '@schema/database/resource-edge';
import type { UserDocumentSchema } from '@schema/database/user';

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
