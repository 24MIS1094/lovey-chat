// REPLACE THIS URL with your Render backend URL!
const socket = io("https://your-backend-name.onrender.com");

let myUser = "";
let myRoom = "";
let mediaRecorder;
let audioChunks = [];

/* UI Navigation */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

/* Astrae Flow */
function startAstrae() {
  myUser = "Astrae";
  socket.emit("create-room");
}

socket.on("room-created", (code) => {
  myRoom = code;
  document.getElementById("generated-code").innerText = code;
  showScreen("astrae-page");
});

function joinChat(user) {
  socket.emit("join-room", { code: myRoom, user });
}

/* Cryon Flow */
function startCryon() {
  myUser = "Cryon";
  showScreen("cryon-page");
}

function verifyAndJoin() {
  myRoom = document.getElementById("join-input").value.toUpperCase();
  socket.emit("join-room", { code: myRoom, user: "Cryon" });
}

socket.on("wrong-code", () => {
  document.getElementById("error-msg").innerText = "❌ Invalid Code";
});

/* Success Join */
socket.on("system", (msg) => {
  document.getElementById("display-name").innerText = "You are " + myUser;
  showScreen("chat-screen");
});

/* Chat Logic */
function sendMsg() {
  const val = document.getElementById("msg-input").value;
  if(!val) return;
  socket.emit("message", val);
  document.getElementById("msg-input").value = "";
}

socket.on("message", d => {
  const m = document.createElement("div");
  m.className = "msg-bubble";
  m.innerHTML = `<b>${d.user}:</b> ${d.text}`;
  document.getElementById("messages").append(m);
});

/* Image Logic (View 2 times) */
function triggerImg() { document.getElementById("img-input").click(); }

document.getElementById("img-input").onchange = e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => socket.emit("image", reader.result);
  reader.readAsDataURL(file);
};

socket.on("image", d => {
  const img = document.createElement("img");
  img.src = d.data;
  img.id = d.id;
  img.className = "view-once";
  img.onclick = () => {
    window.open(d.data);
    socket.emit("view-image", d.id);
  };
  document.getElementById("messages").append(img);
});

socket.on("remove-image", id => {
  const el = document.getElementById(id);
  if(el) el.remove();
  document.getElementById("messages").innerHTML += "<i>(Image expired)</i>";
});

/* Voice Logic */
function startRec() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    audioChunks = [];
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  });
}

function stopRec() {
  mediaRecorder.stop();
  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks);
    const reader = new FileReader();
    reader.onload = () => socket.emit("voice", reader.result);
    reader.readAsDataURL(blob);
  };
}

socket.on("voice", d => {
  const audio = new Audio(d.audio);
  audio.controls = true;
  document.getElementById("messages").append(audio);
});

/* Theme */
function changeTheme(theme) {
  document.body.className = theme;
}