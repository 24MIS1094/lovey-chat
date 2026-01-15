const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuid } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const rooms = {}; 

io.on("connection", (socket) => {
  // Astrae creates the room
  socket.on("create-room", () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms[code] = { users: [], images: {} };
    socket.emit("room-created", code);
  });

  // Joining logic
  socket.on("join-room", ({ code, user }) => {
    if (!rooms[code] || rooms[code].users.length >= 2) {
      socket.emit("wrong-code");
      return;
    }
    socket.join(code);
    socket.room = code;
    socket.user = user;
    rooms[code].users.push(user);
    io.to(code).emit("system", `${user} joined`);
  });

  socket.on("message", (text) => {
    io.to(socket.room).emit("message", { user: socket.user, text });
  });

  // View 2 times logic
  socket.on("image", (data) => {
    const id = uuid();
    rooms[socket.room].images[id] = 2; 
    io.to(socket.room).emit("image", { id, data });
  });

  socket.on("view-image", (id) => {
    if (rooms[socket.room] && rooms[socket.room].images[id]) {
      rooms[socket.room].images[id]--;
      if (rooms[socket.room].images[id] <= 0) {
        delete rooms[socket.room].images[id];
        io.to(socket.room).emit("remove-image", id);
      }
    }
  });

  socket.on("voice", (audio) => {
    io.to(socket.room).emit("voice", { user: socket.user, audio });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));