function append(type: string, args: any[]) {
  const el = document.getElementById('console');
  if (!el) return;

  const line = document.createElement('div');
  ((line.textContent = JSON.stringify({
    type,
    args: args.map((a) => {
      try {
        return a instanceof Map
          ? `[Map] ${JSON.stringify([...a])}`
          : typeof a === 'object'
            ? JSON.stringify(a)
            : String(a);
      } catch {
        return '[unserializable]';
      }
    }),
  })),
    el.appendChild(line));
}

function send(type: string, args: any[]) {
  try {
    fetch('/__log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        args: args.map((a) => {
          try {
            return a instanceof Map
              ? `[Map] ${JSON.stringify([...a])}`
              : typeof a === 'object'
                ? JSON.stringify(a)
                : String(a);
          } catch {
            return '[unserializable]';
          }
        }),
      }),
    });
  } catch {}
}

const original = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
};

console.log = (...args) => {
  original.log(...args);
  append('log', args);
  send('log', args);
};

console.warn = (...args) => {
  original.warn(...args);
  append('warn', args);
  send('warn', args);
};

console.error = (...args) => {
  original.error(...args);
  append('error', args);
  send('error', args);
};

console.info = (...args) => {
  original.info(...args);
  append('info', args);
  send('info', args);
};
