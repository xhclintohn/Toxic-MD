const HTML_APP = `<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}html,body{margin:0;width:100%;background:transparent;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;overflow:hidden}
body{padding:12px}
.card{max-width:340px;margin:0 auto;padding:14px;border-radius:18px;background:linear-gradient(160deg,#080b16,#101a33 55%,#0a1020);color:#e8f6ff;box-shadow:0 8px 26px #000a,0 0 0 1px #23f7ff22 inset;position:relative}
h1{margin:0 0 2px;font-size:15px;text-align:center;letter-spacing:2px;color:#23f7ff;text-shadow:0 0 8px #23f7ff88}
.status{margin:4px 0 10px;text-align:center;font-size:12px;color:#9fd8ff;min-height:15px;text-shadow:0 0 6px #23f7ff44}
.board{display:grid;grid-template-columns:repeat(8,1fr);border-radius:12px;overflow:hidden;border:1px solid #23f7ff44;box-shadow:0 0 18px #23f7ff33}
.sq{position:relative;width:100%;padding-top:100%;background:#101c33}
.sq.dark{background:#0a1224}
.sq span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1;user-select:none}
.sq.w span{color:#f4fdff;text-shadow:0 0 7px #7ff0ff,0 0 2px #000}
.sq.b span{color:#ff56d0;text-shadow:0 0 8px #ff56d0aa,0 0 2px #000}
.sq.sel{box-shadow:0 0 0 2px #23f7ff inset;background:#16324d}
.sq.mv:after{content:'';position:absolute;left:50%;top:50%;width:26%;height:26%;transform:translate(-50%,-50%);border-radius:50%;background:#23f7ffaa;box-shadow:0 0 10px #23f7ff}
.sq.cap:after{content:'';position:absolute;inset:8%;border-radius:50%;border:2px solid #ff56d0cc;background:transparent;box-shadow:0 0 10px #ff56d066;width:auto;height:auto;transform:none;left:auto;top:auto}
.sq.chk{background:#4a0f2a;box-shadow:0 0 0 2px #ff2e63 inset}
.sq.last{box-shadow:0 0 0 2px #b479ff88 inset}
.bar{display:flex;gap:6px;justify-content:center;margin-top:10px;flex-wrap:wrap}
button{padding:7px 13px;border:0;border-radius:16px;background:#16233f;color:#bfefff;font-size:12px;font-weight:600;border:1px solid #23f7ff44}
button:active{transform:scale(.95)}
.info{margin-top:8px;font-size:11px;color:#7fa8c9;text-align:center;min-height:14px;word-break:break-word}
.ov{position:absolute;inset:0;border-radius:18px;background:#050912ee;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;z-index:5}
.ov h2{margin:0;font-size:14px;color:#23f7ff;letter-spacing:2px;text-shadow:0 0 8px #23f7ff88}
.ov p{margin:0;font-size:12px;color:#9fd8ff}
.ov .row{display:flex;gap:10px}
.ov button{padding:9px 18px;font-size:13px}
.hide{display:none}
</style></head><body>
<div class="card">
<h1>NEON CHESS</h1>
<div class="status" id="st">Choose your side</div>
<div class="board" id="bd"></div>
<div class="bar">
<button id="nw">New</button>
<button id="un">Undo</button>
<button id="fl">Flip</button>
</div>
<div class="info" id="inf"></div>
<div class="ov" id="ov">
<h2>PICK A SIDE</h2>
<p>Play against the machine</p>
<div class="row"><button id="pw">White</button><button id="pb">Black</button></div>
</div>
</div>
<script>(function(){
var GLYPH={P:'\u2659',N:'\u2658',B:'\u2657',R:'\u2656',Q:'\u2655',K:'\u2654',p:'\u265F',n:'\u265E',b:'\u265D',r:'\u265C',q:'\u265B',k:'\u265A'};
var VAL={p:100,n:320,b:330,r:500,q:900,k:20000};
var PST={
p:[0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0],
n:[-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
b:[-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
r:[0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0],
q:[-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],
k:[-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20]
};
var START='rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR';
var bd=document.getElementById('bd'),st=document.getElementById('st'),inf=document.getElementById('inf'),ov=document.getElementById('ov');
var S={},human='w',flip=false,sel=-1,moves=[],busy=false,hist=[],over=false;
var cells=[];
for(var i=0;i<64;i++){var d=document.createElement('div');d.className='sq';var sp=document.createElement('span');d.appendChild(sp);bd.appendChild(d);cells.push(d);(function(idx){d.addEventListener('click',function(){tap(idx)})})(i)}

function isW(c){return c!=='.'&&c===c.toUpperCase()}
function isB(c){return c!=='.'&&c===c.toLowerCase()}
function side(c){return c==='.'?null:(isW(c)?'w':'b')}
function clone(s){return{b:s.b.slice(),t:s.t,c:{K:s.c.K,Q:s.c.Q,k:s.c.k,q:s.c.q},ep:s.ep,hm:s.hm,fm:s.fm}}
function fresh(){return{b:START.split(''),t:'w',c:{K:true,Q:true,k:true,q:true},ep:-1,hm:0,fm:1}}

function findKing(s,t){var k=t==='w'?'K':'k';for(var i=0;i<64;i++){if(s.b[i]===k)return i}return -1}

function attacked(s,sq,by){
var b=s.b,r=sq>>3,f=sq&7,i,rr,ff;
var pd=by==='w'?1:-1;
for(var df=-1;df<=1;df+=2){rr=r+pd;ff=f+df;if(rr>=0&&rr<8&&ff>=0&&ff<8){var pc=b[rr*8+ff];if(pc===(by==='w'?'P':'p'))return true}}
var nd=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
for(i=0;i<8;i++){rr=r+nd[i][0];ff=f+nd[i][1];if(rr<0||rr>7||ff<0||ff>7)continue;var n=b[rr*8+ff];if(n===(by==='w'?'N':'n'))return true}
var kd=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
for(i=0;i<8;i++){rr=r+kd[i][0];ff=f+kd[i][1];if(rr<0||rr>7||ff<0||ff>7)continue;var kk=b[rr*8+ff];if(kk===(by==='w'?'K':'k'))return true}
var dirs=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
for(i=0;i<8;i++){
var dr=dirs[i][0],dfx=dirs[i][1],diag=dr!==0&&dfx!==0;rr=r+dr;ff=f+dfx;
while(rr>=0&&rr<8&&ff>=0&&ff<8){
var p=b[rr*8+ff];
if(p!=='.'){
if(side(p)===by){var lp=p.toLowerCase();if(lp==='q')return true;if(diag&&lp==='b')return true;if(!diag&&lp==='r')return true}
break}
rr+=dr;ff+=dfx}}
return false}

function inCheck(s,t){var k=findKing(s,t);if(k<0)return false;return attacked(s,k,t==='w'?'b':'w')}

function push(list,s,from,to,pr,flag){list.push({f:from,t:to,p:pr||'',x:flag||''})}

function pseudo(s){
var out=[],b=s.b,t=s.t,i;
for(i=0;i<64;i++){
var pc=b[i];if(pc==='.'||side(pc)!==t)continue;
var r=i>>3,f=i&7,lp=pc.toLowerCase();
if(lp==='p'){
var d=t==='w'?-1:1,st1=t==='w'?6:1,last=t==='w'?0:7;
var one=(r+d)*8+f;
if(r+d>=0&&r+d<8&&b[one]==='.'){
if(r+d===last){push(out,s,i,one,'q');push(out,s,i,one,'r');push(out,s,i,one,'b');push(out,s,i,one,'n')}else push(out,s,i,one);
var two=(r+2*d)*8+f;
if(r===st1&&b[two]==='.')push(out,s,i,two,'','dp')}
for(var dd=-1;dd<=1;dd+=2){
var cf=f+dd,cr=r+d;if(cf<0||cf>7||cr<0||cr>7)continue;
var ci=cr*8+cf,tp=b[ci];
if(tp!=='.'&&side(tp)!==t){if(cr===last){push(out,s,i,ci,'q');push(out,s,i,ci,'r');push(out,s,i,ci,'b');push(out,s,i,ci,'n')}else push(out,s,i,ci)}
else if(ci===s.ep&&s.ep>=0)push(out,s,i,ci,'','ep')}
continue}
if(lp==='n'){
var nd2=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
for(var j=0;j<8;j++){var nr=r+nd2[j][0],nf=f+nd2[j][1];if(nr<0||nr>7||nf<0||nf>7)continue;var ni=nr*8+nf;if(b[ni]==='.'||side(b[ni])!==t)push(out,s,i,ni)}
continue}
if(lp==='k'){
var kd2=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
for(var k2=0;k2<8;k2++){var kr=r+kd2[k2][0],kf=f+kd2[k2][1];if(kr<0||kr>7||kf<0||kf>7)continue;var ki=kr*8+kf;if(b[ki]==='.'||side(b[ki])!==t)push(out,s,i,ki)}
if(t==='w'&&i===60){
if(s.c.K&&b[61]==='.'&&b[62]==='.'&&b[63]==='R'&&!attacked(s,60,'b')&&!attacked(s,61,'b')&&!attacked(s,62,'b'))push(out,s,60,62,'','ck');
if(s.c.Q&&b[59]==='.'&&b[58]==='.'&&b[57]==='.'&&b[56]==='R'&&!attacked(s,60,'b')&&!attacked(s,59,'b')&&!attacked(s,58,'b'))push(out,s,60,58,'','cq')}
if(t==='b'&&i===4){
if(s.c.k&&b[5]==='.'&&b[6]==='.'&&b[7]==='r'&&!attacked(s,4,'w')&&!attacked(s,5,'w')&&!attacked(s,6,'w'))push(out,s,4,6,'','ck');
if(s.c.q&&b[3]==='.'&&b[2]==='.'&&b[1]==='.'&&b[0]==='r'&&!attacked(s,4,'w')&&!attacked(s,3,'w')&&!attacked(s,2,'w'))push(out,s,4,2,'','cq')}
continue}
var rays=lp==='b'?[[-1,-1],[-1,1],[1,-1],[1,1]]:lp==='r'?[[-1,0],[1,0],[0,-1],[0,1]]:[[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]];
for(var q=0;q<rays.length;q++){
var rr2=r+rays[q][0],ff2=f+rays[q][1];
while(rr2>=0&&rr2<8&&ff2>=0&&ff2<8){
var idx2=rr2*8+ff2,tp2=b[idx2];
if(tp2==='.'){push(out,s,i,idx2)}
else{if(side(tp2)!==t)push(out,s,i,idx2);break}
rr2+=rays[q][0];ff2+=rays[q][1]}}}
return out}

function apply(s,mv){
var n=clone(s),b=n.b,pc=b[mv.f],lp=pc.toLowerCase(),t=n.t;
n.ep=-1;
if(lp==='p'||b[mv.t]!=='.')n.hm=0;else n.hm=n.hm+1;
b[mv.t]=pc;b[mv.f]='.';
if(mv.x==='ep'){var cap=t==='w'?mv.t+8:mv.t-8;b[cap]='.'}
if(mv.x==='dp')n.ep=t==='w'?mv.f-8:mv.f+8;
if(mv.p)b[mv.t]=t==='w'?mv.p.toUpperCase():mv.p;
if(mv.x==='ck'){if(t==='w'){b[61]='R';b[63]='.'}else{b[5]='r';b[7]='.'}}
if(mv.x==='cq'){if(t==='w'){b[59]='R';b[56]='.'}else{b[3]='r';b[0]='.'}}
if(pc==='K'){n.c.K=false;n.c.Q=false}
if(pc==='k'){n.c.k=false;n.c.q=false}
if(mv.f===63||mv.t===63)n.c.K=false;
if(mv.f===56||mv.t===56)n.c.Q=false;
if(mv.f===7||mv.t===7)n.c.k=false;
if(mv.f===0||mv.t===0)n.c.q=false;
n.t=t==='w'?'b':'w';
if(t==='b')n.fm=n.fm+1;
return n}

function legal(s){
var out=[],ps=pseudo(s);
for(var i=0;i<ps.length;i++){var nx=apply(s,ps[i]);if(!inCheck(nx,s.t))out.push(ps[i])}
return out}

function evaluate(s){
var sc=0;
for(var i=0;i<64;i++){
var pc=s.b[i];if(pc==='.')continue;
var lp=pc.toLowerCase(),w=isW(pc),idx=w?i:(56-(i&56)+(i&7));
var v=VAL[lp]+(PST[lp]?PST[lp][idx]:0);
sc+=w?v:-v}
return sc}

function search(s,depth,alpha,beta){
if(depth===0)return evaluate(s);
var ms=legal(s);
if(ms.length===0){if(inCheck(s,s.t))return s.t==='w'?-99999+depth:99999-depth;return 0}
ms.sort(function(a,b){var ca=s.b[b.t]!=='.'?VAL[s.b[b.t].toLowerCase()]:0,cb=s.b[a.t]!=='.'?VAL[s.b[a.t].toLowerCase()]:0;return ca-cb});
var i,val;
if(s.t==='w'){
val=-1e9;
for(i=0;i<ms.length;i++){val=Math.max(val,search(apply(s,ms[i]),depth-1,alpha,beta));alpha=Math.max(alpha,val);if(beta<=alpha)break}
return val}
val=1e9;
for(i=0;i<ms.length;i++){val=Math.min(val,search(apply(s,ms[i]),depth-1,alpha,beta));beta=Math.min(beta,val);if(beta<=alpha)break}
return val}

function best(s){
var ms=legal(s);
if(!ms.length)return null;
var depth=ms.length>28?2:3,bestVal=s.t==='w'?-1e9:1e9,pick=[];
for(var i=0;i<ms.length;i++){
var v=search(apply(s,ms[i]),depth-1,-1e9,1e9);
if(s.t==='w'){if(v>bestVal){bestVal=v;pick=[ms[i]]}else if(v===bestVal)pick.push(ms[i])}
else{if(v<bestVal){bestVal=v;pick=[ms[i]]}else if(v===bestVal)pick.push(ms[i])}}
return pick[Math.floor(Math.random()*pick.length)]}

function coord(i){return 'abcdefgh'[i&7]+(8-(i>>3))}

function draw(){
var lastMv=hist.length?hist[hist.length-1].mv:null;
var kSq=inCheck(S,S.t)?findKing(S,S.t):-1;
for(var v=0;v<64;v++){
var i=flip?63-v:v,pc=S.b[i],c=cells[v],sp=c.firstChild;
var cls='sq'+(((i>>3)+(i&7))%2?' dark':'');
if(pc!=='.')cls+=isW(pc)?' w':' b';
if(i===sel)cls+=' sel';
if(i===kSq)cls+=' chk';
if(lastMv&&(i===lastMv.f||i===lastMv.t))cls+=' last';
for(var q=0;q<moves.length;q++){if(moves[q].t===i){cls+=(S.b[i]!=='.'||moves[q].x==='ep')?' cap':' mv';break}}
c.className=cls;
sp.textContent=pc==='.'?'':GLYPH[pc]}}

function status(){
if(over)return;
var ms=legal(S);
if(!ms.length){
over=true;
if(inCheck(S,S.t))st.textContent=(S.t==='w'?'Black':'White')+' wins by checkmate';
else st.textContent='Stalemate — draw';
return}
if(S.hm>=100){over=true;st.textContent='Draw by fifty-move rule';return}
var who=S.t===human?'Your move':'Thinking...';
st.textContent=who+(inCheck(S,S.t)?' — check!':'')}

function history(){
var out=[];
for(var i=0;i<hist.length;i++){var h=hist[i];out.push(coord(h.mv.f)+coord(h.mv.t)+(h.mv.p||''))}
inf.textContent=out.slice(-8).join('  ')}

function bot(){
if(over)return;
busy=true;
setTimeout(function(){
var mv=best(S);
if(mv){hist.push({s:clone(S),mv:mv});S=apply(S,mv)}
busy=false;sel=-1;moves=[];
draw();status();history()},180)}

function tap(v){
if(busy||over)return;
var i=flip?63-v:v;
if(S.t!==human)return;
if(sel>=0){
var chosen=null;
for(var q=0;q<moves.length;q++){if(moves[q].t===i){chosen=moves[q];break}}
if(chosen){
if(chosen.p){
var picks=[];
for(var z=0;z<moves.length;z++)if(moves[z].t===i&&moves[z].p)picks.push(moves[z]);
var want=prompt('Promote to (q, r, b, n)','q');
want=(want||'q').toLowerCase();
for(var y=0;y<picks.length;y++)if(picks[y].p===want)chosen=picks[y]}
hist.push({s:clone(S),mv:chosen});
S=apply(S,chosen);
sel=-1;moves=[];
draw();status();history();
if(!over)bot();
return}
if(S.b[i]!=='.'&&side(S.b[i])===S.t){sel=i;moves=legal(S).filter(function(mm){return mm.f===i})}
else{sel=-1;moves=[]}
draw();return}
if(S.b[i]!=='.'&&side(S.b[i])===S.t){sel=i;moves=legal(S).filter(function(mm){return mm.f===i});draw()}}

function start(color){
human=color;flip=color==='b';
S=fresh();sel=-1;moves=[];hist=[];over=false;busy=false;
ov.className='ov hide';
draw();status();history();
if(human==='b')bot()}

document.getElementById('pw').addEventListener('click',function(){start('w')});
document.getElementById('pb').addEventListener('click',function(){start('b')});
document.getElementById('nw').addEventListener('click',function(){ov.className='ov';st.textContent='Choose your side'});
document.getElementById('fl').addEventListener('click',function(){flip=!flip;draw()});
document.getElementById('un').addEventListener('click',function(){
if(busy||!hist.length)return;
over=false;
var back=hist.pop();
S=back.s;
if(S.t!==human&&hist.length){var b2=hist.pop();S=b2.s}
sel=-1;moves=[];draw();status();history()});

S=fresh();draw();
})();</script>
</body></html>`;

export default {
  name: 'chess',
  aliases: ['chessgame', 'neonchess'],
  description: 'Play a live neon chess mini-app against the bot',
  run: async (context) => {
    const { client, m } = context;
    const sock = client.sock || client;

    try {
      const { sendHtmlView } = await import('../../lib/WABuilder.js');
      await sendHtmlView(sock, m.chat, HTML_APP, { quoted: m });
    } catch (error) {
      await client.sendMessage(m.chat, { text: `\u256d\u2500\u274f \u300c CHESS \u300d\n\u2502 Mini-app couldn't render on this client.\n\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500` }).catch(() => {});
    }
  }
};
