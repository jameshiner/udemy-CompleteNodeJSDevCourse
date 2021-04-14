const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');
const { generateLocation } = require('./utils/locations');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
// express creates this behind the scenes on its own but since we need to pass it to socketio
// we need to explicitly create it so we have access to the variable
const server = http.createServer(app);
const io = socketio(server);

const { PORT } = process.env;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  socket.on('join', (options, cb) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return cb(error);
    }

    socket.join(user.room);
    // socket.emit emits to ONLY the current socket
    socket.emit('message', generateMessage('Admin', 'Welcome!'));

    // broadcast emits to ALL sockets EXCEPT the current one
    // adding .to changes the emit to only go to the room passed in
    socket.broadcast.to(user.room).emit('message',
      generateMessage('Admin', `${user.username} has joined ${user.room}!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    return cb();
  });

  socket.on('sendMessage', (message, cb) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return cb('Profanity is not allowed!');
    }

    const user = getUser(socket.id);
    if (!user) {
      return cb('Some how there is no user on this message?');
    }

    // io.emit emits to ALL sockets
    io.to(user.room).emit('message', generateMessage(user.username, message));
    return cb();
  });

  socket.on('sendLocation', (coords, cb) => {
    const { latitude, longitude } = coords;
    const user = getUser(socket.id);

    if (!user) {
      return cb('Some how there is no user on this message?');
    }

    io.to(user.room).emit('locationMessage', generateLocation('Admin', latitude, longitude));
    return cb();
  });

  // built in event
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has disconnected!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});


server.listen(PORT, () => {
  console.log(`Server is up on ${PORT}`);
});
