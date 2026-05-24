export type DataMode = 'sample' | 'workspace' | 'prod';

export const dataMode: DataMode = (process.env.DATA_MODE as DataMode) ?? 'sample';
