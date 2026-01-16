const socket = io("https://lovey-chat.onrender.com", {
  transports: ["polling"]
});

let roomCode = "";

function openAstrae() {
  home.classList.add("hidden");
  astrae.classList.remove("hidden");
  socket.emit("create-room");
}

function openCryon() {
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
  socket.emit("join-room", { code: joinCode.value, user: "Cryon" });
}

socket.on("joined", () => {
  astrae.classList.add("hidden");
  cryon.classList.add("hidden");
  chat.classList.remove("hidden");
});

socket.on("wrong-code", () => {
  error.innerText = "Invalid Code";
});

socket.on("message", m => add(m.user + ": " + m.text));
socket.on("system", t => add(t, "sys"));

function send() {
  socket.emit("message", msg.value);
  msg.value = "";
}

function add(t, c="") {
  const d = document.createElement("div");
  d.className = c;
  d.innerText = t;
  messages.appendChild(d);
}
