const socket = io("https://lovey-chat.onrender.com", {
  transports: ["websocket"]
});

let role = "";
let mediaRecorder;
let audioChunks = [];

/* -------- ENTRY -------- */
function openAstrae() {
  role = "Astrae";
  socket.emit("create-room");
}

function openCryon() {
  role = "Cryon";
  start.hidden = true;
  join.hidden = false;
}

socket.on("room-created", code => {
  start.hidden = true;
  join.hidden = false;
  codeDisplay.innerText = code;
});

function enterChat() {
  const code = codeInput.value || codeDisplay.innerText;
  socket.emit("join-room", { code, user: role });
}

socket.on("joined", () => {
  join.hidden = true;
  chat.hidden = false;
});

/* -------- TEXT -------- */
function sendMsg() {
  if (!msg.value.trim()) return;
  socket.emit("message", msg.value);
  msg.value = "";
}

msg.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMsg();
  socket.emit("typing");
  setTimeout(() => socket.emit("stop-typing"), 500);
});

/* -------- IMAGE -------- */
function sendImage() {
  const file = img.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => socket.emit("image", reader.result);
  reader.readAsDataURL(file);
}

/* -------- VOICE -------- */
async function recordVoice() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    const reader = new FileReader();
    reader.onload = () => socket.emit("voice", reader.result);
    reader.readAsDataURL(blob);
  };

  mediaRecorder.start();
  setTimeout(() => mediaRecorder.stop(), 3000);
}

/* -------- RENDER -------- */
socket.on("message", m => addMsg(m.text, m.user === role));
socket.on("image", i => addImg(i.data, i.user === role));
socket.on("voice", v => addVoice(v.audio, v.user === role));
socket.on("clear", () => messages.innerHTML = "");

function addMsg(text, me) {
  const d = document.createElement("div");
  d.className = `msg ${me ? "me" : "other"}`;
  d.textContent = text;
  messages.appendChild(d);
}

function addImg(data, me) {
  const i = document.createElement("img");
  i.src = data;
  i.className = `msg ${me ? "me" : "other"}`;
  messages.appendChild(i);
}

function addVoice(data, me) {
  const a = document.createElement("audio");
  a.controls = true;
  a.src = data;
  a.className = `msg ${me ? "me" : "other"}`;
  messages.appendChild(a);
}

function clearChat() {
  socket.emit("clear-chat");
}
