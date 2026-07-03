import { useMemo } from 'react';
import { createResourceInputSchema } from '@schema/database/resource';
import type { ResourceRecord } from '@sharedTypes/database/collection';

export function validateSkinDraft(
  resource: ResourceRecord<'skin'>,
  draft: ResourceRecord<'skin'>['data'],
  isDraft: boolean
) {
  return createResourceInputSchema('skin').safeParse({
    namespace: resource.namespace,
    type: 'skin',
    name: resource.name,
    version: resource.version,
    description: resource.description,
    isDraft,
    data: draft,
  });
}

export function validateTextureDraft(
  resource: ResourceRecord<'texture'>,
  draft: ResourceRecord<'texture'>['data'],
  isDraft: boolean
) {
  return createResourceInputSchema('texture').safeParse({
    namespace: resource.namespace,
    type: 'texture',
    name: resource.name,
    version: resource.version,
    description: resource.description,
    isDraft,
    data: draft,
  });
}

export function useSkinValidation(
  resource: ResourceRecord<'skin'> | undefined,
  draft: ResourceRecord<'skin'>['data'] | null,
  isDraft: boolean
) {
  return useMemo(() => {
    if (resource == null || draft == null) return null;
    return validateSkinDraft(resource, draft, isDraft);
  }, [draft, isDraft, resource]);
}

export function useTextureValidation(
  resource: ResourceRecord<'texture'> | undefined,
  draft: ResourceRecord<'texture'>['data'] | null,
  isDraft: boolean
) {
  return useMemo(() => {
    if (resource == null || draft == null) return null;
    return validateTextureDraft(resource, draft, isDraft);
  }, [draft, isDraft, resource]);
}
