socket.on("connected", () => {
  console.log("SOCKET CONNECTED");
});
socket.on("joined", () => {
  console.log("JOINED EVENT RECEIVED");
});

const socket = io("https://lovey-chat.onrender.com", {
  transports: ["polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 20000
});


let roomCode = "";
let role = "";

function openAstrae() {
  role = "Astrae";
  home.classList.add("hidden");
  astrae.classList.remove("hidden");
  socket.emit("create-room");
}

function openCryon() {
  role = "Cryon";
  home.classList.add("hidden");
  cryon.classList.remove("hidden");
}

socket.on("room-created", code => {
  roomCode = code;
  codeBox.innerText = code;
});

function enterAsAstrae() {
  socket.emit("join-room", { code: roomCode, user: "Astrae" });
}

function enterAsCryon() {
  socket.emit("join-room", { code: joinCode.value.trim(), user: "Cryon" });
}

socket.on("joined", () => {
  astrae.classList.add("hidden");
  cryon.classList.add("hidden");
  chat.classList.remove("hidden");
});

socket.on("wrong-code", () => {
  error.innerText = "Invalid or expired code";
});

socket.on("system", t => addMsg(t, "sys"));
socket.on("message", m => addMsg(`${m.user}: ${m.text}`));

function send() {
  if (!msg.value.trim()) return;
  socket.emit("message", msg.value);
  msg.value = "";
}

function addMsg(t, c="") {
  const d = document.createElement("div");
  d.className = c;
  d.innerText = t;
  messages.appendChild(d);
}
