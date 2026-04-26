function send(type: string, args: any[]) {
  fetch('/__log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      args: args.map((a) => {
        try {
          return typeof a === 'object' ? JSON.stringify(a) : String(a);
        } catch {
          return '[unserializable]';
        }
      }),
    }),
  });
}

const original = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
};

console.log = (...args) => {
  original.log(...args);
  send('log', args);
};

console.warn = (...args) => {
  original.warn(...args);
  send('warn', args);
};

console.error = (...args) => {
  original.error(...args);
  send('error', args);
};

console.info = (...args) => {
  original.info(...args);
  send('info', args);
};
