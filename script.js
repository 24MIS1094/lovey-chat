const socket = io("https://lovey-chat.onrender.com", {
  transports: ["websocket"]
});

let role = "";
let recorder, chunks = [];

window.onload = () => {
  astraeBtn.onclick = openAstrae;
  cryonBtn.onclick = openCryon;
  enterBtn.onclick = enterChat;
  sendBtn.onclick = sendMsg;
  imgBtn.onclick = () => imgInput.click();
  imgInput.onchange = sendImage;
  voiceBtn.onclick = recordVoice;
};

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

socket.on("wrong-code", () => {
  error.innerText = "Wrong Code";
});

msg.onkeydown = e => {
  if (e.key === "Enter") sendMsg();
  socket.emit("typing");
  setTimeout(() => socket.emit("stop-typing"), 500);
};

socket.on("typing", u => typing.innerText = `${u} typing...`);
socket.on("stop-typing", () => typing.innerText = "");

socket.on("message", m => addMsg(m.text, m.user === role));
socket.on("image", i => addImg(i.data, i.user === role));
socket.on("voice", v => addVoice(v.audio, v.user === role));
socket.on("clear", () => messages.innerHTML = "");

function sendMsg() {
  if (!msg.value.trim()) return;
  socket.emit("message", msg.value);
  msg.value = "";
}

function sendImage() {
  const file = imgInput.files[0];
  const reader = new FileReader();
  reader.onload = () => socket.emit("image", reader.result);
  reader.readAsDataURL(file);
}

async function recordVoice() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recorder = new MediaRecorder(stream);
  chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/webm" });
    const reader = new FileReader();
    reader.onload = () => socket.emit("voice", reader.result);
    reader.readAsDataURL(blob);
  };
  recorder.start();
  setTimeout(() => recorder.stop(), 3000);
}

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
