import z from 'zod';
import { ResourceSchemaBase } from '../common';

const actionCommands = ['message'] as const;

const ActionCommandSchema = z.enum(actionCommands);

export const ActionSchema = ResourceSchemaBase('action', { command: ActionCommandSchema, message: z.string() });

export type ActionData = z.infer<typeof ActionSchema>;

export type ActionDeps = {};
