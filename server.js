const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuid } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

const rooms = {}; // code -> { users: [], images: {} }

io.on("connection", socket => {

  socket.on("create-room", () => {
    const code = uuid().slice(0, 6).toUpperCase();
    rooms[code] = { users: [], images: {} };
    socket.emit("room-created", code);
  });

  socket.on("join-room", ({ code, user }) => {
    if (!rooms[code] || rooms[code].users.length >= 2) {
      socket.emit("wrong-code");
      return;
    }

    rooms[code].users.push(user);
    socket.join(code);
    socket.room = code;
    socket.user = user;

    io.to(code).emit("system", `${user} joined`);
  });

  socket.on("message", text => {
    if (!socket.room) return;
    io.to(socket.room).emit("message", {
      user: socket.user,
      text
    });
  });

  socket.on("image", data => {
    const id = uuid();
    rooms[socket.room].images[id] = 2;
    io.to(socket.room).emit("image", { id, data });
  });

  socket.on("view-image", id => {
    const r = rooms[socket.room];
    if (r?.images[id]) {
      r.images[id]--;
      if (r.images[id] <= 0) {
        delete r.images[id];
        io.to(socket.room).emit("remove-image", id);
      }
    }
  });

  socket.on("voice", audio => {
    io.to(socket.room).emit("voice", audio);
  });

  socket.on("clear-chat", () => {
    io.to(socket.room).emit("clear");
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () =>
  console.log("Backend running on port", PORT)
);
