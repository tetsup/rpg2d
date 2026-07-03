import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { ResourceRecord } from '@sharedTypes/database/collection';
import {
  buildInitialStateFromResource,
  createGraphicsEditorSession,
  type GraphicsEditorSessionState,
  type GraphicsEditorStore,
} from '@editor/stores/graphics-editor-session';

const GraphicsEditorSessionContext = createContext<GraphicsEditorStore | null>(null);

export function GraphicsEditorSessionProvider({
  resource,
  children,
}: {
  resource: ResourceRecord<'skin' | 'texture' | 'image'>;
  children: ReactNode;
}) {
  const store = useMemo(() => createGraphicsEditorSession(resource), [resource.id]);

  useEffect(() => {
    store.setState(buildInitialStateFromResource(resource));
  }, [resource, store]);

  return (
    <GraphicsEditorSessionContext.Provider value={store}>{children}</GraphicsEditorSessionContext.Provider>
  );
}

export function useGraphicsEditorSession<T>(selector: (state: GraphicsEditorSessionState) => T): T {
  const store = useContext(GraphicsEditorSessionContext);
  if (store == null) {
    throw new Error('useGraphicsEditorSession must be used within GraphicsEditorSessionProvider');
  }
  return useStore(store, selector);
}

export function useGraphicsEditorStore() {
  const store = useContext(GraphicsEditorSessionContext);
  if (store == null) {
    throw new Error('useGraphicsEditorStore must be used within GraphicsEditorSessionProvider');
  }
  return store;
}

export {
  selectAnyDirty,
  selectSkinDirty,
  selectTextureDirty,
} from '@editor/stores/graphics-editor-session';
