/* Standalone FPS trainer:
 - Smooth mouse-driven crosshair that follows the mouse
 - Timed rounds (configurable), ammo + reload mechanic
 - Moving & armored targets with HP, scoring & accuracy, robust hit math
 - DPI-aware canvas transforms
*/

const canvas = document.getElementById('view'), ctx = canvas.getContext('2d');
const ammoEl = document.getElementById('ammo'), scoreEl = document.getElementById('score'), timeEl = document.getElementById('time');
const cross = document.getElementById('cross');
let dpi = window.devicePixelRatio || 1;
function fixDPI(){ const rect = canvas.getBoundingClientRect(); canvas.width = Math.floor(rect.width * dpi); canvas.height = Math.floor(rect.height * dpi); ctx.setTransform(dpi,0,0,dpi,0,0); }
fixDPI(); window.addEventListener('resize', fixDPI);

let maxAmmo = 30, ammo = maxAmmo, score = 0, timer = 30, running=false, last=0, shots=0, hits=0;
let targets = [], spawnTimer = 0, roundsActive=false;
let crossX=window.innerWidth/2, crossY=window.innerHeight/2;
const center = ()=>{ const r = canvas.getBoundingClientRect(); return {cx:r.left + r.width/2, cy:r.top + r.height/2, w:r.width, h:r.height}; };

function randBetween(a,b){ return a + Math.random()*(b-a); }
function spawnTarget(type='static'){
  const rect = canvas.getBoundingClientRect();
  const x = randBetween(140, rect.width - 140);
  const y = randBetween(80, rect.height - 80);
  const r = randBetween(14, 28);
  const vx = type==='moving' ? randBetween(-80,80) : 0;
  const hp = type==='armored' ? 2 : 1;
  targets.push({x,y,r,vx,hp,type,hit:false});
}
function bulkSpawn(n=5){ for(let i=0;i<n;i++) spawnTarget(Math.random()>0.8?'armored':(Math.random()>0.6?'moving':'static')); }

document.getElementById('startBtn').addEventListener('click', ()=>{
  ammo = maxAmmo; score=0; timer=30; shots=0; hits=0; ammoEl.textContent=ammo; scoreEl.textContent=score; timeEl.textContent=timer;
  targets=[]; bulkSpawn(6); running=true; roundsActive=true; last = performance.now(); requestAnimationFrame(loop);
});

canvas.addEventListener('mousemove', e=>{ // place DOM crosshair smoothly
  const rect = canvas.getBoundingClientRect();
  cross.style.left = (e.clientX) + 'px';
  cross.style.top = (e.clientY) + 'px';
});

canvas.addEventListener('click', e=>{
  if(!roundsActive) return;
  if(ammo <= 0) return;
  ammo--; shots++; ammoEl.textContent = ammo;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  // compute ray from canvas center to click direction
  const centerLocal = {x: rect.width/2, y: rect.height/2};
  const dx = mx - centerLocal.x, dy = my - centerLocal.y;
  const mag = Math.hypot(dx,dy);
  if(mag === 0) return;
  const ux = dx/mag, uy = dy/mag;
  // sort targets by distance from center, check ray intersection
  const order = targets.filter(t=>!t.hit).slice().sort((a,b)=> (Math.hypot(a.x-centerLocal.x,a.y-centerLocal.y) - Math.hypot(b.x-centerLocal.x,b.y-centerLocal.y)));
  for(const t of order){
    const vx = t.x - centerLocal.x, vy = t.y - centerLocal.y;
    const proj = vx*ux + vy*uy;
    if(proj < 0) continue;
    const px = proj*ux, py = proj*uy;
    const dx2 = vx - px, dy2 = vy - py;
    if(dx2*dx2 + dy2*dy2 <= t.r*t.r){
      t.hp -= 1; hits++; score += (t.type==='armored'?250:100); scoreEl.textContent = score;
      if(t.hp<=0){ t.hit=true; setTimeout(()=>{ const i=targets.indexOf(t); if(i>=0) targets.splice(i,1); },200); }
      break;
    }
  }
});

document.addEventListener('keydown', e=>{ if(e.key.toLowerCase()==='r'){ ammo = maxAmmo; ammoEl.textContent=ammo; } });

function loop(now){
  const dt = Math.min(50, now - last)/1000; last = now;
  if(roundsActive){
    timer -= dt; timeEl.textContent = Math.max(0, Math.ceil(timer));
    spawnTimer -= dt;
    if(spawnTimer <= 0){ bulkSpawn(1 + Math.floor(Math.random()*2)); spawnTimer = 0.8 + Math.random()*1.2; }
    // update
    const rect = canvas.getBoundingClientRect();
    for(const t of targets){ t.x += t.vx * dt; if(t.x < 40) t.vx = Math.abs(t.vx); if(t.x > rect.width - 40) t.vx = -Math.abs(t.vx); }
    if(timer <= 0){ roundsActive=false; endRound(); }
    render();
    requestAnimationFrame(loop);
  }
}

function endRound(){
  roundsActive=false;
  const accuracy = shots ? Math.round((hits/shots)*100) : 0;
  setTimeout(()=>alert(`Round ended. Score: ${score}. Accuracy: ${accuracy}%`), 50);
}

function render(){
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0,0,rect.width,rect.height);
  ctx.fillStyle = '#071426'; ctx.fillRect(0,0,rect.width,rect.height);
  // draw targets
  for(const t of targets){
    if(t.hit) continue;
    ctx.beginPath(); ctx.fillStyle = (t.type==='armored' ? '#ffd166' : '#ff6b6b'); ctx.arc(t.x,t.y,t.r,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#ffffff33'; ctx.lineWidth=2; ctx.stroke();
    // crosshair marker on target
    ctx.beginPath(); ctx.strokeStyle='#ffffff80'; ctx.lineWidth=1; ctx.moveTo(t.x-t.r/2,t.y); ctx.lineTo(t.x+t.r/2,t.y); ctx.moveTo(t.x,t.y-t.r/2); ctx.lineTo(t.x,t.y+t.r/2); ctx.stroke();
  }
  // subtle center guide
  ctx.beginPath(); ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.moveTo(rect.width/2-12,rect.height/2); ctx.lineTo(rect.width/2+12,rect.height/2); ctx.moveTo(rect.width/2,rect.height/2-12); ctx.lineTo(rect.width/2,rect.height/2+12); ctx.stroke();
}

/* initial */
bulkSpawn(6);
render();
