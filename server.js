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
  transports: ["polling"]
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL.trim(),
  token: process.env.UPSTASH_REDIS_REST_TOKEN.trim()
});

io.on("connection", (socket) => {

  socket.on("create-room", async () => {
    const code = uuid().slice(0,6).toUpperCase();
    await redis.set(`room:${code}`, {
      users: [],
      images: {},
      messages: []
    });
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

  socket.on("message", async (text) => {
    if (!socket.room) return;
    io.to(socket.room).emit("message", {
      user: socket.user,
      text
    });
  });

  socket.on("image", async ({ id, data }) => {
    const room = await redis.get(`room:${socket.room}`);
    room.images[id] = 2;
    await redis.set(`room:${socket.room}`, room);
    io.to(socket.room).emit("image", { id, data });
  });

  socket.on("view-image", async (id) => {
    const room = await redis.get(`room:${socket.room}`);
    if (!room.images[id]) return;
    room.images[id]--;
    if (room.images[id] <= 0) {
      delete room.images[id];
      io.to(socket.room).emit("remove-image", id);
    }
    await redis.set(`room:${socket.room}`, room);
  });

  socket.on("voice", (audio) => {
    io.to(socket.room).emit("voice", audio);
  });

  socket.on("clear-chat", () => {
    io.to(socket.room).emit("clear");
  });
});

server.listen(process.env.PORT || 10000, () =>
  console.log("Lovey Chat backend running")
);
