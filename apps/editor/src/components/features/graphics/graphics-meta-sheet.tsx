import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createResourceInputSchema } from '@schema/database/resource';
import type { ResourceRecord } from '@sharedTypes/database/collection';
import { Button } from '@editor/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@editor/components/ui/dialog';
import { Input } from '@editor/components/ui/input';
import { StyledSwitch } from '@editor/components/parts/styled-switch';
import type { MetaPanel } from '@editor/stores/graphics-editor-session';

type GraphicsMetaSheetProps = {
  panel: MetaPanel;
  skinResource?: ResourceRecord<'skin'>;
  textureResource?: ResourceRecord<'texture'>;
  imageResource?: ResourceRecord<'image'>;
  skinDraft?: ResourceRecord<'skin'>['data'];
  skinIsDraft?: boolean;
  textureDraft?: ResourceRecord<'texture'>['data'];
  textureIsDraft?: boolean;
  imageDraft?: ResourceRecord<'image'>['data'];
  imageIsDraft?: boolean;
  onSkinChange?: (data: ResourceRecord<'skin'>['data'], isDraft: boolean) => void;
  onTextureChange?: (data: ResourceRecord<'texture'>['data'], isDraft: boolean) => void;
  onImageChange?: (isDraft: boolean, description?: string) => void;
  onClose: () => void;
};

export function GraphicsMetaSheet({
  panel,
  skinResource,
  textureResource,
  imageResource,
  skinDraft,
  skinIsDraft,
  textureDraft,
  textureIsDraft,
  imageDraft,
  imageIsDraft,
  onSkinChange,
  onTextureChange,
  onImageChange,
  onClose,
}: GraphicsMetaSheetProps) {
  const { t } = useTranslation();
  const open = panel != null;

  const title =
    panel === 'skin' ? t('スキン情報') : panel === 'texture' ? t('テクスチャ情報') : t('画像情報');

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t('参照やメタ情報を編集します')}</DialogDescription>
        </DialogHeader>

        {panel === 'skin' && skinResource != null && skinDraft != null && (
          <SkinMetaFields
            resource={skinResource}
            draft={skinDraft}
            isDraft={skinIsDraft ?? true}
            onChange={onSkinChange!}
          />
        )}

        {panel === 'texture' && textureResource != null && textureDraft != null && (
          <TextureMetaFields
            resource={textureResource}
            draft={textureDraft}
            isDraft={textureIsDraft ?? true}
            onChange={onTextureChange!}
          />
        )}

        {panel === 'image' && imageResource != null && (
          <ImageMetaFields
            resource={imageResource}
            isDraft={imageIsDraft ?? true}
            onChange={onImageChange!}
          />
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('閉じる')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SkinMetaFields({
  resource,
  draft,
  isDraft,
  onChange,
}: {
  resource: ResourceRecord<'skin'>;
  draft: ResourceRecord<'skin'>['data'];
  isDraft: boolean;
  onChange: (data: ResourceRecord<'skin'>['data'], isDraft: boolean) => void;
}) {
  const { t } = useTranslation();
  const directions = ['down', 'up', 'left', 'right'] as const;

  return (
    <div className="space-y-4 text-sm">
      <DraftToggle isDraft={isDraft} onChange={(next) => onChange(draft, next)} />
      <div className="space-y-2">
        <p className="text-muted-foreground">{t('方向テクスチャ参照')}</p>
        <ul className="space-y-1 rounded-md border border-border p-2 font-mono text-xs">
          {directions.map((direction) => (
            <li key={direction}>
              {direction}: {draft.textures[direction] ?? t('未設定')}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">{resource.name}</p>
    </div>
  );
}

function TextureMetaFields({
  resource,
  draft,
  isDraft,
  onChange,
}: {
  resource: ResourceRecord<'texture'>;
  draft: ResourceRecord<'texture'>['data'];
  isDraft: boolean;
  onChange: (data: ResourceRecord<'texture'>['data'], isDraft: boolean) => void;
}) {
  const { t } = useTranslation();
  const layer = draft.layers[0];

  return (
    <div className="space-y-4 text-sm">
      <DraftToggle isDraft={isDraft} onChange={(next) => onChange(draft, next)} />
      <div className="space-y-2">
        <p className="text-muted-foreground">{t('レイヤー参照')}</p>
        <p className="rounded-md border border-border p-2 font-mono text-xs">
          priority {layer?.priority ?? '-'} / {layer?.images.length ?? 0} frames
        </p>
      </div>
      <p className="text-xs text-muted-foreground">{resource.name}</p>
    </div>
  );
}

function ImageMetaFields({
  resource,
  isDraft,
  onChange,
}: {
  resource: ResourceRecord<'image'>;
  isDraft: boolean;
  onChange: (isDraft: boolean, description?: string) => void;
}) {
  const { t } = useTranslation();
  const [description, setDescription] = useState(resource.description ?? '');

  useEffect(() => {
    setDescription(resource.description ?? '');
  }, [resource.description, resource.id]);

  return (
    <div className="space-y-4 text-sm">
      <DraftToggle isDraft={isDraft} onChange={(next) => onChange(next, description)} />
      <label className="block space-y-1">
        <span className="text-muted-foreground">{t('説明')}</span>
        <Input
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            onChange(isDraft, event.target.value);
          }}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        {resource.name} ({resource.data.size.width}x{resource.data.size.height})
      </p>
    </div>
  );
}

function DraftToggle({ isDraft, onChange }: { isDraft: boolean; onChange: (next: boolean) => void }) {
  const { t } = useTranslation();
  return (
    <label className="block space-y-1">
      <span className="text-muted-foreground">{t('保存形式')}</span>
      <StyledSwitch
        variant="segmented"
        labelOn={t('下書き')}
        labelOff={t('正式')}
        checked={isDraft}
        onCheckedChange={onChange}
      />
    </label>
  );
}

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
