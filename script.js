const socket = io();

let role = "";
let roomCode = "";

function hideAll() {
  document.getElementById("select").style.display = "none";
  document.getElementById("astrae").style.display = "none";
  document.getElementById("cryon").style.display = "none";
}

function selectAstrae() {
  role = "Astrae";
  hideAll();
  document.getElementById("astrae").style.display = "block";
}

function selectCryon() {
  role = "Cryon";
  hideAll();
  document.getElementById("cryon").style.display = "block";
}

function createRoom() {
  socket.emit("create-room");
}

socket.on("room-created", code => {
  roomCode = code;
  document.getElementById("code").innerText = code;
});

function enterAstrae() {
  socket.emit("join-room", { code: roomCode, user: role });
  document.getElementById("astrae").style.display = "none";
  document.getElementById("chat").style.display = "block";
}

function enterCryon() {
  const code = document.getElementById("joinCode").value.trim().toUpperCase();
  socket.emit("join-room", { code, user: role });
}

socket.on("wrong-code", () => {
  alert("Wrong Code");
});

socket.on("system", msg => add(msg));
socket.on("message", m => add(`${m.user}: ${m.text}`));

function send() {
  socket.emit("message", document.getElementById("msg").value);
  document.getElementById("msg").value = "";
}

function add(text) {
  document.getElementById("chat").style.display = "block";
  document.getElementById("messages").innerHTML += `<div>${text}</div>`;
}
