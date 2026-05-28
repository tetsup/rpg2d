import { TxContext } from '@database/client/mongo-client';

export type MigrationType = 'index' | 'data' | 'validator';

export type Migration = {
  version: number;
  name: string;
  type: MigrationType;
  transactional: boolean;
  up: (tx: TxContext) => Promise<void>;
  verify?: (tx: TxContext) => Promise<void>;
};
