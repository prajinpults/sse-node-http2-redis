import { createClient } from 'redis';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { RequestHandler } from '../core/index.js';



class SSEController {
  static _instance: SSEController;
  static clients: Array<Client> = [];

  constructor() {
    if (SSEController._instance) {
      return SSEController._instance
    }
    SSEController._instance = this;
    this.initRedis()
  }
  async initRedis() {
    const subscriber = createClient();
    subscriber.on('error', (err: any) => console.error(err));
    await subscriber.connect();
    const listener = (message: string,) => {
      const data = JSON.parse(message)
      const clients = data.userId ? SSEController.clients.filter(c => c.userId == data.userId) : SSEController.clients
      console.log(data.userId, clients)
      clients.forEach(cclient => {
        if (cclient.response) {
          cclient.response.write(`id: ${new Date().getTime()}\n`)
          if (data.type) {
            cclient.response.write(`event: ${data.type}\n`);
          }
          cclient.response.write(`data: ${JSON.stringify(data.content)}\n\n`);
        }
      })
    };
    await subscriber.subscribe('notification-service', listener);
  }
  handler: RequestHandler = new RequestHandler(this.handle);
  subscriber: any;
  async handle(
    request: Http2ServerRequest,
    response: Http2ServerResponse,
  ): Promise<boolean> {
    let url = new URL(request.url, 'http://example.com')
    let token: string = url.searchParams.get('token') || ''
    let id: string = url.searchParams.get('id') || ''
    let userId: string = url.searchParams.get('userId') || ''

    const index = SSEController.clients.findIndex(c => c.token === token && !c.response)
    if (index > -1) {
      console.log('updated existinsg')
      SSEController.clients[index].response = response
      SSEController.clients[index].id = id
    } else {
      SSEController.clients.push(new Client(id, token, userId, response))
    }
    console.log(SSEController.clients)
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    response.writeHead(200, headers);
    request.on('close', () => {
      console.log(`${token} Connection closed`);
      SSEController.clients = SSEController.clients.filter((client: Client) => client.id !== id);
    });
    return false
  }
}

class Client {
  response!: Http2ServerResponse;
  userId: string
  token: string
  id: string
  constructor(id: string, token: string, userId: string, response?: Http2ServerResponse) {
    this.id = id
    this.token = token
    this.userId = userId
    if (response) {
      this.response = response
    }
  }
}
export const sseController = new SSEController();
