import z from 'zod';
import {
  createBTreeDateFilterSchema,
  createBTreeStringFilterSchema,
  createJsonFilterSchema,
  createTrgmStringFilterSchema,
} from './mapper';

export const FreeTextFilterSchema = z.object({ name: z.literal('q'), value: z.string().max(50) });

export const NamespaceFilterElementSchema = z.discriminatedUnion('name', [
  FreeTextFilterSchema,
  createBTreeStringFilterSchema('id'),
  createBTreeStringFilterSchema('presenceName'),
  createTrgmStringFilterSchema('description'),
  createBTreeDateFilterSchema('createdAt'),
  createBTreeDateFilterSchema('updatedAt'),
  createBTreeDateFilterSchema('members.userId'),
]);

export const NamespaceFilterSchema = z.array(NamespaceFilterElementSchema);

export const ResourceFilterElementSchema = z.discriminatedUnion('name', [
  FreeTextFilterSchema,
  createTrgmStringFilterSchema('id'),
  createBTreeStringFilterSchema('namespace'),
  createBTreeStringFilterSchema('type'),
  createBTreeStringFilterSchema('name'),
  createTrgmStringFilterSchema('description'),
  createJsonFilterSchema('data'),
  createBTreeDateFilterSchema('createdAt'),
  createBTreeDateFilterSchema('updatedAt'),
]);

export const ResourceFilterSchema = z.array(ResourceFilterElementSchema);

export const UserFilterElementSchema = z.discriminatedUnion('name', [
  FreeTextFilterSchema,
  createBTreeStringFilterSchema('id'),
  createTrgmStringFilterSchema('presenceName'),
  createTrgmStringFilterSchema('email'),
]);

export const UserFilterSchema = z.array(UserFilterElementSchema);
