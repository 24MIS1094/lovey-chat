const socket = io("https://lovey-chat.onrender.com", {
  transports: ["websocket", "polling"]
});


let role = "";
let roomCode = "";

const select = document.getElementById("select");
const astrae = document.getElementById("astrae");
const cryon = document.getElementById("cryon");
const chat = document.getElementById("chat");

document.getElementById("astraeBtn").onclick = () => {
  role = "Astrae";
  select.style.display = "none";
  astrae.style.display = "block";
};

document.getElementById("cryonBtn").onclick = () => {
  role = "Cryon";
  select.style.display = "none";
  cryon.style.display = "block";
};

document.getElementById("genBtn").onclick = () => {
  socket.emit("create-room");
};

socket.on("room-created", (code) => {
  roomCode = code;
  document.getElementById("code").innerText = code;
});

document.getElementById("enterAstrae").onclick = () => {
  socket.emit("join-room", { code: roomCode, user: role });
  astrae.style.display = "none";
  chat.style.display = "block";
};

document.getElementById("enterCryon").onclick = () => {
  const code = document.getElementById("joinCode").value.trim().toUpperCase();
  socket.emit("join-room", { code, user: role });
};

socket.on("wrong-code", () => {
  alert("Wrong Code");
});

socket.on("system", (msg) => add(msg));
socket.on("message", (m) => add(`${m.user}: ${m.text}`));

document.getElementById("sendBtn").onclick = () => {
  socket.emit("message", document.getElementById("msg").value);
  document.getElementById("msg").value = "";
};

function add(text) {
  chat.style.display = "block";
  document.getElementById("messages").innerHTML += `<div>${text}</div>`;
}
