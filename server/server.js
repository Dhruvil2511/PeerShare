const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// Create an Express app
const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Create a Socket.IO server
const io = new Server(server);

app.get('/room/:roomId', (req, res) => {
    // Get the room ID from the URL parameter
    const roomId = req.params.roomId;
    // res.render('index', { roomId });
    res.sendFile(path.join(__dirname + '/index.html'));

    // Check if the room exists and has less than two users

    // const room = io.sockets.adapter.rooms.get(roomId);
    // console.log(room);
    // if (room && room.size < 2) {
    //     // Render the chat page with the room ID
        
    // } else {
    //     // Redirect to the home page
    //     // res.redirect('/');
    //     res.send(roomId);
    // }
});

// Handle socket connections
io.on('connection', (socket) => {
    console.log('a user connected');

    // Handle join room event
    socket.on('join room', (roomId) => {
        // Join the room
        socket.join(roomId);
        console.log(`user joined room ${roomId}`);

        // Emit a message to the room
        socket.to(roomId).emit('message', 'A user has joined the chat');
    });

    // Handle leave room event
    socket.on('leave room', (roomId) => {
        // Leave the room
        socket.leave(roomId);
        console.log(`user left room ${roomId}`);

        // Emit a message to the room
        socket.to(roomId).emit('message', 'A user has left the chat');
    });

    // Handle message event
    socket.on('message', (data) => {
        // Get the room ID and the message from the data object
        const { roomId, message } = data;

        // Emit the message to the room
        socket.to(roomId).emit('message', message);
    });

    // Handle disconnect event
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Listen on port 3000
server.listen(6969, () => {
    console.log('listening on *:6969');
})