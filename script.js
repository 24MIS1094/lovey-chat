const socket = io("https://lovey-chat.onrender.com", {
  transports: ["polling"]
});


let role = "";
let roomCode = "";

function asAstrae(){
  role = "Astrae";
  home.style.display="none";
  astrae.classList.remove("hidden");
  socket.emit("create-room");
}

socket.on("room-created", code=>{
  roomCode = code;
  codeBox.innerText = code;
});

function enterChat(){
  socket.emit("join-room",{code:roomCode,user:"Astrae"});
  astrae.classList.add("hidden");
  chat.classList.remove("hidden");
}

function asCryon(){
  role = "Cryon";
  home.style.display="none";
  cryon.classList.remove("hidden");
}

function joinChat(){
  socket.emit("join-room",{code:joinCode.value,user:"Cryon"});
}

socket.on("wrong-code",()=>{
  error.innerText="Wrong Code";
});

socket.on("system",t=>addMsg(t,"sys"));
socket.on("message",m=>addMsg(`${m.user}: ${m.text}`));
socket.on("image",img=>{
  const i=document.createElement("img");
  i.src=img.data;
  i.onclick=()=>socket.emit("view-image",img.id);
  messages.appendChild(i);
});
socket.on("remove-image",id=>{
  document.querySelectorAll("img").forEach(i=>{
    if(i.onclick) i.remove();
  });
});
socket.on("voice",a=>{
  const au=document.createElement("audio");
  au.src=a;au.controls=true;
  messages.appendChild(au);
});
socket.on("clear",()=>messages.innerHTML="");

function send(){
  socket.emit("message",msg.value);
  msg.value="";
}

function sendImage(){
  const f=document.createElement("input");
  f.type="file";
  f.onchange=()=>{
    const r=new FileReader();
    r.onload=()=>socket.emit("image",{id:Date.now(),data:r.result});
    r.readAsDataURL(f.files[0]);
  };
  f.click();
}

let rec;
function recordVoice(){
  navigator.mediaDevices.getUserMedia({audio:true}).then(s=>{
    rec=new MediaRecorder(s);
    rec.start();
    rec.ondataavailable=e=>{
      const r=new FileReader();
      r.onload=()=>socket.emit("voice",r.result);
      r.readAsDataURL(e.data);
    };
    setTimeout(()=>rec.stop(),3000);
  });
}

function clearChat(){socket.emit("clear-chat");}

function addMsg(t,c=""){
  const d=document.createElement("div");
  d.className=c;
  d.innerText=t;
  messages.appendChild(d);
}

function setTheme(t){
  document.body.className=t;
}
