import type { ReactNode } from 'react';
import { Hand, Lasso, MousePointer2, Paintbrush, SquareDashed } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { operationModes, type OperationMode } from '@editor/lib/paint-editor/operation-mode';
import { ToolbarIconButton } from './toolbar-icon-button';

const modeIcons: Record<OperationMode, ReactNode> = {
  pan: <Hand />,
  paint: <Paintbrush />,
  rectFill: <SquareDashed />,
  select: <Lasso />,
  paste: <MousePointer2 />,
};

const stubModes = new Set<OperationMode>(['rectFill', 'select', 'paste']);

type OperationModeGroupProps = {
  mode: OperationMode;
  onModeChange: (mode: OperationMode) => void;
};

export function OperationModeGroup({ mode, onModeChange }: OperationModeGroupProps) {
  const { t } = useTranslation();

  const labels: Record<OperationMode, string> = {
    pan: t('移動'),
    paint: t('ペン'),
    rectFill: t('矩形塗り'),
    select: t('選択'),
    paste: t('貼り付け'),
  };

  return (
    <>
      {operationModes.map((item) => (
        <ToolbarIconButton
          key={item}
          icon={modeIcons[item]}
          label={labels[item]}
          pressed={mode === item}
          disabled={stubModes.has(item)}
          onClick={() => onModeChange(item)}
        />
      ))}
    </>
  );
}
