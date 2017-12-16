let WebSocketServer = require('uws').Server
let wss = new WebSocketServer({ port: 1337 })
let redisClient = require('redis').createClient({
    host: process.env.REDIS_HOST,
    port: process.env_REDIS_PORT
})

let channels = {}
let redisSubscribedChannels = []

let wsOnSubscribe = (channel, socket) => {
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
 
wss.on('connection', (ws) => {
    ws.on('message', (payload) => wsOnMessage(payload, ws))
})

let redisOnMessage = (channel, message) => {
    if (channels.hasOwnProperty(channel))
        channels[channel].forEach((ws) => ws.send(message))
}
