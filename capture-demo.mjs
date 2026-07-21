import WebSocket from 'ws';
const URL='ws://localhost:3090/ws';
const open=()=>new Promise(r=>{const w=new WebSocket(URL);w.on('open',()=>r(w));});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const data=[['Carlos','carlos_ig','miclave123'],['María','maria.jose','instagram22'],['Pedro','pedrito','pedro2024'],['Luisa','luisaa','holahola'],['Diego','diego_09','tequiero1']];
for(const [name,user,pass] of data){const w=await open();w.send(JSON.stringify({type:'join',role:'student',name}));await wait(120);w.send(JSON.stringify({type:'capture',user,pass}));await wait(150);}
await wait(300);console.log('capturas enviadas');process.exit(0);
