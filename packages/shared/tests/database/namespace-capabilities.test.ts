import { resolveNamespaceCapabilities } from '@schema/database/namespace-capabilities';

describe('resolveNamespaceCapabilities', () => {
  it('grants full access to owner', () => {
    expect(resolveNamespaceCapabilities(['owner'])).toEqual({
      read: true,
      create: true,
      update: true,
      admin: true,
    });
  });

  it('grants update-any to editor', () => {
    expect(resolveNamespaceCapabilities(['editor'])).toEqual({
      read: true,
      create: true,
      update: true,
      admin: false,
    });
  });

  it('grants create and own-resource updates to creator', () => {
    expect(resolveNamespaceCapabilities(['creator'])).toEqual({
      read: true,
      create: true,
      update: false,
      admin: false,
    });
  });

  it('grants read-only to reader', () => {
    expect(resolveNamespaceCapabilities(['reader'])).toEqual({
      read: true,
      create: false,
      update: false,
      admin: false,
    });
  });

  it('returns no access for unknown permissions', () => {
    expect(resolveNamespaceCapabilities([])).toEqual({
      read: false,
      create: false,
      update: false,
      admin: false,
    });
  });
});
