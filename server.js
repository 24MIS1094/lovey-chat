const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuid } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {

  socket.on("create-room", () => {
    const code = uuid().slice(0, 6).toUpperCase();
    rooms[code] = { users: [] };
    socket.emit("room-created", code);
  });

  socket.on("join-room", ({ code, name }) => {
    if (!rooms[code]) {
      socket.emit("wrong-code");
      return;
    }

    if (rooms[code].users.length >= 2) return;

    rooms[code].users.push(name);
    socket.join(code);

    socket.roomCode = code;
    socket.username = name;

    io.to(code).emit("system", `${name} joined the chat`);
  });

  socket.on("message", (msg) => {
    io.to(socket.roomCode).emit("message", {
      user: socket.username,
      text: msg
    });
  });
});

server.listen(3000, () => {
  console.log("Lovey Chat running on http://localhost:3000");
});
