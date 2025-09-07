/* Improved platformer:
 - Fixed timestep physics (120Hz) with substeps
 - Coyote time, jump buffering, variable jump height
 - Deterministic seeded RNG for sharing runs
 - Swept AABB (sampled) to avoid tunneling
 - Polished particles, subtle camera shake and easing
 - Fully standalone: no external assets
*/

class RNG { constructor(s=12345){ this.s = (s%2147483647)||1; } next(){ return this.s = (this.s * 16807) % 2147483647; } frac(){ return (this.next()-1) / 2147483646; } }

const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
let W = canvas.width, H = canvas.height;
let best = Number(localStorage.getItem('pulse_best')||0); document.getElementById('best').textContent = best;

const FIXED = 1000/120; // 120Hz physics
let last = performance.now(), acc = 0;
let rng = new RNG(98765);
let seed = Date.now();

const player = {x:140, y:0, w:36, h:36, vy:0, onGround:true, coyote:0, jumpBuffer:0, jumpPower:-820, color:'#ffdd57', groundY: H - 72};
const world = {gravity:2200, baseSpeed:320};
let obstacles = [], particles = [], score=0, running=false, gameOver=false, speedScale=1, cameraShake=0;

function reset(newSeed){
  seed = newSeed || Date.now();
  rng = new RNG(seed);
  obstacles = []; particles = []; score=0; speedScale=1; running=false; gameOver=false;
  player.y = player.groundY; player.vy = 0; player.onGround=true; player.coyote=0; player.jumpBuffer=0;
  spawnInitial();
  document.getElementById('score').textContent = score;
  document.getElementById('centerMsg').style.display = 'none';
}
function spawnInitial(){
  let x = W + 120;
  for(let i=0;i<4;i++){
    const w = 24 + Math.floor(rng.frac()*80), h = 28 + Math.floor(rng.frac()*80);
    obstacles.push({x, w, h, y: player.groundY + player.h - h});
    x += 220 + Math.floor(rng.frac()*160);
  }
}

function spawnObstacle(){
  const lastX = obstacles.length ? obstacles[obstacles.length-1].x : W + 100;
  const gap = 160 + Math.floor(rng.frac()*240);
  const w = 24 + Math.floor(rng.frac()*90);
  const h = 24 + Math.floor(rng.frac()*80);
  obstacles.push({x: Math.max(lastX + gap, W + 60), w, h, y: player.groundY + player.h - h});
}

/* input */
let wantJump=false, jumpHeld=false;
document.addEventListener('keydown', e=>{ if(e.code==='Space'){ wantJump=true; jumpHeld=true; e.preventDefault(); } if(e.code==='KeyR'){ reset(seed); }});
document.addEventListener('keyup', e=>{ if(e.code==='Space'){ jumpHeld=false; }});
canvas.addEventListener('mousedown', ()=>{ wantJump=true; jumpHeld=true; });
canvas.addEventListener('mouseup', ()=>{ jumpHeld=false; });

