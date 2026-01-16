const socket = io("https://lovey-chat.onrender.com");

let role = "";
let recorder, chunks = [];

function openAstrae() {
  role = "Astrae";
  socket.emit("create-room");
}

function openCryon() {
  role = "Cryon";
  document.getElementById("start").hidden = true;
  document.getElementById("join").hidden = false;
}

socket.on("room-created", code => {
  document.getElementById("start").hidden = true;
  document.getElementById("join").hidden = false;
  document.getElementById("codeDisplay").innerText = code;
});

function enterChat() {
  const code = document.getElementById("codeInput").value ||
               document.getElementById("codeDisplay").innerText;
  socket.emit("join-room", { code, user: role });
}

socket.on("joined", () => {
  document.getElementById("join").hidden = true;
  document.getElementById("chat").hidden = false;
});

socket.on("message", m => addMsg(m.text, m.user === role));
socket.on("image", i => addImg(i.data, i.user === role));
socket.on("voice", v => addVoice(v.audio, v.user === role));

socket.on("typing", u => document.getElementById("typing").innerText = `${u} typing...`);
socket.on("stop-typing", () => document.getElementById("typing").innerText = "");

socket.on("clear", () => document.getElementById("messages").innerHTML = "");

function sendMsg() {
  const msg = document.getElementById("msg").value;
  socket.emit("message", msg);
  document.getElementById("msg").value = "";
}

function typing(e) {
  socket.emit("typing");
  if (e.key === "Enter") sendMsg();
  setTimeout(() => socket.emit("stop-typing"), 500);
}

function sendImage() {
  const file = document.getElementById("img").files[0];
  const reader = new FileReader();
  reader.onload = () => socket.emit("image", reader.result);
  reader.readAsDataURL(file);
}

function recordVoice() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    recorder = new MediaRecorder(stream);
    recorder.start();
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks);
      const reader = new FileReader();
      reader.onload = () => socket.emit("voice", reader.result);
      reader.readAsDataURL(blob);
      chunks = [];
    };
    setTimeout(() => recorder.stop(), 3000);
  });
}

function addMsg(text, me) {
  const d = document.createElement("div");
  d.className = `msg ${me ? "me" : "other"}`;
  d.innerText = text;
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
