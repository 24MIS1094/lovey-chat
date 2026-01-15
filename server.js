const socket = io("https://lovey-chat.onrender.com");

let role = "";
let code = "";
let rec, chunks = [];

function astrae() {
  role = "Astrae";
  select.style.display = "none";
  a.style.display = "block";
}

function cryon() {
  role = "Cryon";
  select.style.display = "none";
  c.style.display = "block";
}

function create() {
  socket.emit("create-room");
}

socket.on("room-created", c => {
  code = c;
  document.getElementById("code").innerText = "Code: " + c;
});

function enter() {
  socket.emit("join-room", { code, user: role });
  show();
}

function join() {
  socket.emit("join-room", { code: join.value, user: role });
}

socket.on("wrong-code", () => err.innerText = "Invalid Code");

function show() {
  a.style.display = c.style.display = "none";
  chat.style.display = "block";
}

socket.on("system", t => add(t));
socket.on("message", m => add(`${m.user}: ${m.text}`));

function send() {
  socket.emit("message", m.value);
  m.value = "";
}

function add(t) {
  msgs.innerHTML += `<div>${t}</div>`;
}

function img(i) {
  const r = new FileReader();
  r.onload = () => socket.emit("image", r.result);
  r.readAsDataURL(i.files[0]);
}

socket.on("image", d => {
  const im = document.createElement("img");
  im.src = d;
  im.width = 150;
  msgs.appendChild(im);
});

function voice() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
    rec = new MediaRecorder(s);
    rec.start();
    rec.ondataavailable = e => chunks.push(e.data);
    setTimeout(() => {
      rec.stop();
      rec.onstop = () => {
        const b = new Blob(chunks);
        const r = new FileReader();
        r.onload = () => socket.emit("voice", r.result);
        r.readAsDataURL(b);
        chunks = [];
      };
    }, 3000);
  });
}

socket.on("voice", a => {
  const au = document.createElement("audio");
  au.src = a;
  au.controls = true;
  msgs.appendChild(au);
});

function clearChat() {
  socket.emit("clear-chat");
}

socket.on("clear", () => msgs.innerHTML = "");
