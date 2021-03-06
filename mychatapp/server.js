const express = require('express');
const http = require('http');
const PORT = 3000 || process.env.PORT
const path = require('path');
const socketio = require('socket.io');

const formatMessage = require('./utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app)
const io = socketio(server)


// static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chat panduan'
// run when user connection
io.on('connection', socket => {
    socket.on('joinRoom', ({
        username,
        room
    }) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room);

        // welcome current user
        socket.emit('message', formatMessage(botName, 'Selamat Datang di grup ghibah anda disini bisa curhat, rasan-rasan, mengungkapkan keresahan dll.'));

        // broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(user.username, `${user.username} bergabung`));
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    })



    // listen for chat message
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(`${user.username}`, msg));
    })

    // runs when the client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} meninggalkan grup`));
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }




    });
});

server.listen(PORT, () => console.log(`server connection on port ${PORT}`))