import * as http2 from 'http2';
import { App } from '../core/index.js';
import { router } from '../router/index.js';
import { allowHTTP1, key, cert, port } from '../config/index.js';
import { Http2ServerRequest } from 'http2';

export function start() {
  const app = new App(router);

  const server = http2.createSecureServer(
    {
      allowHTTP1,
      key,
      cert,
    },
    (
      request: Http2ServerRequest,
      response: http2.Http2ServerResponse
    ) => app.handleRequest(request, response)
  );

  server.on('error', (err: Error) => console.error(err));

  server.listen(port);

  console.log(`Listening on http://localhost:${port}`);
}
