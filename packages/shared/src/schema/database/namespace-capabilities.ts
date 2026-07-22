import type { NamespacePermissionInputSchema } from './namespace-permission';
import type z from 'zod';

export type NamespacePermission = z.infer<typeof NamespacePermissionInputSchema>['permission'];

export type NamespaceCapabilities = {
  read: boolean;
  create: boolean;
  update: boolean;
  admin: boolean;
};

const noCapabilities: NamespaceCapabilities = {
  read: false,
  create: false,
  update: false,
  admin: false,
};

export function resolveNamespaceCapabilities(permissions: NamespacePermission[]): NamespaceCapabilities {
  const set = new Set(permissions);

  if (set.has('owner')) {
    return { read: true, create: true, update: true, admin: true };
  }
  if (set.has('editor')) {
    return { read: true, create: true, update: true, admin: false };
  }
  if (set.has('creator')) {
    return { read: true, create: true, update: false, admin: false };
  }
  if (set.has('reader')) {
    return { read: true, create: false, update: false, admin: false };
  }

  return noCapabilities;
}
