import z from 'zod';
import { ResourceSchemaBase } from '../common';

const SendMessageSchema = z.object({ command: z.literal('sendMessage'), messages: z.array(z.string()) });

const ActionElementSchema = z.discriminatedUnion('command', [SendMessageSchema]);

export const ActionSchema = ResourceSchemaBase('action', { sequence: z.array(ActionElementSchema) });

export type ActionData = z.infer<typeof ActionSchema>;

export type ActionDeps = {};
