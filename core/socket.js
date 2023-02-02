import socketio from 'socket.io-client'

const socket = socketio(process.env.API_URL || 'http://localhost:5000', {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    },
    transports: ['websocket'],
})

export { socket }
