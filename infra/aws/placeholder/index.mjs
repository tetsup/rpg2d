export const handler = async () => ({
  statusCode: 503,
  headers: {
    'content-type': 'text/plain; charset=utf-8',
  },
  body: 'RPG2d API deploy pending',
});
