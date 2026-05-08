const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } }); // Для стабильности на Render

app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    console.log('Попытка подключения:', socket.id);

    // Логика входа с ником
    socket.on('join-simulation', (data) => {
        console.log('Игрок вошел в симуляцию:', data.nick);
        players[socket.id] = { 
            x: 0, y: 1.6, z: 20, 
            nick: data.nick,
            color: '#' + Math.floor(Math.random()*16777215).toString(16) 
        };
        socket.emit('currentPlayers', players);
        socket.broadcast.emit('newPlayer', { id: socket.id, info: players[socket.id] });
    });

    // Движение
    socket.on('playerMovement', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].z = data.z;
            socket.broadcast.emit('playerMoved', { id: socket.id, info: players[socket.id] });
        }
    });

    // ЧАТ
    socket.on('chatMessage', (msg) => {
        if(players[socket.id]) {
            console.log(`[CHAT] ${players[socket.id].nick}: ${msg}`);
            io.emit('chatMessage', { id: socket.id, msg: msg });
        }
    });

    socket.on('disconnect', () => {
        console.log('Игрок ушел:', socket.id);
        if(players[socket.id]) {
            delete players[socket.id];
            io.emit('playerDisconnected', socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`SYSTEM: ONLINE | PORT: ${PORT}`));