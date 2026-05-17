import { ResourceSchemaBase } from './common/base';
import { SequenceSchema } from './action/sequence';

export const ActionSchema = ResourceSchemaBase('action', { sequence: SequenceSchema });
