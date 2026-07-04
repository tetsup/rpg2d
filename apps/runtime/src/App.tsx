import { useMemo } from 'react';
import { parseRuntimeSearchParams } from './bootstrap';
import { RuntimeHost } from './runtime-host';

export default function App() {
  const runtimeConfig = useMemo(() => parseRuntimeSearchParams(new URLSearchParams(window.location.search)), []);

  return <RuntimeHost config={runtimeConfig} />;
}
