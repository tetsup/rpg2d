declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      API_BASE_URL?: string;
    };
  }
}

export function getApiBaseUrl() {
  const params = new URLSearchParams(location.search);

  return params.get('api') ?? window.__RUNTIME_CONFIG__?.API_BASE_URL ?? location.origin;
}
