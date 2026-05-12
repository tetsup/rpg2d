import z from 'zod';
import { ResourceSchemaBase } from '../common';
import { SequenceSchema } from './sequence';

export const ActionSchema = ResourceSchemaBase('action', { sequence: SequenceSchema });

export type ActionData = z.infer<typeof ActionSchema>;

export type ActionDeps = {};
