import { useEffect } from 'react';
import { HeaderState, useLayoutStore } from '@editor/stores/header';

export function useHeader(header: HeaderState) {
  const setHeader = useLayoutStore((state) => state.setHeader);
  useEffect(() => {
    setHeader(header);
  }, [setHeader]);
}
