import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { RequestHandler } from '../core/index.js';

const template = `
<!DOCTYPE html> 
<html>
<head>
<style>
body{
    display:flex;
}
#chat{
  width: 33%;
  background: yellow;
  padding: 10px;
}
#date{
    width: 33%;
    text-align:center;
    background: green;
    padding: 10px;
}
#message{
  width: 33%;
  text-align:right;
  background: blue;
  padding: 10px;
}
</style>
</head>
<body>
    <script type="text/javascript">
        const  source = new EventSource('/sse/'+window.location.search);
        source.onmessage = function(e) { 
            document.getElementById("message").innerHTML = e.data + '<br>';
        };
        source.addEventListener("chat", (e) => {
            const obj = JSON.parse(e.data);
            console.log(obj)
            if(obj.action=='clear'){
              document.getElementById("chat").innerHTML ='';
            }
            document.getElementById("chat").innerHTML += e.data + '<br>';
        });
        source.addEventListener("date", (e) => {
            document.getElementById("date").innerHTML = e.data + '<br>';
        });
        source.addEventListener("error", (e) => {
          console.error("An error occurred while attempting to connect.",e);
          document.getElementById("message").innerHTML='error';
        });
    </script>
    <div id="chat"></div>
    <div id="date"></div>
    <div id="message"></div>
</body>
</html>
`;

class HTMLController {
  handler: RequestHandler = new RequestHandler(this.handle);
  
  async handle(
    request: Http2ServerRequest,
    response: Http2ServerResponse
  ): Promise<boolean> {
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end(template);
    return false
  }
}

export const htmlController = new HTMLController();
