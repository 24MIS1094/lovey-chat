// ===== GLOBAL STATE =====
let socket;
let roomCode = "";

// ===== DOM READY =====
window.onload = () => {

  // CONNECT SOCKET
  socket = io("https://lovey-chat.onrender.com", {
    transports: ["polling"],
    reconnection: true
  });

  // ELEMENTS
  const home = document.getElementById("home");
  const astrae = document.getElementById("astrae");
  const cryon = document.getElementById("cryon");
  const chat = document.getElementById("chat");
  const codeBox = document.getElementById("codeBox");
  const error = document.getElementById("error");
  const messages = document.getElementById("messages");
  const msg = document.getElementById("msg");

  // BUTTONS
  document.getElementById("btnAstrae").onclick = () => {
    home.classList.add("hidden");
    astrae.classList.remove("hidden");
    socket.emit("create-room");
  };

  document.getElementById("btnCryon").onclick = () => {
    home.classList.add("hidden");
    cryon.classList.remove("hidden");
  };

  document.getElementById("btnAstraeEnter").onclick = () => {
    socket.emit("join-room", { code: roomCode, user: "Astrae" });
  };

  document.getElementById("btnCryonEnter").onclick = () => {
    const code = document.getElementById("joinCode").value.trim();
    socket.emit("join-room", { code, user: "Cryon" });
  };

  document.getElementById("sendBtn").onclick = () => {
    if (!msg.value.trim()) return;
    socket.emit("message", msg.value);
    msg.value = "";
  };

  // SOCKET EVENTS
  socket.on("room-created", (code) => {
    roomCode = code;
    codeBox.innerText = code;
  });

  socket.on("joined", () => {
    astrae.classList.add("hidden");
    cryon.classList.add("hidden");
    chat.classList.remove("hidden");
  });

  socket.on("wrong-code", () => {
    error.innerText = "WRONG CODE";
  });

  socket.on("system", (text) => add(text, "sys"));
  socket.on("message", (m) => add(`${m.user}: ${m.text}`));

  function add(text, cls = "") {
    const d = document.createElement("div");
    d.className = cls;
    d.innerText = text;
    messages.appendChild(d);
  }
};
