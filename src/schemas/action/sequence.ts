import z from 'zod';

const SendMessageSchema = z.object({ command: z.literal('sendMessage'), messages: z.array(z.string()) });

const SequenceElementSchema = z.discriminatedUnion('command', [SendMessageSchema]);

export const SequenceSchema = z.array(SequenceElementSchema);

export type SequenceData = z.infer<typeof SequenceSchema>;
