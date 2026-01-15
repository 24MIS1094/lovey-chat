// ⚠️ CHANGE THIS URL TO YOUR RENDER URL!
const socket = io("https://lovey-chat-backend.onrender.com"); 

let myUser = "", myRoom = "", mediaRecorder, audioChunks = [];

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function startAstrae() {
    myUser = "Astrae";
    socket.emit("create-room");
}

socket.on("room-created", (code) => {
    myRoom = code;
    document.getElementById("code-display").innerText = code;
    showScreen("astrae-page");
});

function joinChat(user) {
    socket.emit("join-room", { code: myRoom, user });
}

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

socket.on("system", (data) => {
    document.getElementById("display-name").innerText = "You are " + myUser;
    showScreen("chat-screen");
    addMsg("System", data.user + " " + data.msg);
});

function sendMsg() {
    const val = document.getElementById("msg-input").value;
    if(!val) return;
    socket.emit("message", val);
    document.getElementById("msg-input").value = "";
}

socket.on("message", d => addMsg(d.user, d.text));

function addMsg(user, text) {
    const m = document.createElement("div");
    m.className = "msg-bubble";
    m.innerHTML = `<b>${user}:</b> ${text}`;
    document.getElementById("messages").append(m);
    document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
}

/* Image Logic */
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
    img.title = "Click to view. Expires after 2 views.";
    img.onclick = () => { window.open(d.data); socket.emit("view-image", d.id); };
    document.getElementById("messages").append(img);
});

socket.on("remove-image", id => {
    const el = document.getElementById(id);
    if(el) el.remove();
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
    if(!mediaRecorder) return;
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks);
        const reader = new FileReader();
        reader.onload = () => socket.emit("voice", reader.result);
        reader.readAsDataURL(blob);
    };
}

socket.on("voice", d => {
    const au = new Audio(d.audio);
    au.controls = true;
    document.getElementById("messages").append(au);
});