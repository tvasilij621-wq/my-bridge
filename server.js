const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    // Создаем игрока со случайным цветом
    players[socket.id] = { 
        x: 0, y: 1.6, z: 5, 
        color: '#' + Math.floor(Math.random()*16777215).toString(16) 
    };

    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', { id: socket.id, info: players[socket.id] });

    socket.on('playerMovement', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].z = data.z;
            socket.broadcast.emit('playerMoved', { id: socket.id, info: players[socket.id] });
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Сервер готов! Адрес: http://localhost:${PORT}`));