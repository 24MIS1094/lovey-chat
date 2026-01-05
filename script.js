// Firebase config
var firebaseConfig = {
  apiKey: "AIzaSyDcL1k5jPQ_k19JVOf8Pff4RyLkfHOQPh0",
  authDomain: "private-chat-3fc5f.firebaseapp.com",
  projectId: "private-chat-3fc5f",
  messagingSenderId: "802691374928",
  appId: "1:802691374928:web:5ec59b22a6d1c733309655"
};

firebase.initializeApp(firebaseConfig);

var auth = firebase.auth();
var db = firebase.firestore();

var currentUser = "";
var roomCode = "";

/* USER 1 */
function startUser1() {
  currentUser = "user1";
  auth.signInAnonymously().then(() => {
    roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById("roomCode").innerText = roomCode;

    db.collection("chatRoom").doc("room").set({
      roomCode: roomCode,
      typing: ""
    });

    document.getElementById("login").style.display = "none";
    document.getElementById("codeScreen").style.display = "block";
  });
}

/* USER 2 */
function startUser2() {
  currentUser = "user2";
  auth.signInAnonymously().then(() => {
    document.getElementById("login").style.display = "none";
    document.getElementById("joinScreen").style.display = "block";
  });
}

function verifyCode() {
  var input = document.getElementById("codeInput").value;
  db.collection("chatRoom").doc("room").get().then(doc => {
    if (doc.exists && doc.data().roomCode === input) {
      enterChat();
    } else {
      alert("Invalid code");
    }
  });
}

function enterChat() {
  document.getElementById("codeScreen").style.display = "none";
  document.getElementById("joinScreen").style.display = "none";
  document.getElementById("chat").style.display = "flex";
  loadMessages();
  listenTyping();
}

/* CHAT */
function sendMessage() {
  var input = document.getElementById("messageInput");
  var text = input.value.trim();
  if (!text) return;

  db.collection("chatRoom").doc("room").collection("messages").add({
    text: text,
    sender: currentUser,
    time: firebase.firestore.FieldValue.serverTimestamp()
  });

  db.collection("chatRoom").doc("room").update({ typing: "" });
  input.value = "";
}

function loadMessages() {
  db.collection("chatRoom").doc("room").collection("messages")
    .orderBy("time")
    .onSnapshot(snapshot => {
      var box = document.getElementById("messages");
      box.innerHTML = "";
      snapshot.forEach(doc => {
        var msg = doc.data();
        var div = document.createElement("div");
        div.className = "msg " + (msg.sender === currentUser ? "me" : "other");
        div.innerText = msg.text;
        box.appendChild(div);
      });
      box.scrollTop = box.scrollHeight;
    });
}

/* TYPING INDICATOR */
document.addEventListener("keyup", e => {
  if (e.target.id === "messageInput") {
    if (e.key === "Enter") sendMessage();
    else {
      db.collection("chatRoom").doc("room")
        .update({ typing: currentUser });
    }
  }
});

function listenTyping() {
  db.collection("chatRoom").doc("room")
    .onSnapshot(doc => {
      var t = doc.data().typing;
      document.getElementById("typingStatus").innerText =
        t && t !== currentUser ? "Typing..." : "";
    });
}

/* EMOJI */
function addEmoji(e) {
  document.getElementById("messageInput").value += e;
}

/* DELETE CHAT */
function clearChat() {
  if (!confirm("Delete all messages?")) return;
  db.collection("chatRoom").doc("room").collection("messages")
    .get().then(s => s.forEach(d => d.ref.delete()));
}
