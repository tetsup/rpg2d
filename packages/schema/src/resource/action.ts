import z from 'zod';
import { SequenceSchema } from './action/sequence';

export const ActionSchema = z.object({ sequence: SequenceSchema });
