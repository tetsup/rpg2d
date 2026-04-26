function sendError(payload: any) {
  fetch('/__error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

window.addEventListener('error', (e) => {
  sendError({
    type: 'error',
    message: e.message,
    stack: e.error?.stack,
  });
});

window.addEventListener('unhandledrejection', (e) => {
  sendError({
    type: 'promise',
    message: String(e.reason),
    stack: e.reason?.stack,
  });
});
