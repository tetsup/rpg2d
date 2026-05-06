function appendError(payload: any) {
  const el = document.getElementById('console');
  if (!el) return;

  const line = document.createElement('div');
  ((line.textContent = JSON.stringify(payload)), el.appendChild(line));
}
function sendError(payload: any) {
  try {
    fetch('/__error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {}
}
window.addEventListener('error', (e) => {
  appendError({
    type: 'error',
    message: e.message,
    stack: e.error?.stack,
  });
  sendError({
    type: 'error',
    message: e.message,
    stack: e.error?.stack,
  });
});

window.addEventListener('unhandledrejection', (e) => {
  appendError({
    type: 'promise',
    message: String(e.reason),
    stack: e.reason?.stack,
  });
  sendError({
    type: 'promise',
    message: String(e.reason),
    stack: e.reason?.stack,
  });
});
