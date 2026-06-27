import type z from 'zod';
import type {
  BooleanOps,
  BTreeDateOps,
  BTreeNumberOps,
  BTreeStringOps,
  FullTextOps,
  JsonOps,
  TrgmOps,
} from '@schema/filter/operator';
import {
  FreeTextFilterSchema,
  NamespaceFilterElementSchema,
  ResourceFilterElementSchema,
  UserFilterElementSchema,
} from '@schema/filter/domain';

export type FilterOp =
  | z.infer<typeof BTreeStringOps>
  | z.infer<typeof BTreeNumberOps>
  | z.infer<typeof BTreeDateOps>
  | z.infer<typeof TrgmOps>
  | z.infer<typeof JsonOps>
  | z.infer<typeof FullTextOps>
  | z.infer<typeof BooleanOps>;

export type FilterMap = {
  namespaces: z.infer<typeof NamespaceFilterElementSchema>;
  resources: z.infer<typeof ResourceFilterElementSchema>;
  users: z.infer<typeof UserFilterElementSchema>;
};

export type FreeTextFilter = z.infer<typeof FreeTextFilterSchema>;
