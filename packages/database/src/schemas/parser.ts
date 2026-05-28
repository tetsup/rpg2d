export type ParsedResourceId = {
  namespace: string;
  type: string;
  name: string;
};

export function parseResourceId(id: string): ParsedResourceId {
  const [namespace, type, ...rest] = id.split('/');
  return {
    namespace,
    type,
    name: rest.join('/'),
  };
}
