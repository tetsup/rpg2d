import { useEffect, useState } from 'react';
import { useRuntimeUiStateStore } from '../stores/ui-state';

export type RuntimeLayout = 'portrait' | 'landscape';

function detectLayout(): RuntimeLayout {
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

export function useRuntimeLayout() {
  const layoutMode = useRuntimeUiStateStore((s) => s.layoutMode);
  const [autoLayout, setAutoLayout] = useState<RuntimeLayout>(detectLayout());
  useEffect(() => {
    const onResize = () => {
      setAutoLayout(detectLayout());
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);
  const layout = layoutMode === 'auto' ? autoLayout : layoutMode;

  return {
    layout,
    layoutMode,
  };
}
