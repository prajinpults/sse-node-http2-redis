import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { RequestHandler } from '../core/index.js';

class HealthController {
  handler: RequestHandler = new RequestHandler(this.handle);
  
  async handle(
    request: Http2ServerRequest,
    response: Http2ServerResponse
  ): Promise<boolean> {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.write(
      JSON.stringify({
        httpVersion: request.httpVersion,
        status: 'UP',
      })
    );
    response.end();
    return false
  }
}

export const healthController = new HealthController();
