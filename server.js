const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Redis } = require("@upstash/redis");
const { v4: uuid } = require("uuid");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static("public"));

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL.trim(),
  token: process.env.UPSTASH_REDIS_REST_TOKEN.trim()
});

io.on("connection", socket => {

  socket.on("create-room", async () => {
    const code = uuid().slice(0, 6).toUpperCase();
    await redis.set(`room:${code}`, JSON.stringify({ users: [] }));
    socket.emit("room-created", code);
  });

  socket.on("join-room", async ({ code, user }) => {
    const raw = await redis.get(`room:${code}`);
    if (!raw) return socket.emit("wrong-code");

    const room = JSON.parse(raw);
    if (room.users.length >= 2) return socket.emit("wrong-code");

    room.users.push(user);
    await redis.set(`room:${code}`, JSON.stringify(room));

    socket.join(code);
    socket.room = code;
    socket.user = user;

    socket.emit("joined");
    socket.to(code).emit("system", `${user} joined`);
  });

  socket.on("typing", () => {
    socket.to(socket.room).emit("typing", socket.user);
  });

  socket.on("stop-typing", () => {
    socket.to(socket.room).emit("stop-typing");
  });

  socket.on("message", text => {
    io.to(socket.room).emit("message", {
      user: socket.user,
      text
    });
  });

  socket.on("image", img => {
    io.to(socket.room).emit("image", {
      user: socket.user,
      data: img
    });
  });

  socket.on("voice", audio => {
    io.to(socket.room).emit("voice", {
      user: socket.user,
      audio
    });
  });

  socket.on("clear-chat", () => {
    io.to(socket.room).emit("clear");
  });

});

server.listen(process.env.PORT || 10000, () =>
  console.log("Lovey Chat backend running")
);
