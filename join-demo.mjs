import WebSocket from 'ws';
const URL='ws://localhost:3090/ws';
const open=()=>new Promise(r=>{const w=new WebSocket(URL);w.on('open',()=>r(w));});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const names=['Carlos','María','Pedro','Luisa','Diego','Ana','José','Valentina'];
for(const name of names){const w=await open();w.send(JSON.stringify({type:'join',role:'student',name}));await wait(200);}
await wait(400);console.log('entraron '+names.length);process.exit(0);
