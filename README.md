# A simple HTTP2 SSE notification service using Redis

### create self signed ssl


for creating a ssl certificate use bash or gitbash


#### create a crt directory

create a directory for certficate and key
```
mkdir crt
cd crt
```

#### creat a root CA certificate using openssl


generate a key for root CA certificate

```
openssl genrsa -out ca.key 4096
```

genretae root certificate for 10 years change subject value accordingly

```
openssl req -x509 -new -nodes -sha512 -days 3650 \
 -subj "/C=IN/ST=Kerala/L=Kerala/O=Alleppy Cherthala/OU=prajin-prakash/emailAddress=prajin@lh.in/CN=*.lh.in" \
 -key ca.key \
 -out ca.crt
```

after genrating the root ca you can install this in your clients to make all ssl as valid
create a key for SSL certificate

```
openssl genrsa -out localhost.key 4096
```

create a certificate signin request

```
 openssl req -new  -subj "/C=IN/ST=Kerala/L=Kerala/O=Alleppy Cherthala/OU=prajin-prakash/emailAddress=prajin@lh.in/CN=*.lh.in" \
  -key localhost.key -out localhost.csr
```


create a file 

`localhost.ext` and past the content you can change the dns accoringly 

```
authorityKeyIdentifier = keyid,issuer
basicConstraints = CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = *.lb.in
DNS.2 = localhost
IP.1 = 127.0.0.1

```
create the SSL 
```
openssl x509 -req -in localhost.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 3650 -sha512 -extfile localhost.ext -out localhost.crt
```

### Start


setup enviornment by copying .env copy to .env and change the values accordingly

start redis server


```
docker run -p 6379:6379 redis:7

```


to start development server run

```
yarn d
```
you nee to get a token by passing a jwt token using API
(SSE not support header) this validate aginst an auth server, You can skip by setting some url returning 200 OK.

```
curl --location 'https://localhost:8443/sse/' \
--header 'Authorization: Bearer <token>'

```


you can see simple html page for implementing the SSE, Which take the temporary non JWT as query parameter
which validate against inmemory token

```
https://localhost:8443/?token=4c83e859-ee6e-4653-a0f3-13899f6e29a1
```



for testing with some redis message do 

```
yarn t
```