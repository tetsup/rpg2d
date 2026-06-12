import z from 'zod';
import { NamespaceDocumentSchema } from '@schema/database/namespace';

export type NamespaceDocument = z.infer<typeof NamespaceDocumentSchema>;
