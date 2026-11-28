const HTML_APP = `<html><head><style>
*{box-sizing:border-box}html,body{margin:0;width:100%;background:transparent;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;overflow:hidden}
body{padding:14px}
.card{max-width:320px;margin:0 auto;padding:14px;border-radius:16px;background:linear-gradient(160deg,#0f2027,#203a43,#2c5364);color:#eee;box-shadow:0 6px 18px #0007}
h1{margin:0 0 4px;font-size:16px;text-align:center;letter-spacing:.5px}
.status{margin:0 0 8px;text-align:center;font-size:12px;color:#bcd;min-height:14px}
#c{width:100%;display:block;border-radius:12px;background:#0b1c22;touch-action:none}
.foot{display:flex;justify-content:center;margin-top:10px}
button{padding:8px 18px;border:0;border-radius:20px;background:#3b4252;color:#fff;font-size:13px;font-weight:600}
button:active{transform:scale(.95)}
</style></head><body>
<div class="card">
<h1>🏃 ENDLESS RUNNER</h1>
<div class="status" id="s">Tap the board to jump</div>
<canvas id="c" width="300" height="150"></canvas>
<div class="foot"><button id="r">Restart</button></div>
</div>
<script>(function(){
var cv=document.getElementById('c'),x=cv.getContext('2d'),st=document.getElementById('s');
var W=300,H=150,gy=120,g=.5,running=true,score=0,best=0,speed=4,obs=[],t=0;
var p={x:40,y:gy,vy:0,w:18,h:22};
function reset(){running=true;score=0;speed=4;obs=[];t=0;p.y=gy;p.vy=0;st.textContent='Tap the board to jump'}
function jump(){if(!running){reset();return}if(p.y>=gy){p.vy=-9}}
function spawn(){var h=14+Math.random()*20;obs.push({x:W+10,y:gy+p.h-h,w:14,h:h})}
function step(){
if(running){
t++;
p.vy+=g;p.y+=p.vy;if(p.y>gy){p.y=gy;p.vy=0}
if(t%Math.max(35,70-Math.floor(speed*3))===0)spawn();
speed+=.0025;
score+=speed*.05;
for(var i=obs.length-1;i>=0;i--){
obs[i].x-=speed;
if(obs[i].x+obs[i].w<0){obs.splice(i,1);continue}
if(obs[i].x<p.x+p.w&&obs[i].x+obs[i].w>p.x&&obs[i].y<p.y+p.h&&obs[i].y+obs[i].h>p.y){
running=false;best=Math.max(best,Math.floor(score));st.textContent='Game over — score '+Math.floor(score)+' (best '+best+') — tap to retry'
}
}
}
x.clearRect(0,0,W,H);
x.fillStyle='#0b1c22';x.fillRect(0,0,W,H);
x.strokeStyle='#3b5a63';x.beginPath();x.moveTo(0,gy+p.h);x.lineTo(W,gy+p.h);x.stroke();
x.fillStyle='#5fd0ff';x.fillRect(p.x,p.y,p.w,p.h);
x.fillStyle='#ff8a65';
for(var i=0;i<obs.length;i++)x.fillRect(obs[i].x,obs[i].y,obs[i].w,obs[i].h);
x.fillStyle='#eee';x.font='12px monospace';x.fillText('SCORE '+Math.floor(score),8,16);
requestAnimationFrame(step)
}
cv.addEventListener('pointerdown',jump);
document.getElementById('r').onclick=function(){reset()};
requestAnimationFrame(step);
})();</script>
</body></html>`;

export default {
  name: 'runner',
  aliases: ['run', 'dino'],
  description: 'Play a live endless runner mini-app',
  run: async (context) => {
    const { client, m } = context;
    const sock = client.sock || client;

    try {
      const { sendHtmlView } = await import('../../lib/WABuilder.js');
      await sendHtmlView(sock, m.chat, HTML_APP, { quoted: m });
    } catch (error) {
      console.error(`Runner mini-app failed: ${error.message}`);
      await client.sendMessage(m.chat, { text: `╭─❏ 「 RUNNER 」\n│ Mini-app couldn't render on this client.\n╰───────────────` }).catch(() => {});
    }
  }
};
