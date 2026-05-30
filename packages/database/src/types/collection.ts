import z from 'zod';
import type { ObjectId } from 'mongodb';
import { NamespaceDocumentSchema } from '@database/schemas/namespace';
import { NamespaceMemberDocumentSchema } from '@database/schemas/namespace-member';
import { createResourceDocumentSchema } from '@database/schemas/resource';
import { ResourceEdgeDocumentSchema } from '@database/schemas/resource-edge';
import { UserDocumentSchema } from '@database/schemas/user';

export type WithTimestamp<T> = T & { createdAt: Date; updatedAt: Date };

export type NamespaceMemberDocument = WithTimestamp<z.infer<typeof NamespaceMemberDocumentSchema>>;

export type NamespaceDocument = WithTimestamp<z.infer<typeof NamespaceDocumentSchema>>;

export type ResourceEdgeDocument = z.infer<typeof ResourceEdgeDocumentSchema>;

export type ResourceDocument = WithTimestamp<z.infer<ReturnType<typeof createResourceDocumentSchema>>>;

export type UserDocument = WithTimestamp<z.infer<typeof UserDocumentSchema>>;
