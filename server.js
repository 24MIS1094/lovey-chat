const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Redis } = require("@upstash/redis");
const { v4: uuid } = require("uuid");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://lovey-chat.vercel.app",
    methods: ["GET", "POST"]
  },
  transports: ["polling"]   // 🔥 IMPORTANT: NO websocket
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL.trim(),
  token: process.env.UPSTASH_REDIS_REST_TOKEN.trim()
});

io.on("connection", (socket) => {
  console.log("connected");

  socket.on("create-room", async () => {
    const code = uuid().slice(0, 6).toUpperCase();
    await redis.set(`room:${code}`, { users: [] });
    socket.emit("room-created", code);
  });

  socket.on("join-room", async ({ code, user }) => {
    const room = await redis.get(`room:${code}`);

    if (!room || room.users.length >= 2) {
      socket.emit("wrong-code");
      return;
    }

    room.users.push(user);
    await redis.set(`room:${code}`, room);

    socket.join(code);
    socket.room = code;
    socket.user = user;

    io.to(code).emit("system", `${user} joined`);
  });

  socket.on("message", (text) => {
    if (!socket.room) return;
    io.to(socket.room).emit("message", {
      user: socket.user,
      text
    });
  });
});

server.listen(process.env.PORT || 10000, () =>
  console.log("Lovey Chat backend running")
);