function step(dt){
  if(gameOver) return;
  // input buffers
  player.coyote = Math.max(0, player.coyote - dt);
  player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
  if(wantJump){ player.jumpBuffer = 0.12; wantJump=false; }

  // spawn
  if(obstacles.length < 6 && (obstacles.length===0 || obstacles[obstacles.length-1].x < W - 160)) spawnObstacle();

  // physics integrator (semi-implicit)
  player.vy += world.gravity * dt;
  player.vy = Math.min(player.vy, 1800);
  player.y += player.vy * dt;

  // ground detection
  if(player.y >= player.groundY){ if(!player.onGround){ player.coyote = 0.12; } player.y = player.groundY; player.vy=0; player.onGround=true; } else { player.onGround=false; }

  // jump logic
  if((player.jumpBuffer > 0) && (player.onGround || player.coyote > 0)){
    doJump();
    player.jumpBuffer = 0;
  }
  if(!jumpHeld && player.vy < 0) player.vy *= 0.55;

  // move obstacles
  for(const ob of obstacles) ob.x -= (world.baseSpeed * speedScale) * dt;
  // collision detection (sampled to avoid tunneling)
  for(const ob of obstacles){
    if(sweptCollision(player,ob,dt)){ die(); return; }
  }
  // remove offscreen
  while(obstacles.length && obstacles[0].x + obstacles[0].w < -80){ obstacles.shift(); score+=10; document.getElementById('score').textContent = score; speedScale += 0.01; }
  // particles
  for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.x += p.vx*dt; p.y += p.vy*dt; p.life -= dt; if(p.life<=0) particles.splice(i,1); }
}
function sweptCollision(p, ob, dt){
  const steps = Math.max(1, Math.ceil(Math.abs(p.vy*dt) / (p.h/2)));
  for(let s=0;s<steps;s++){
    const t = (s+1)/steps;
    const py = p.y + p.vy * dt * t;
    if(p.x < ob.x + ob.w && p.x + p.w > ob.x && py < ob.y + ob.h && py + p.h > ob.y) return true;
  }
  return false;
}
function doJump(){ player.vy = player.jumpPower; player.onGround=false; player.coyote=0; createParticles(player.x+player.w/2, player.y+player.h, 12); }
function die(){ gameOver=true; cameraShake=18; createParticles(player.x+player.w/2, player.y+player.h/2, 40); document.getElementById('centerMsg').style.display='block'; if(score > best){ best = score; localStorage.setItem('pulse_best', best); document.getElementById('best').textContent = best; } }

function createParticles(x,y,n){ for(let i=0;i<n;i++){ particles.push({x,y,vx:(Math.random()*300-150), vy:(-Math.random()*300), life:0.6 + Math.random()*0.8}); } }

/* rendering */
function render(){
  ctx.clearRect(0,0,W,H);
  // camera shake
  const shakeX = (cameraShake>0) ? (Math.random()*cameraShake - cameraShake/2) : 0;
  if(cameraShake>0) cameraShake = Math.max(0, cameraShake - 0.8);

  ctx.save(); ctx.translate(shakeX,0);
  // sky
  const g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#7ec0ff'); g.addColorStop(1,'#3b8cff'); ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  // ground
  ctx.fillStyle = '#0b3b3b'; ctx.fillRect(0, player.groundY + player.h, W, H - (player.groundY + player.h));
  // obstacles
  for(const ob of obstacles){ roundRect(ctx, ob.x, ob.y, ob.w, ob.h, 8); ctx.fillStyle = '#b83b5e'; ctx.fill(); }
  // player
  ctx.fillStyle = player.color; roundRect(ctx, player.x, player.y, player.w, player.h, 8); ctx.fill();
  // particles
  for(const p of particles){ ctx.fillStyle = `rgba(255,255,255,${Math.max(0,p.life)})`; ctx.fillRect(p.x,p.y,3,3); }
  // HUD
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(8,8,140,34); ctx.fillStyle='#fff'; ctx.font='16px Inter'; ctx.fillText(`Score: ${score}`, 16, 30);
  if(gameOver){ ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.font='28px Inter'; ctx.fillText('Game Over', W/2 - 70, H/2 - 10); ctx.font='16px Inter'; ctx.fillText('Click Restart', W/2 - 48, H/2 + 18); }
  ctx.restore();
}

function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }

let runningLoop=false;
function loop(now){
  const frame = Math.min(50, now - last);
  last = now; acc += frame;
  while(acc >= FIXED){
    step(FIXED/1000);
    acc -= FIXED;
  }
  render();
  if(!gameOver) requestAnimationFrame(loop); else runningLoop=false;
}

/* controls */
document.getElementById('start').addEventListener('click', ()=>{ if(!runningLoop){ running=true; gameOver=false; last=performance.now(); requestAnimationFrame(loop); runningLoop=true; }});
document.getElementById('restart').addEventListener('click', ()=>{ reset(seed); last=performance.now(); if(!runningLoop){ requestAnimationFrame(loop); runningLoop=true; }});

/* init */
reset();
render();
