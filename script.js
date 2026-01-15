const socket = io("https://lovey-chat.onrender.com");

let role = "";
let roomCode = "";

const select = document.getElementById("screen-select");
const astrae = document.getElementById("screen-astrae");
const cryon = document.getElementById("screen-cryon");
const chat = document.getElementById("chat");

function hideAll() {
  select.classList.add("hidden");
  astrae.classList.add("hidden");
  cryon.classList.add("hidden");
}

function selectAstrae() {
  role = "Astrae";
  hideAll();
  astrae.classList.remove("hidden");
}

function selectCryon() {
  role = "Cryon";
  hideAll();
  cryon.classList.remove("hidden");
}

function createRoom() {
  socket.emit("create-room");
}

socket.on("room-created", code => {
  roomCode = code;
  document.getElementById("astrae-code").innerText = "Code: " + code;
});

function enterAstrae() {
  socket.emit("join-room", { code: roomCode, user: role });
  astrae.classList.add("hidden");
  chat.classList.remove("hidden");
}

function enterCryon() {
  const code = document.getElementById("cryon-code").value;
  socket.emit("join-room", { code, user: role });
}

socket.on("wrong-code", () => {
  document.getElementById("error").innerText = "Wrong Code";
});

socket.on("system", msg => add(msg));
socket.on("message", m => add(m.user + ": " + m.text));

function send() {
  socket.emit("message", document.getElementById("msg").value);
  document.getElementById("msg").value = "";
}

function add(text) {
  document.getElementById("messages").innerHTML += `<div>${text}</div>`;
}
