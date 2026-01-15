const socket = io();
let role = "";
let roomCode = "";

function choose(r) {
  role = r;
  document.getElementById("select").style.display = "none";
  document.getElementById(r.toLowerCase()).style.display = "block";
}

function createRoom() {
  socket.emit("create-room");
}

socket.on("room-created", code => {
  roomCode = code;
  document.getElementById("code").innerText = code;
});

function joinRoom() {
  const code = document.getElementById("joinCode").value.trim().toUpperCase();
  socket.emit("join-room", { code, user: role });
}

function enterChat() {
  socket.emit("join-room", { code: roomCode, user: role });
}

socket.on("wrong-code", () => {
  alert("Wrong code");
});

socket.on("system", msg => add(msg));
socket.on("message", m => add(`${m.user}: ${m.text}`));

function send() {
  socket.emit("message", document.getElementById("msg").value);
  document.getElementById("msg").value = "";
}

function add(t) {
  document.getElementById("chat").style.display = "block";
  document.getElementById("messages").innerHTML += `<div>${t}</div>`;
}
