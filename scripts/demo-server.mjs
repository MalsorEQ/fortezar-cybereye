import http from 'node:http';

const host = '127.0.0.1';
const port = Number(process.env.CYBEREYE_DEMO_PORT ?? 8787);

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>CyberEye local demo target</title>
  </head>
  <body>
    <h1>ForteZar CyberEye local demo target</h1>
    <p>This intentionally weak page exists only to demonstrate passive findings on localhost.</p>
    <form action="http://127.0.0.1:${port}/login" method="post">
      <input name="username" autocomplete="off">
      <button type="submit">Demo submit</button>
    </form>
  </body>
</html>`;

const server = http.createServer((request, response) => {
  if (request.url === '/.well-known/security.txt') {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found\n');
    return;
  }

  response.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'access-control-allow-origin': '*',
    'x-powered-by': 'CyberEye Demo',
    'set-cookie': 'demo=session-value; Path=/'
  });
  response.end(html);
});

server.listen(port, host, () => {
  console.log(`CyberEye demo target listening on http://${host}:${port}`);
  console.log('This server intentionally omits security headers and is bound to localhost only.');
  console.log('In another terminal, run:');
  console.log(`node ./bin/cybereye.js http://${host}:${port} --allow-private`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
