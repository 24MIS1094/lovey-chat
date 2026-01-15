console.log("script.js loaded"); // 🔥 DEBUG

const socket = io();

let role = "";
let roomCode = "";

const select = document.getElementById("select");
const astrae = document.getElementById("astrae");
const cryon = document.getElementById("cryon");
const chat = document.getElementById("chat");

document.getElementById("astraeBtn").addEventListener("click", () => {
  console.log("Astrae clicked");
  role = "Astrae";
  select.style.display = "none";
  astrae.style.display = "block";
});

document.getElementById("cryonBtn").addEventListener("click", () => {
  console.log("Cryon clicked");
  role = "Cryon";
  select.style.display = "none";
  cryon.style.display = "block";
});

document.getElementById("genBtn").addEventListener("click", () => {
  console.log("Generate room");
  socket.emit("create-room");
});

socket.on("room-created", code => {
  console.log("Room created:", code);
  roomCode = code;
  document.getElementById("code").innerText = code;
});

document.getElementById("enterAstrae").addEventListener("click", () => {
  socket.emit("join-room", { code: roomCode, user: role });
  astrae.style.display = "none";
  chat.style.display = "block";
});

document.getElementById("enterCryon").addEventListener("click", () => {
  const code = document.getElementById("joinCode").value.trim().toUpperCase();
  socket.emit("join-room", { code, user: role });
});

socket.on("wrong-code", () => {
  alert("Wrong Code");
});

socket.on("system", msg => add(msg));
socket.on("message", m => add(`${m.user}: ${m.text}`));

document.getElementById("sendBtn").addEventListener("click", () => {
  socket.emit("message", document.getElementById("msg").value);
  document.getElementById("msg").value = "";
});

function add(text) {
  chat.style.display = "block";
  document.getElementById("messages").innerHTML += `<div>${text}</div>`;
}
