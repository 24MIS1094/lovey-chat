let socket;
let room = "";
let recorder;
let chunks = [];

window.onload = () => {

  socket = io("https://lovey-chat.onrender.com", {
    transports: ["polling"],
    reconnection: true
  });

  const show = id => {
    ["home","astrae","cryon","chat"].forEach(v =>
      document.getElementById(v).classList.add("hidden")
    );
    document.getElementById(id).classList.remove("hidden");
  };

  document.getElementById("astraeBtn").onclick = () => {
    show("astrae");
    socket.emit("create-room");
  };

  document.getElementById("cryonBtn").onclick = () => show("cryon");

  document.getElementById("enterAstrae").onclick = () =>
    socket.emit("join-room",{ code: room, user:"Astrae" });

  document.getElementById("enterCryon").onclick = () => {
    const c = document.getElementById("codeInput").value.trim();
    socket.emit("join-room",{ code:c, user:"Cryon" });
  };

  document.getElementById("send").onclick = () => {
    const t = text.value.trim();
    if(t) socket.emit("message", t);
    text.value="";
  };

  document.getElementById("imgBtn").onclick = () =>
    document.getElementById("image").click();

  image.onchange = e => {
    const r = new FileReader();
    r.onload = () => socket.emit("image", r.result);
    r.readAsDataURL(e.target.files[0]);
  };

  document.getElementById("voice").onclick = async () => {
    if(!recorder){
      const s = await navigator.mediaDevices.getUserMedia({audio:true});
      recorder = new MediaRecorder(s);
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        const b = new Blob(chunks,{type:"audio/webm"});
        chunks=[];
        const r=new FileReader();
        r.onload=()=>socket.emit("voice",r.result);
        r.readAsDataURL(b);
      };
      recorder.start();
    }else{
      recorder.stop();
      recorder=null;
    }
  };

  emoji.onclick = () => text.value += "😊";

  socket.on("room-created", c => {
    room=c;
    roomCode.innerText=c;
  });

  socket.on("joined", () => show("chat"));

  socket.on("wrong-code", () =>
    error.innerText="Invalid Code"
  );

  socket.on("system", m => add(m,"sys"));
  socket.on("message", m => add(`${m.user}: ${m.text}`));
  socket.on("image", i => add(`<img src="${i}">`,"img"));
  socket.on("voice", a => add(`<audio controls src="${a}"></audio>`));

  function add(v,cls=""){
    const d=document.createElement("div");
    d.className=cls;
    d.innerHTML=v;
    messages.appendChild(d);
    messages.scrollTop=messages.scrollHeight;
  }
};
