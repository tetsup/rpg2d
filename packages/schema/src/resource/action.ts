import z from 'zod';
import { SequenceSchema } from './action/sequence';
import { IdSchemaFromType } from './common/base';

export const ActionSchema = z.object({ id: IdSchemaFromType('action'), sequence: SequenceSchema });
