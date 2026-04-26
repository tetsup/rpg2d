window.addEventListener('error', (event) => {
  fetch('/__error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: event.message,
      stack: event.error?.stack,
    }),
  }).catch(() => {
    // Ignore forwarding failures so local debugging never changes app behavior.
  });
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;

  fetch('/__error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    }),
  }).catch(() => {
    // Ignore forwarding failures so local debugging never changes app behavior.
  });
});
