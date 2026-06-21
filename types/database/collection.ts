import z from 'zod';
import type { NamespaceInputSchema } from '@schema/database/namespace';
import type { NamespaceMemberDocumentSchema } from '@schema/database/namespace-member';
import type { createResourceMetaSchema } from '@schema/database/resource';
import type { ResourceEdgeDocumentSchema } from '@schema/database/resource-edge';
import type { UserDocumentSchema } from '@schema/database/user';
import { ResourceData, ResourceType } from '@sharedTypes/resource/common';

export type CollectionName = 'namespace' | 'user' | 'resource';

export type WithTimestamp<T> = T & { createdAt: Date; updatedAt: Date };

export type NamespaceMemberDocument = z.infer<typeof NamespaceMemberDocumentSchema>;

export type NamespaceInput = z.infer<typeof NamespaceInputSchema>;

export type NamespaceDocument = NamespaceInput & { createdBy: string };

export type ResourceEdgeDocument = z.infer<typeof ResourceEdgeDocumentSchema>;

export type ResourceMeta<T extends ResourceType> = z.infer<ReturnType<typeof createResourceMetaSchema<T>>>;

export type ResourceDocument<T extends ResourceType = any> = ResourceMeta<T> & { data: ResourceData<T> };

export type UserDocument = z.infer<typeof UserDocumentSchema>;

export type DocumentMap = {
  namespace: NamespaceDocument;
  user: UserDocument;
  resource: ResourceDocument;
};
