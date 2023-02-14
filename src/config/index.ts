import * as fs from 'fs';
import * as dotenv from 'dotenv' 
dotenv.config()
const key = fs.readFileSync(process.env.KEY_PATH || './crt/localhost.key');
const cert = fs.readFileSync(process.env.CERT_PATH ||'./crt/localhost.crt');
const allowHTTP1 = Boolean(process.env.ALLOW_HTTP1);
const port =  process.env.PORT || 8443;
const auth = {
    url: process.env.AUTH_URL || '/',
    method: process.env.AUTH_METHOD ||'GET'
}
export { key, cert, allowHTTP1, port, auth };
