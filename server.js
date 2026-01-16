const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Redis } = require("@upstash/redis");
const { v4: uuid } = require("uuid");

const app = express();
const server = http.createServer(app);

/* SOCKET.IO WITH CORS */
const io = new Server(server, {
  cors: {
    origin: "https://lovey-chat.vercel.app",
    methods: ["GET", "POST"]
  }
});

/* REDIS */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL.trim(),
  token: process.env.UPSTASH_REDIS_REST_TOKEN.trim()
});

io.on("connection", (socket) => {

  socket.on("create-room", async () => {
    const code = uuid().slice(0, 6).toUpperCase();
    await redis.set(`room:${code}`, JSON.stringify({ users: [] }));
    socket.emit("room-created", code);
  });

  socket.on("join-room", async ({ code, user }) => {
    const data = await redis.get(`room:${code}`);
    if (!data) {
      socket.emit("wrong-code");
      return;
    }

    const room = JSON.parse(data);
    if (room.users.length >= 2) {
      socket.emit("wrong-code");
      return;
    }

    room.users.push(user);
    await redis.set(`room:${code}`, JSON.stringify(room));

    socket.join(code);
    socket.room = code;
    socket.user = user;

    io.to(code).emit("system", `${user} joined`);
  });

  socket.on("message", (msg) => {
    if (!socket.room) return;
    io.to(socket.room).emit("message", {
      user: socket.user,
      text: msg
    });
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Lovey Chat backend running");
});
