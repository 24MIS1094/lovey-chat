/* ===== GLOBAL STATE (MUST BE FIRST) ===== */
let socket = null;
let roomCode = "";
let role = "";

/* ===== SOCKET INIT ===== */
socket = io("https://lovey-chat.onrender.com", {
  transports: ["polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 20000
});

/* ===== SOCKET EVENTS ===== */
socket.on("connected", () => {
  console.log("SOCKET CONNECTED");
});

socket.on("room-created", (code) => {
  roomCode = code;
  document.getElementById("codeBox").innerText = code;
});

socket.on("joined", () => {
  document.getElementById("astrae").classList.add("hidden");
  document.getElementById("cryon").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");
});

socket.on("wrong-code", () => {
  document.getElementById("error").innerText = "Invalid code";
});

socket.on("system", (msg) => addMessage(msg, "sys"));
socket.on("message", (msg) =>
  addMessage(`${msg.user}: ${msg.text}`)
);

/* ===== UI ACTIONS ===== */
function openAstrae() {
  role = "Astrae";
  document.getElementById("home").classList.add("hidden");
  document.getElementById("astrae").classList.remove("hidden");
  socket.emit("create-room");
}

function openCryon() {
  role = "Cryon";
  document.getElementById("home").classList.add("hidden");
  document.getElementById("cryon").classList.remove("hidden");
}

function enterAsAstrae() {
  socket.emit("join-room", { code: roomCode, user: "Astrae" });
}

function enterAsCryon() {
  const code = document.getElementById("joinCode").value.trim();
  socket.emit("join-room", { code, user: "Cryon" });
}

function send() {
  const input = document.getElementById("msg");
  if (!input.value.trim()) return;
  socket.emit("message", input.value);
  input.value = "";
}

/* ===== HELPERS ===== */
function addMessage(text, cls = "") {
  const d = document.createElement("div");
  d.className = cls;
  d.innerText = text;
  document.getElementById("messages").appendChild(d);
}
