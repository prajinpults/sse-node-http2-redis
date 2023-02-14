import { createClient } from 'redis';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import { RequestHandler } from '../core/index.js';
import fetch from 'node-fetch'
import { auth } from '../config/index.js';

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}
class AuthMiddleware {

  static _instance: AuthMiddleware;
  handler: RequestHandler = new RequestHandler(this.handle);
  static client: any

  constructor() {
    if (AuthMiddleware._instance) {
      return AuthMiddleware._instance
    }
    AuthMiddleware._instance = this;
  }
  static async initRedis() {
    if (AuthMiddleware.client && AuthMiddleware.client.connected) { return }
    AuthMiddleware.client = createClient();
    AuthMiddleware.client.on('error', (err: any) => console.error(err));
    await AuthMiddleware.client.connect();
  }
  static async checkToken(jwtToken: string): Promise<boolean> {
    if (jwtToken == null) {
      return false
    }
    try {
      const res = await fetch(auth.url + jwtToken, { method: auth.method });
      if (res.status != 200) {
        return false
      }
    } catch (e) {
      return false
    }
    return true
  }
  async handle(
    request: Http2ServerRequest,
    response: Http2ServerResponse,
  ): Promise<boolean> {

    let url = new URL(request.url, 'http://example.com')
    const redisToken = url.searchParams.get('token')
    if (redisToken) {
      await AuthMiddleware.initRedis()
      const userId = await AuthMiddleware.client.get(redisToken)
      request.url = `${request.url}&id=${uuidv4()}&userId=${userId}&token=${redisToken}`
      return true
    }
    const authorization = request.headers.authorization || ''
    const jwtToken = authorization.replace('Bearer ', '')
    if (jwtToken == '' || !await AuthMiddleware.checkToken(jwtToken)) {
      const body = { message: 'Token Not found !', status: 401 };
      response.writeHead(401, {
        'Content-Length': Buffer.byteLength(JSON.stringify(body)),
        'Content-Type': 'application/json; charset=utf-8',
      });
      response.write(JSON.stringify(body));
      response.end();
      return false
    }
    const userId = parseJwt(jwtToken).userId

    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    };
    response.writeHead(200, headers);
    const token = uuidv4()
    await AuthMiddleware.initRedis()
    await AuthMiddleware.client.set(token, userId, {
      EX: (24 * 60 * 60),
      GT: true
    });
    response.write(
      JSON.stringify({
        token,
        status: 'Success',
      })
    );
    response.end();
    return false

  }

}

export const authMiddleware = new AuthMiddleware();


