const start = document.getElementById("start");
const astraePage = document.getElementById("astraePage");
const cryonPage = document.getElementById("cryonPage");
const chat = document.getElementById("chat");

const astraeCodeBox = document.getElementById("astraeCode");
const cryonInput = document.getElementById("cryonInput");
const error = document.getElementById("error");
const userTitle = document.getElementById("userTitle");

// Astrae flow
function goAstrae() {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  localStorage.setItem("lovey_code", code);

  astraeCodeBox.innerText = code;

  start.classList.add("hidden");
  cryonPage.classList.add("hidden");
  astraePage.classList.remove("hidden");
}

// Cryon flow
function goCryon() {
  start.classList.add("hidden");
  astraePage.classList.add("hidden");
  cryonPage.classList.remove("hidden");
}

// Cryon code check
function checkCryon() {
  const savedCode = localStorage.getItem("lovey_code");
  const entered = cryonInput.value.trim().toUpperCase();

  if (!entered) {
    error.innerText = "Enter the code";
    return;
  }

  if (entered !== savedCode) {
    error.innerText = "❌ Wrong code";
    return;
  }

  enterChat("Cryon");
}

// Enter chat
function enterChat(user) {
  start.classList.add("hidden");
  astraePage.classList.add("hidden");
  cryonPage.classList.add("hidden");
  chat.classList.remove("hidden");

  userTitle.innerText = `You are ${user}`;
}
