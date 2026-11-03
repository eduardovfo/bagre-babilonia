'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const ui=id=>document.getElementById(id);
const protagonist=new Image();
protagonist.src='characters/atletas-realistas.png';
const protagonistFront=new Image();
protagonistFront.src='characters/protagonista.png';
const defenderSprite=new Image();
defenderSprite.src='characters/zagueiro-realista.png';
const scenarios=[
 {name:'01 · GOL ABERTO',kind:'normal',hint:'Gol aberto, sem barreira nem goleiro. Mire e controle a força!',obstacles:[]},
 {name:'02 · BARREIRA COM UM JOGADOR',kind:'normal',hint:'Um jogador fecha o centro. Chute por um dos lados da barreira.',obstacles:[{type:'defender',x:210,y:170,w:28,h:58}]},
 {name:'03 · BARREIRA E GOLEIRO',kind:'normal',keeper:true,hint:'Desvie da barreira! O goleiro escolhe um canto ao sair o chute.',obstacles:[{type:'defender',x:210,y:170,w:28,h:58}]},
 {name:'04 · ZAGUEIRO NA ÁREA',kind:'wind',hint:'O zagueiro fecha o centro. Compense o vento e chute no canto.',obstacles:[{type:'defender',x:210,y:170,w:28,h:58}]},
 {name:'05 · CAMINHO DA GLÓRIA',kind:'normal',hint:'Cones e zagueiro! Encontre uma passagem até o gol.',obstacles:[{type:'cone',x:170,y:230,w:20,h:28},{type:'cone',x:250,y:230,w:20,h:28},{type:'defender',x:210,y:155,w:26,h:54}]}
];
function trajectory(a,p){return {x:210+(a.x-210)*p,y:350+(a.y-350)*p-Math.sin(p*Math.PI)*65};}
function findCollision(a){
 for(let i=1;i<=180;i++){
  const p=i/180,pos=trajectory(a,p),r=8-3.5*p;
  for(const obstacle of currentScenario.obstacles){
   if(pos.x+r>obstacle.x-obstacle.w/2&&pos.x-r<obstacle.x+obstacle.w/2&&pos.y+r>obstacle.y-obstacle.h&&pos.y-r<obstacle.y)return {p,...pos,type:obstacle.type};
  }
 }
 return null;
}
function keeperProgress(){
 if(!shot||(shot.hit&&shot.hit.type!=='keeper'))return 0;
 const elapsed=clock-shot.start-CONTACT_TIME;
 // Wait for the ball to travel, then push off and reach the chosen corner.
 return ease((elapsed-shot.duration*.22)/(shot.duration*.65));
}
function drawKeeper(){
 if(!currentScenario.keeper)return;
 const dive=keeperProgress();
 const side=shot?shot.keeperSide:0;
 if(protagonist.complete&&protagonist.naturalWidth){
  const cellW=protagonist.naturalWidth/4,cellH=protagonist.naturalHeight/2;
  const frame=dive===0?0:dive<.25?1:dive<.70?2:3;
  const h=58,w=h*cellW/cellH;
  ctx.save();ctx.translate(210+side*30*dive,104);if(side<0)ctx.scale(-1,1);
  ctx.drawImage(protagonist,frame*cellW,cellH,cellW,cellH,-w/2,-h*.94,w,h);ctx.restore();return;
 }

 ctx.save();ctx.translate(210+side*45*dive,103-8*Math.sin(dive*Math.PI));ctx.rotate(side*dive*1.1);
 ctx.fillStyle='#16362555';ctx.beginPath();ctx.ellipse(0,0,19,4,0,0,7);ctx.fill();
 line(-4,-10,-7,0,'#273d51',4);line(4,-10,7,0,'#273d51',4);
 ctx.fillStyle='#59b9dc';ctx.fillRect(-8,-30,16,20);
 line(-8,-26,-18,-23-7*dive,'#59b9dc',5);line(8,-26,18,-23-7*dive,'#59b9dc',5);
 ctx.fillStyle='#faf2d9';ctx.beginPath();ctx.arc(-19,-23-7*dive,4,0,7);ctx.arc(19,-23-7*dive,4,0,7);ctx.fill();
 ctx.fillStyle='#d2a17e';ctx.beginPath();ctx.arc(0,-37,7,0,7);ctx.fill();ctx.fillStyle='#27332b';ctx.fillRect(-6,-44,12,4);
 ctx.restore();
}
function drawObstacles(){
 for(const o of currentScenario.obstacles){
  ctx.save();ctx.translate(o.x,o.y);ctx.fillStyle='#18332450';ctx.beginPath();ctx.ellipse(3,3,o.w*.65,5,0,0,7);ctx.fill();
  if(o.type==='cone'){
   ctx.fillStyle='#e67e31';ctx.fillRect(-o.w*.65,-4,o.w*1.3,5);ctx.beginPath();ctx.moveTo(-o.w/2,0);ctx.lineTo(-3,-o.h);ctx.lineTo(3,-o.h);ctx.lineTo(o.w/2,0);ctx.closePath();ctx.fill();
   ctx.fillStyle='#fff3db';ctx.beginPath();ctx.moveTo(-o.w*.32,-o.h*.33);ctx.lineTo(-o.w*.22,-o.h*.55);ctx.lineTo(o.w*.22,-o.h*.55);ctx.lineTo(o.w*.32,-o.h*.33);ctx.closePath();ctx.fill();
  }else if(o.type==='wall'){
   ctx.fillStyle='#e4c568';ctx.fillRect(-o.w/2,-o.h,o.w,o.h-6);ctx.strokeStyle='#846328';ctx.lineWidth=2;ctx.strokeRect(-o.w/2,-o.h,o.w,o.h-6);
   for(let x=-o.w/2+7;x<o.w/2;x+=10)line(x,-o.h+3,x,-9,'#a5813f',2);
   line(-o.w/2,-6,-o.w/2,3,'#29352c',4);line(o.w/2,-6,o.w/2,3,'#29352c',4);
  }else if(defenderSprite.complete&&defenderSprite.naturalWidth){
   const h=o.h*1.04,w=h*defenderSprite.naturalWidth/defenderSprite.naturalHeight;
   ctx.drawImage(defenderSprite,-w/2,-h,w,h);
  }else{
   line(-5,-17,-8,0,'#e5b08b',5);line(5,-17,8,0,'#e5b08b',5);
   ctx.fillStyle='#253953';ctx.fillRect(-10,-24,20,9);ctx.fillStyle='#dd644e';ctx.fillRect(-o.w/2,-o.h+16,o.w,o.h-38);
   line(-o.w/2,-o.h+20,-o.w/2-3,-22,'#e5b08b',4);line(o.w/2,-o.h+20,o.w/2+3,-22,'#e5b08b',4);
   ctx.fillStyle='#e5b08b';ctx.beginPath();ctx.arc(0,-o.h+8,8,0,7);ctx.fill();ctx.fillStyle='#302c27';ctx.fillRect(-7,-o.h,14,5);
  }
  ctx.restore();
 }
}
let round=0,level=1,currentScenario=scenarios[0],goals=0,best=0,state='ready',drag=null,ball={x:210,y:350},shot=null,clock=0,last=0,raf;
try{best=Number(localStorage.getItem('bagre-record'))||0;}catch{}
ui('best').textContent=best;
function buildLevel(number){
 const base=scenarios[Math.min(number-1,scenarios.length-1)];
 const growth=number<=3?1:1+.35*(1-Math.exp(-(number-1)/10));
 const obstacles=base.obstacles.map(o=>({...o,w:o.w*growth}));
 // Higher levels add cones while preserving a verified shooting lane.
 const safeX=number%2?150:270;
 const safeShot={x:safeX,y:87};
 const overlapsLane=o=>{for(let i=1;i<=180;i++){const p=i/180,pos=trajectory(safeShot,p),r=8-3.5*p;if(pos.x+r>o.x-o.w/2&&pos.x-r<o.x+o.w/2&&pos.y+r>o.y-o.h&&pos.y-r<o.y)return true;}return false;};
 for(let i=0;i<Math.min(6,Math.max(0,number-5));i++)obstacles.push({type:'cone',x:155+(i%3)*55,y:155+Math.floor(i/3)*45,w:20*growth,h:28});
 return {...base,obstacles:number<=3?obstacles:obstacles.filter(o=>!overlapsLane(o)),name:`NÍVEL ${number} · ${base.name.split(' · ')[1]}`};
}
function setup(){currentScenario=buildLevel(level);state='ready';drag=null;ball={x:210,y:350};shot=null;ui('round').textContent=level;ui('goals').textContent=goals;ui('level').textContent=currentScenario.name;ui('label').textContent='A CHANCE É SUA';ui('comment').textContent=currentScenario.hint;ui('next').hidden=true;ui('tip').textContent='Cada gol sobe um nível. Errou? Tente o mesmo nível de novo.';ui('power').style.width='0%';}
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*420/r.width,y:(e.clientY-r.top)*450/r.height};}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function aim(dx,dy){
 const power=clamp(-dy/(240+80*(1-Math.exp(-(level-1)/12))),0,1);
 let x=210+dx*1.25,kind=currentScenario.kind;
 if(kind==='post')x+=28;
 if(kind==='wind')x-=35;
 const slip=kind==='laces'&&power>.85;
 if(slip)x=365;
 const result={x:clamp(x,18,402),y:power<.18?255:power>.94?35:87,power,slip};result.hit=findCollision(result);return result;
}
function updateAim(){const a=aim(drag.x-210,drag.y-350);ui('power').style.width=`${a.power*100}%`;ui('power').style.background=a.power>.85?'#ff976a':'#e8ff77';ui('tip').textContent=a.power<.18?'Arraste mais para cima para dar força.':a.hit?'Caminho bloqueado! Ajuste para um dos lados.':a.slip?'Cuidado: o cadarço está solto. Pegue leve!':a.power>.94?'Força demais! Vai por cima.':`Força ${Math.round(a.power*100)}% · solte para chutar`;}
canvas.addEventListener('pointerdown',e=>{if(state!=='ready'||(e.button!==undefined&&e.button!==0))return;const p=point(e);if(Math.hypot(p.x-ball.x,p.y-ball.y)>55)return;drag={x:210,y:350};canvas.setPointerCapture(e.pointerId);updateAim();});
canvas.addEventListener('pointermove',e=>{if(!drag)return;drag=point(e);updateAim();});
canvas.addEventListener('pointerup',e=>{if(!drag)return;const end=point(e),dx=end.x-210,dy=end.y-350;drag=null;if(dy>-20){ui('tip').textContent='Leve a bola PARA CIMA, em direção ao gol, e solte.';ui('power').style.width='0%';return;}kick(dx,dy);});
canvas.addEventListener('pointercancel',()=>{drag=null;ui('power').style.width='0%';});
document.addEventListener('keydown',e=>{if(e.code==='Space'&&e.target.tagName!=='BUTTON'){e.preventDefault();if(state==='ready')kick(0,-150);else if(state==='done')ui('next').click();}});
function kick(dx,dy){const a=aim(dx,dy);let gag='';
 if(a.slip)gag='Pisou no próprio cadarço e caiu no chute. Era só amarrar a chuteira!';
 else if(a.power>.94)gag='Isolou! A bola agora pertence ao estacionamento.';
 else if(a.power<.18)gag='Chutou tão fraco que a formiga pediu passagem.';
 else if(a.x<=132||a.x>=288)gag='A mira avisou. A canela confirmou: para fora!';
 if(a.hit)gag=a.hit.type==='cone'?'Acertou o cone! Ele nem estava se mexendo.':a.hit.type==='wall'?'A barreira venceu. Nem precisou de goleiro.':'O zagueiro bloqueou! Tente o outro canto.';
 // The keeper commits independently of the aim, once per shot.
 const keeperSide=currentScenario.keeper?(Math.random()<.5?-1:1):0;
 const onTarget=a.x>132&&a.x<288&&a.power>=.18&&a.power<=.94;
 if(keeperSide&&!a.hit&&onTarget&&Math.abs(a.x-(210+keeperSide*45))<=45){
  const p=.96;a.hit={p,...trajectory(a,p),type:'keeper'};gag='O goleiro escolheu esse canto e defendeu! Tente o outro lado.';
 }
 const goal=!a.hit&&a.x>132&&a.x<288&&a.power>=.18&&a.power<=.94;
 shot={...a,keeperSide,goal,gag,start:clock,duration:1.35-a.power*.5};state='flying';ui('tip').textContent='Lá vai o craque…';}
