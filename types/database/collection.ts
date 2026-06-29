import z from 'zod';
import type { NamespaceInputSchema } from '@schema/database/namespace';
import type { NamespacePermissionInputSchema } from '@schema/database/namespace-permission';
import type { createResourceInputSchema } from '@schema/database/resource';
import type { ResourceEdgeInputSchema } from '@schema/database/resource-edge';
import type { UserInputSchema } from '@schema/database/user';
import type { ResourceType } from '@sharedTypes/resource/common';

export type WithTimestamp<T> = T & { createdAt: Date; updatedAt: Date };

export type NamespacePermissionInput = z.infer<typeof NamespacePermissionInputSchema>;
export type NamespacePermissionDocument = NamespacePermissionInput;

export type NamespaceInput = z.infer<typeof NamespaceInputSchema>;
export type NamespaceDocument = NamespaceInput & { createdBy: string };

export type ResourceEdgeInput = z.infer<typeof ResourceEdgeInputSchema>;
export type ResourceEdgeDocument = ResourceEdgeInput;

export type ResourceInput<T extends ResourceType = ResourceType> = z.infer<
  ReturnType<typeof createResourceInputSchema<T>>
>;
export type ResourceDocument<T extends ResourceType = ResourceType> = ResourceInput<T> & { id: string };

export type ResourceRecord<T extends ResourceType = ResourceType> = WithTimestamp<ResourceDocument<T>> & {
  createdBy: string;
};

export type ResourceMeta<T extends ResourceType = ResourceType> = Pick<
  ResourceDocument<T>,
  'id' | 'namespace' | 'type' | 'name' | 'version' | 'description' | 'isValid'
>;

export type UserInput = z.infer<typeof UserInputSchema>;
export type UserDocument = UserInput;

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
  resources: ResourceRecord;
  namespace_permissions: WithTimestamp<NamespacePermissionDocument>;
  resource_edges: ResourceEdgeDocument;
};

export type CollectionName = keyof Database;
