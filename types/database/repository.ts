import type z from 'zod';
import type { NamespaceFilterSchema } from '@schema/database/namespace';
import type { createValidResourceDocumentSchema } from '@schema/database/resource';
import type { UserFilterSchema } from '@schema/database/user';

export type ResourceFilterInput = z.input<ReturnType<typeof createValidResourceDocumentSchema>>;
export type ResourceFilter = z.output<ReturnType<typeof createValidResourceDocumentSchema>>;
export type NamespaceFilterInput = z.input<typeof NamespaceFilterSchema>;
export type NamespaceFilter = z.output<typeof NamespaceFilterSchema>;
export type UserFilterInput = z.input<typeof UserFilterSchema>;
export type UserFilter = z.output<typeof UserFilterSchema>;

export type DocumentFilterInput = {
  resource: ResourceFilterInput;
  namespace: NamespaceFilterInput;
  user: UserFilterInput;
};
