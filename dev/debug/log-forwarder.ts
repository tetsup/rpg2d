const methods = ['log', 'warn', 'error', 'info'] as const;

for (const type of methods) {
  const original = console[type].bind(console);

  console[type] = (...args: unknown[]) => {
    original(...args);

    fetch('/__log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        args: args.map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg))),
      }),
    }).catch(() => {
      // Ignore forwarding failures so local debugging never changes app behavior.
    });
  };
}
