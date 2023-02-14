import { Http2ServerRequest, Http2ServerResponse } from 'http2';

export class App {
  route: Route;

  constructor(route?: Route) {
    if (route !== undefined) {
      this.route = route;
    } else {
      this.route = new Route();
    }
  }

  setRoute(route: Route): void {
    this.route = route;
  }

  async handleRequest(
    request: Http2ServerRequest,
    response: Http2ServerResponse
  ): Promise<void> {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Content-Length, X-Requested-With'
    );

    if (request.method === 'OPTIONS') {
      response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end();
    }
    if (request.method === 'GET') {
      const routes = this.route.getRoutes();
      let url = new URL(request.url, 'http://example.com')
      const handler = routes.get(url.pathname.replace(/\/$/, ""));
      if (handler) {
        let index =0, continueNext = true
        const length = handler.length
        while(index<length && continueNext){
          continueNext = await handler[index++].handle(request,response)
        }
      } else {
        const body = { message: 'Url not found', status: 404 };
        response.writeHead(404, {
          'Content-Length': Buffer.byteLength(JSON.stringify(body)),
          'Content-Type': 'application/json; charset=utf-8',
        });
        response.write(JSON.stringify(body));
        response.end();
      }
      
      return
    }
    const body = { message: 'Method Not Allowed', status: 405 };
    response.writeHead(405, {
      'Content-Length': Buffer.byteLength(JSON.stringify(body)),
      'Content-Type': 'application/json; charset=utf-8',
    });
    response.write(JSON.stringify(body));
    response.end()
  }
}

export class Route {
  routes: Map<
    string,
    Array<RequestHandler>
  > = new Map();
  get(
    path: string,
    ...handlers: Array<RequestHandler>
  ): Route {
    this.routes.set(path.replace(/\/$/, ""), handlers);
    return this;
  }
  route(path: string, route: Route): void {
    const routes = route.getRoutes();
    routes.forEach(
      (
        onRequestHandler: Array<RequestHandler>,
        innerPath: string
      ) => this.routes.set(path.replace(/\/$/, "") + innerPath, onRequestHandler)
    );
  }
  getRoutes(): Map<
    string,
    Array<RequestHandler>
  > {
    return this.routes;
  }
}

export class RequestHandler {

  handle: (
    request: Http2ServerRequest,
    response: Http2ServerResponse
  ) => Promise<boolean>
  

  constructor(handler: (
    request: Http2ServerRequest,
    response: Http2ServerResponse,
  ) => Promise<boolean>) {
    this.handle = handler;
  }
}
