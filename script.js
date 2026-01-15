const socket = io("https://lovey-chat.onrender.com");

let role = "";
let roomCode = "";
let recorder, audioChunks = [];

function asAstrae() {
  role = "Astrae";
  document.getElementById("select").style.display = "none";
  document.getElementById("astrae").style.display = "block";
}

function asCryon() {
  role = "Cryon";
  document.getElementById("select").style.display = "none";
  document.getElementById("cryon").style.display = "block";
}

function createRoom() {
  socket.emit("create-room");
}

socket.on("room-created", code => {
  roomCode = code;
  document.getElementById("code").innerText = "Code: " + code;
});

function enterChat() {
  socket.emit("join-room", { code: roomCode, user: role });
  showChat();
}

function joinRoom() {
  const code = document.getElementById("joinCode").value;
  socket.emit("join-room", { code, user: role });
}

socket.on("wrong-code", () => {
  document.getElementById("error").innerText = "Wrong code ❌";
});

function showChat() {
  document.getElementById("astrae").style.display = "none";
  document.getElementById("cryon").style.display = "none";
  document.getElementById("chat").style.display = "block";
}

socket.on("system", msg => add(msg));
socket.on("message", m => add(`${m.user}: ${m.text}`));

function send() {
  const t = msg.value;
  socket.emit("message", t);
  msg.value = "";
}

function add(text) {
  messages.innerHTML += `<div>${text}</div>`;
}

function sendImage() {
  const file = img.files[0];
  const r = new FileReader();
  r.onload = () => socket.emit("image", r.result);
  r.readAsDataURL(file);
}

socket.on("image", ({ id, data }) => {
  const i = document.createElement("img");
  i.src = data;
  i.width = 150;
  i.onclick = () => socket.emit("view-image", id);
  i.id = id;
  messages.appendChild(i);
});

socket.on("remove-image", id => {
  const el = document.getElementById(id);
  if (el) el.remove();
});

function record() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
    recorder = new MediaRecorder(s);
    recorder.start();
    recorder.ondataavailable = e => audioChunks.push(e.data);
    setTimeout(() => {
      recorder.stop();
      recorder.onstop = () => {
        const blob = new Blob(audioChunks);
        const r = new FileReader();
        r.onload = () => socket.emit("voice", r.result);
        r.readAsDataURL(blob);
        audioChunks = [];
      };
    }, 3000);
  });
}

socket.on("voice", audio => {
  const a = document.createElement("audio");
  a.src = audio;
  a.controls = true;
  messages.appendChild(a);
});

function clearChat() {
  socket.emit("clear-chat");
}

socket.on("clear", () => messages.innerHTML = "");
