let WebSocketServer = require('uws').Server
let wss = new WebSocketServer({ port: process.env.HTTP_PORT || 1337 })
let redisClient = require('redis').createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env_REDIS_PORT || 6379
})

let channels = {}
let redisSubscribedChannels = []

let wsOnSubscribe = (channel, socket) => {
    console.log('Client subscribed to', channel)

    if (redisSubscribedChannels.indexOf(channel) < 0) {
        redisClient.subscribe(channel)
    }

    if (!channels.hasOwnProperty(channel)) {
        channels[channel] = [socket]
    } else {
        channels.push(socket)
    }
}
 
let wsOnMessage = (payload, socket) => {
    let message = JSON.parse(payload)
    if (message.type === 'subscribe') {
        wsOnSubscribe(message.exchange_pair, socket)
    } else {
        console.debug('Ignoring payload: ', payload)
    }
}

let redisOnMessage = (channel, message) => {
    console.log(`Received message from redis sub: ${channel}: ${message}`)

    if (channels.hasOwnProperty(channel))
        channels[channel].forEach((ws) => ws.send(message))
}

redisClient.on('message', (channel, message) => redisOnMessage(channel, message))
 
wss.on('connection', (ws) => {
    ws.on('message', (payload) => wsOnMessage(payload, ws))
})
