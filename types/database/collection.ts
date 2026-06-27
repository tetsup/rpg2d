import z from 'zod';
import type { NamespaceInputSchema } from '@schema/database/namespace';
import type { NamespacePermissionDocumentSchema } from '@schema/database/namespace-permission';
import type { createResourceMetaSchema } from '@schema/database/resource';
import type { ResourceEdgeDocumentSchema } from '@schema/database/resource-edge';
import type { UserDocumentSchema } from '@schema/database/user';
import { ResourceData, ResourceType } from '@sharedTypes/resource/common';

export type WithTimestamp<T> = T & { createdAt: Date; updatedAt: Date };

export type NamespacePermissionDocument = z.infer<typeof NamespacePermissionDocumentSchema>;
export type NamespacePermissionInput = NamespacePermissionDocument;

export type NamespaceInput = z.infer<typeof NamespaceInputSchema>;
export type NamespaceDocument = NamespaceInput & { createdBy: string };

export type ResourceEdgeDocument = z.infer<typeof ResourceEdgeDocumentSchema>;
export type ResourceEdgeInput = ResourceEdgeDocument;

export type ResourceMeta<T extends ResourceType> = z.infer<ReturnType<typeof createResourceMetaSchema<T>>>;
export type ResourceDocument<T extends ResourceType = any> = ResourceMeta<T> & { data: ResourceData<T> };
export type ResourceInput<T extends ResourceType = any> = Omit<ResourceDocument<T>, 'id'>;

export type UserDocument = z.infer<typeof UserDocumentSchema>;
export type UserInput = UserDocument;

export type DatabaseInput = {
  namespaces: NamespaceInput;
  users: UserInput;
  resources: ResourceInput;
  namespace_permissions: NamespacePermissionInput;
  resource_edges: ResourceEdgeInput;
};

export type Database = {
  namespaces: WithTimestamp<NamespaceDocument>;
  users: WithTimestamp<UserDocument>;
  resources: WithTimestamp<ResourceDocument>;
  namespace_permissions: WithTimestamp<NamespacePermissionDocument>;
  resource_edges: ResourceEdgeDocument;
};

export type CollectionName = keyof Database;
