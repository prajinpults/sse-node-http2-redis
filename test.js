import { createClient } from 'redis';
const client = createClient();
client.on('error', (err) => console.error(err));
console.log('created client')
await client.connect();
console.log('connected')

const messages = [{
    userId: 521,
    type: 'chat',
    content: {
        from: 'name',
        to: 'name 521',
        message: 'message'
    }
},
{
    userId: null,
    type: 'chat',
    content: {
        from: 'name',
        to: 'all',
        message: 'message'
    }
},
{
    userId: 521,
    type: 'date',
    content: {
        date: new Date().getTime(),
        to: 521
    }
},
{
    userId: 521,
    type: null,
    content: {
        message: 'its a generic message',
        to: 521
    }
},
{
    userId: 521,
    type: null,
    content: {
        message: 'its a generic message',
        to: '521'
    }
},
{
    userId: null,
    type: 'chat',
    content: {
        from: 'name',
        to: 'all',
        message: 'message'
    }
},
{
    userId: null,
    type: 'chat',
    content: {
        action:'clear'
    }
},
{
    userId: 120,
    type: 'chat',
    content: {
        from: 'name',
        to: 'name 120',
        message: 'message'
    }
},
{
    userId: 120,
    type: 'date',
    content: {
        date: new Date().getTime(),
        to: 120
    }
},
{
    userId: 120,
    type: null,
    content: {
        message: 'its a generic message',
        to: 120
    }
},
{
    userId: 120,
    type: null,
    content: {
        message: 'its a generic message',
        to: '120'
    }
},
]

let i = 0, n = messages.length

setInterval(async () => {
    const message = messages[(i++ % n + n) % n]
    message.content.id = new Date().getTime()
    await client.publish('notification-service', JSON.stringify(message));
    console.log('sent a message', message)
}, 1000)