function finish(){
 if(state==='done')return;
 shot.finished=clock;state='done';
 if(shot.goal){goals++;level++;best=Math.max(best,goals);try{localStorage.setItem('bagre-record',String(best));}catch{}}
 ui('goals').textContent=goals;ui('best').textContent=best;
 ui('round').textContent=level;
 ui('label').textContent=shot.goal?`GOL! NÍVEL ${level} DESBLOQUEADO`:'QUASE! TENTE DE NOVO';
 ui('comment').textContent=shot.goal?'Entrou! Agora os obstáculos ficam mais difíceis e o chute exige mais força.':shot.gag||'Passou fora! Ajuste a mira e tente novamente.';
 ui('tip').textContent=shot.goal?`Próximo desafio: nível ${level}.`:`Você continua no nível ${level}.`;
 ui('next').textContent=shot.goal?'PRÓXIMO NÍVEL →':'TENTAR NOVAMENTE ↻';ui('next').hidden=false;
}
ui('next').addEventListener('click',()=>{if(state!=='done')return;round++;setup();});
function line(x,y,a,b,color='#dcebc2',width=2){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.moveTo(x,y);ctx.lineTo(a,b);ctx.stroke();}
// Animation uses a shared contact time so foot swing and ball launch stay in sync.
const CONTACT_TIME=.38;
const ease=v=>{v=clamp(v,0,1);return v*v*(3-2*v);};
function characterPose(){
 const pose={x:0,y:0,angle:Math.sin(clock*1.8)*.004,sx:1,sy:1,left:0,right:0,knee:0};
 if(state==='ready'){
  pose.y=-Math.sin(clock*2.2)*.4;
  if(drag){const charge=aim(drag.x-210,drag.y-350).power;pose.angle=-.035*charge;pose.right=-.12*charge;pose.knee=.15*charge;pose.x=-1.5*charge;}
 }else if(shot){
  const t=clock-shot.start;
  const windup=ease(t/.22),swing=ease((t-.22)/.16),settle=ease((t-.42)/.48);
  // Weight shifts onto the supporting leg, then the knee extends at contact.
  pose.x=0;
  pose.angle=0;
  pose.y=0;
  pose.right=.30*windup-.85*swing+.55*settle;
  pose.knee=.65*windup-.53*swing-.12*settle;
  pose.left=-.035*swing+.035*settle;
  if(shot.slip){const fall=ease((t-.2)/.55);pose.x=12+32*fall;pose.y=29*fall;pose.angle=-1.5*fall;pose.right=-.7*fall;pose.left=.6*fall;}
  else if(state==='done'){
   const reaction=clock-shot.finished;
   if(shot.goal){const bounce=Math.max(0,Math.sin(reaction*7))*Math.exp(-reaction*1.5);pose.y=-5*bounce;pose.angle=Math.sin(reaction*5)*.025*Math.exp(-reaction);pose.left=-.06*bounce;pose.right=.08*bounce;pose.knee=.08*bounce;}
   else{const slump=ease(reaction/.45);pose.angle=.07*slump;pose.y=1.5*slump;pose.right=0;pose.left=0;pose.knee=0;}
  }
 }
 return pose;
}
function person(x,y){
 const pose=characterPose();
 ctx.fillStyle='#16362545';ctx.beginPath();ctx.ellipse(x+pose.x,y+25,27,7,0,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.translate(x+pose.x,y+25+pose.y);ctx.rotate(pose.angle);ctx.scale(pose.sx,pose.sy);
 const waiting=state==='ready'&&!drag;
 if(waiting&&protagonistFront.complete&&protagonistFront.naturalWidth){
  const h=120,w=h*protagonistFront.naturalWidth/protagonistFront.naturalHeight;
  // Keep the left supporting boot at the same ground position in both views.
  ctx.drawImage(protagonistFront,-w*.20,-h*.973,w,h);
 }else if(protagonist.complete&&protagonist.naturalWidth){
  const iw=protagonist.naturalWidth,ih=protagonist.naturalHeight/2,cell=iw/4;
  const elapsed=shot?clock-shot.start:0;
  let frame=0;
  if(state==='flying')frame=elapsed<.12?0:elapsed<CONTACT_TIME?1:elapsed<CONTACT_TIME+.14?2:elapsed<.82?3:elapsed<1?2:0;
  else if(drag)frame=1;
  // Align the planted left boot across the four independently illustrated poses.
  const anchors=[.40,.40,.415,.415];
  const h=120,scale=h/ih,w=cell*scale;
  ctx.drawImage(protagonist,frame*cell,0,cell,ih,-w*anchors[frame],-h*.973,w,h);
 }else{
  ctx.fillStyle='#171e20';ctx.fillRect(-10,-90,20,52);
  line(-5,-38,-10+Math.sin(pose.left)*28,0,'#edbc8b',6);
  line(5,-38,10+Math.sin(pose.right)*28,0,'#edbc8b',6);
  ctx.fillStyle='#edbc8b';ctx.beginPath();ctx.arc(0,-102,10,0,7);ctx.fill();
 }
 ctx.restore();
 if(shot){const t=clock-shot.start-CONTACT_TIME;
  if(t>=0&&t<.18){const p=t/.18;ctx.fillStyle=`rgba(206,192,154,${(1-p)*.32})`;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(207+(i-1.5)*(3+p*9),358-p*4,1+p*2,0,7);ctx.fill();}}
  if(state==='done'){const age=clock-shot.finished;if(age<1.6){ctx.globalAlpha=Math.min(1,(1.6-age)*2);ctx.fillStyle=shot.goal?'#e8ff77':'#fff0de';ctx.font='bold 17px system-ui';ctx.textAlign='center';ctx.fillText(shot.goal?'EU SOU CRAQUE!':shot.slip?'OPA!':'FOI O VENTO…',x+pose.x,211-age*10);ctx.textAlign='start';ctx.globalAlpha=1;}}
 }
}
function drawTrionda(x,y,r,rotation){
 ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.clip();
 ctx.fillStyle='#fffdf4';ctx.fillRect(-r,-r,r*2,r*2);
 ['#dc343e','#138157','#2579c8'].forEach((color,i)=>{ctx.save();ctx.rotate(i*Math.PI*2/3);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-r*.13,-r*.1);ctx.bezierCurveTo(-r*.95,-r*.6,r*.05,-r*1.3,r*.8,-r*.88);ctx.bezierCurveTo(r*.25,-r*.65,r*.8,-r*.05,r*.32,r*.4);ctx.bezierCurveTo(r*.38,-r*.18,r*.02,-r*.5,-r*.13,-r*.1);ctx.fill();ctx.strokeStyle='#c9a24a';ctx.lineWidth=.8;ctx.stroke();ctx.restore();});
 ctx.fillStyle='#26332c';ctx.font=`bold ${r*.26}px system-ui`;ctx.textAlign='center';ctx.fillText('TRIONDA',0,r*.15);
 const shine=ctx.createRadialGradient(-r*.35,-r*.4,0,0,0,r);shine.addColorStop(0,'#ffffff60');shine.addColorStop(.65,'#ffffff00');shine.addColorStop(1,'#061c3340');ctx.fillStyle=shine;ctx.fillRect(-r,-r,r*2,r*2);ctx.restore();
}
function draw(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;clock+=dt;ctx.clearRect(0,0,420,450);for(let i=0;i<9;i++){ctx.fillStyle=i%2?'#477d53':'#40754c';ctx.fillRect(0,i*50,420,50);}ctx.fillStyle='#263e30';ctx.fillRect(0,0,420,55);for(let i=0;i<32;i++){ctx.fillStyle=['#e8ff77','#aeb99d','#d39568'][i%3];ctx.beginPath();ctx.arc(i*14+5,25+Math.sin(i*7)*8,3,0,7);ctx.fill();}ctx.strokeStyle='#c8dfb18c';ctx.lineWidth=2;ctx.strokeRect(22,95,376,380);ctx.strokeRect(80,95,260,110);ctx.strokeRect(135,95,150,50);ctx.beginPath();ctx.arc(210,205,55,0,Math.PI);ctx.stroke();ctx.fillStyle='#183d2dcc';ctx.fillRect(120,61,180,42);for(let x=120;x<=300;x+=12)line(x,62,x,101,'#93b29b60',1);for(let y=65;y<=100;y+=10)line(120,y,300,y,'#93b29b60',1);line(120,103,120,60,'#f8f4df',5);line(120,60,300,60,'#f8f4df',5);line(300,60,300,103,'#f8f4df',5);
if(currentScenario.kind==='laces'&&state==='ready'){line(173,363,164,369,'#f8f4df',1.5);line(164,369,155,365,'#f8f4df',1.5);line(173,363,177,371,'#f8f4df',1.5);}if(currentScenario.kind==='wind'){ctx.fillStyle='#e8ff77';ctx.font='bold 17px sans-serif';ctx.fillText('← ← ←',315,180);}
drawKeeper();
drawObstacles();
// The supporting foot is behind and to the left of the ball.
// Render the actor after the ball so the raised boot keeps correct depth.
if(state==='flying'){let p=clamp((clock-shot.start-CONTACT_TIME)/shot.duration,0,1);if(shot.hit&&p>=shot.hit.p){const rebound=clamp((p-shot.hit.p)/.22,0,1);ball.x=shot.hit.x+(shot.hit.x<210?-12:12)*rebound;ball.y=shot.hit.y+28*rebound;if(rebound>=1||p>=1)finish();}else{Object.assign(ball,trajectory(shot,p));if(p>=1)finish();}}
if(drag){const a=aim(drag.x-210,drag.y-350);const color=a.hit||a.power<.18||a.power>.94||a.x<=132||a.x>=288?'#ff976a':'#e8ff77';ctx.setLineDash([5,8]);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(210,350);for(let i=1;i<=30;i++){const p=i/30*(a.hit?a.hit.p:1),pos=trajectory(a,p);ctx.lineTo(pos.x,pos.y);}ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle=color;ctx.beginPath();const target=a.hit||a;ctx.arc(target.x,target.y,13,0,7);ctx.stroke();line(target.x-19,target.y,target.x+19,target.y,color);line(target.x,target.y-19,target.x,target.y+19,color);}
if(state==='ready'&&!drag){ctx.strokeStyle='#e8ff7770';ctx.lineWidth=2;ctx.beginPath();ctx.arc(210,350,24+Math.sin(clock*3)*2,0,7);ctx.stroke();ctx.fillStyle='#f8f4df';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText('ARRASTE PARA O GOL ↑',210,403);ctx.textAlign='start';}
const flight=shot?clamp((clock-shot.start-CONTACT_TIME)/shot.duration,0,1):0;const radius=8-3.5*flight;const lift=Math.sin(flight*Math.PI)*65;ctx.fillStyle='#102c2938';ctx.beginPath();ctx.ellipse(ball.x+1,ball.y+lift+radius*.6,radius*(1-.3*Math.sin(flight*Math.PI)),radius*.32,0,0,7);ctx.fill();drawTrionda(ball.x,ball.y,radius,state==='flying'?Math.max(0,clock-shot.start-CONTACT_TIME)*9:0);person(165,365);raf=requestAnimationFrame(draw);}
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else{last=performance.now();raf=requestAnimationFrame(draw);}});
setup();raf=requestAnimationFrame(draw);
