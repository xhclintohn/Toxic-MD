const games = new Map();

const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

// FIX #1: this was previously `[, [3,4,5], [6,7,8], , [1,4,7], [2,5,8], , [2,4,6]]`
// Those leading commas create *holes* in the array (top row, left column and the
// main diagonal were silently missing), AND a `for...of` loop over a sparse array
// does not skip holes — it yields `undefined` for them. Destructuring
// `const [a, b, c] of winCombos` on an `undefined` entry throws
// "undefined is not iterable", which crashed checkWinner() on every single move.
// That's why the game "broke" as soon as you played — not just the link issue.
const winCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

function checkWinner(board) {
  for (const combo of winCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function isFull(board) {
  return board.every(cell => cell !== null);
}

function pickBotMove(board) {
  for (const i of emptyIndexes(board)) {
    const copy = [...board];
    copy[i] = 'O';
    if (checkWinner(copy) === 'O') return i;
  }
  for (const i of emptyIndexes(board)) {
    const copy = [...board];
    copy[i] = 'X';
    if (checkWinner(copy) === 'X') return i;
  }
  if (board[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter(i => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  const empties = emptyIndexes(board);
  return empties[Math.floor(Math.random() * empties.length)];
}

function emptyIndexes(board) {
  return board.reduce((acc, cell, i) => { if (cell === null) acc.push(i); return acc; }, []);
}

function renderBoard(board) {
  const cell = i => board[i] === 'X' ? '❌' : board[i] === 'O' ? '⭕' : numberEmojis[i];
  return [0, 3, 6].map(r => [0, 1, 2].map(c => cell(r + c)).join(' ')).join('\n');
}

// NOTE: superseded as the primary path — see sendHtmlView / HTML_APP below,
// which renders a real live, tappable board inside the bubble via the
// FOAHtmlPrimitiveDemoDONOTUSE primitive. That primitive is undocumented and
// can stop working on any WhatsApp update, so this link-based flow is kept as
// an automatic fallback: if the HTML mini-app fails to send, the bot drops
// back to this. `[label](!prefix ttt 1)` was never a real URL, so tapping it
// did nothing — swapped for genuine `https://wa.me/<bot>?text=...` deep links,
// which open a prefilled reply that the user just has to send.
function buildMoveLink(botNumber, prefix, label, command) {
  const digits = String(botNumber || '').split('@')[0].split(':')[0].replace(/\D/g, '');
  const text = encodeURIComponent(`${prefix}${command}`);
  return digits
    ? `[${label}](https://wa.me/${digits}?text=${text})`
    : label; // no bot number resolved yet — fall back to plain text, not a dead link
}

// Fully self-contained live mini-app: no server round trip needed. The board,
// win/draw detection, and the bot opponent (perfect-play minimax, so it can
// never actually lose — only win or draw) all run client-side inside the
// sandboxed WebView. Kept intentionally tiny (~3.4KB) since payloads much
// larger than that risk silently failing to render.
const HTML_APP = `<html><head><style>
*{box-sizing:border-box}html,body{margin:0;width:100%;background:transparent;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;overflow:hidden}
body{padding:14px}
.card{max-width:320px;margin:0 auto;padding:14px;border-radius:16px;background:linear-gradient(160deg,#1b1f2a,#0e1016);color:#eee;box-shadow:0 6px 18px #0007}
h1{margin:0 0 4px;font-size:17px;text-align:center;letter-spacing:.5px}
.status{margin:0 0 12px;text-align:center;font-size:13px;color:#9aa4b2;min-height:16px}
.board{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.cell{aspect-ratio:1;border:0;border-radius:12px;background:#242938;color:#fff;font-size:30px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:transform .12s}
.cell:active{transform:scale(.93)}
.cell[disabled]{opacity:.6}
.cell.x{color:#5fd0ff}
.cell.o{color:#ff8a65}
.cell.win{background:#2e7d4f}
.foot{display:flex;justify-content:center;margin-top:12px}
button.restart{padding:8px 18px;border:0;border-radius:20px;background:#3b4252;color:#fff;font-size:13px;font-weight:600}
button.restart:active{transform:scale(.95)}
</style></head><body>
<div class="card">
  <h1>❌⭕ TIC TAC TOE</h1>
  <div class="status" id="status">Your turn — you're X</div>
  <div class="board" id="board"></div>
  <div class="foot"><button class="restart" id="restart">Restart</button></div>
</div>
<script>(function(){
var board=Array(9).fill(null),over=false;
var wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
var boardEl=document.getElementById('board'),statusEl=document.getElementById('status');
function winner(b){for(var i=0;i<wins.length;i++){var w=wins[i],a=b[w[0]],c=b[w[1]],d=b[w[2]];if(a&&a===c&&a===d)return{p:a,line:w}}return b.every(function(v){return v})?{p:'draw'}:null}
function minimax(b,player){
  var res=winner(b);
  if(res)return res.p==='draw'?0:(res.p==='O'?10:-10);
  var scores=[];
  for(var i=0;i<9;i++)if(!b[i]){b[i]=player;scores.push(minimax(b,player==='O'?'X':'O'));b[i]=null}
  if(!scores.length)return 0;
  return player==='O'?Math.max.apply(null,scores):Math.min.apply(null,scores);
}
function botMove(){
  var best=null,bestI=-1;
  for(var i=0;i<9;i++){
    if(!board[i]){
      board[i]='O';
      var s=minimax(board,'X');
      board[i]=null;
      if(best===null||s>best){best=s;bestI=i}
    }
  }
  return bestI;
}
function render(winLine){
  boardEl.innerHTML='';
  board.forEach(function(v,i){
    var b=document.createElement('button');
    b.className='cell'+(v==='X'?' x':v==='O'?' o':'')+(winLine&&winLine.indexOf(i)>-1?' win':'');
    b.textContent=v==='X'?'✕':v==='O'?'○':'';
    b.disabled=!!v||over;
    b.onclick=function(){play(i)};
    boardEl.appendChild(b);
  });
}
function play(i){
  if(over||board[i])return;
  board[i]='X';
  var res=winner(board);
  if(res){finish(res);return}
  var m=botMove();
  if(m>-1){board[m]='O';res=winner(board)}
  if(res){finish(res);return}
  render();
  statusEl.textContent="Your turn — you're X";
}
function finish(res){
  over=true;
  render(res.line);
  statusEl.textContent=res.p==='draw'?"It's a draw!":(res.p==='X'?'🎉 You win!':'💀 Bot wins!');
}
document.getElementById('restart').onclick=function(){
  board=Array(9).fill(null);over=false;render();statusEl.textContent="Your turn — you're X";
};
render();
})();</script>
</body></html>`;

async function sendBoard(sock, m, prefix, botNumber, board, statusLine, ended) {
  const { AIRich } = await import('../../lib/WABuilder.js');

  const displayBoard = renderBoard(board).split('\n').map(l => `│ ${l}`).join('\n');
  const txt = `╭─❏ 「 TIC TAC TOE 」\n│ ${statusLine}\n│\n${displayBoard}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

  const builder = new AIRich(sock)
    .setTitle('🎮 Tic Tac Toe MiniApp')
    .addText(txt)
    .addText('\n✨ *Tap a move below (opens a prefilled reply, then hit send):*');

  if (ended) {
    builder.addText(`\n${buildMoveLink(botNumber, prefix, '🔁 Play Again', 'ttt')}`);
  } else {
    emptyIndexes(board).forEach(i => {
      builder.addText(`\n${buildMoveLink(botNumber, prefix, `Slot ${i + 1} ➔ Choose Place`, `ttt ${i + 1}`)}`);
    });
    builder.addText(`\n${buildMoveLink(botNumber, prefix, '🚫 Quit Current Session', 'ttt end')}`);
    builder.addText(`\n\n_Or just reply with a number 1-9._`);
  }

  await builder.send(m.chat, { quoted: m });
}

export default {
  name: 'ttt',
  aliases: ['tictactoe', 'tttmove'],
  description: 'Play a live Tic Tac Toe mini-app against the bot; falls back to a text/link game if the mini-app can\'t render',
  run: async (context) => {
    const { client, m, args, prefix, botNumber } = context;
    const sock = client.sock || client;
    const key = m.sender;

    const input = (args[0] || '').toLowerCase();

    // `.ttt` and `.ttt classic` are the only two entry points to the HTML vs.
    // fallback decision. Everything else (numbers, end/quit) belongs to the
    // classic flow's own session, handled below exactly as before.
    if (!input) {
      try {
        const { sendHtmlView } = await import('../../lib/WABuilder.js');
        await sendHtmlView(sock, m.chat, HTML_APP, { quoted: m });
        return;
      } catch (error) {
        console.error(`TicTacToe HTML mini-app failed, falling back to text mode: ${error.message}`);
        // fall through to the classic session-based game below
      }
    }

    try {
      if (input === 'end' || input === 'quit') {
        if (!games.has(key)) {
          await client.sendMessage(m.chat, { text: `╭─❏ 「 TIC TAC TOE 」\n│ You have no active game.\n╰───────────────` });
          return;
        }
        games.delete(key);
        await client.sendMessage(m.chat, { text: `╭─❏ 「 TIC TAC TOE 」\n│ Game ended.\n╰───────────────` });
        return;
      }

      if (!input) {
        const board = Array(9).fill(null);
        games.set(key, board);
        await sendBoard(sock, m, prefix, botNumber, board, 'Tap a link below or reply with a number to pick your spot.', false);
        return;
      }

      const pos = parseInt(input, 10);
      if (isNaN(pos) || pos < 1 || pos > 9) {
        await client.sendMessage(m.chat, { text: `╭─❏ 「 TIC TAC TOE 」\n│ Usage: ${prefix}ttt to start\n│ ${prefix}ttt <1-9> to play\n╰───────────────` });
        return;
      }

      const board = games.get(key);
      if (!board) {
        await client.sendMessage(m.chat, { text: `╭─❏ 「 TIC TAC TOE 」\n│ No active game. Start one with ${prefix}ttt\n╰───────────────` });
        return;
      }

      const idx = pos - 1;
      if (board[idx] !== null) {
        await sendBoard(sock, m, prefix, botNumber, board, 'That spot is taken, pick another.', false);
        return;
      }

      board[idx] = 'X';
      let winner = checkWinner(board);

      if (winner === 'X') {
        games.delete(key);
        await sendBoard(sock, m, prefix, botNumber, board, '🎉 You win!', true);
        return;
      }

      if (isFull(board)) {
        games.delete(key);
        await sendBoard(sock, m, prefix, botNumber, board, "🤝 It's a draw!", true);
        return;
      }

      const botMove = pickBotMove(board);
      board[botMove] = 'O';
      winner = checkWinner(board);

      if (winner === 'O') {
        games.delete(key);
        await sendBoard(sock, m, prefix, botNumber, board, '💀 Bot wins!', true);
        return;
      }

      if (isFull(board)) {
        games.delete(key);
        await sendBoard(sock, m, prefix, botNumber, board, "🤝 It's a draw!", true);
        return;
      }

      games.set(key, board);
      await sendBoard(sock, m, prefix, botNumber, board, 'Your turn.', false);

    } catch (error) {
      console.error(`TicTacToe error: ${error.stack}`);
      games.delete(key);
      await client.sendMessage(m.chat, { text: `╭─❏ 「 ERROR 」\n│ Something broke the game.\n╰───────────────` }).catch(() => {});
    }
  }
};
