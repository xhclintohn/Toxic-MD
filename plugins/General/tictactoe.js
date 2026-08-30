const games = new Map();

const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

const winCombos = [, [3, 4, 5], [6, 7, 8],
, [1, 4, 7], [2, 5, 8],
, [2, 4, 6]
];

function checkWinner(board) {
  for (const [a, b, c] of winCombos) {
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

async function sendBoard(sock, m, prefix, board, statusLine, ended) {
  const { AIRich } = await import('../../lib/WABuilder.js');
  
  const displayBoard = renderBoard(board).split('\n').map(l => `│ ${l}`).join('\n');
  const txt = `╭─❏ 「 TIC TAC TOE 」\n│ ${statusLine}\n│\n${displayBoard}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  
  const gameUrl = `https://github.com{encodeURIComponent(statusLine)}&board=${encodeURIComponent(board.map(x => x || '-').join(''))}`;

  const builder = new AIRich(sock)
    .setTitle('🎮 Tic Tac Toe MiniApp')
    .addText(txt);

  if (ended) {
    builder.addText(`\n[🔁 Play Again New Game](https://github.com/xhclintohn/Toxic-MD)`);
  } else {
    builder.addText(`\n[🌐 Open Game MiniApp Canvas](${gameUrl})`);
  }

  await builder.send(m.chat, { quoted: m });
}

export default {
  name: 'ttt',
  aliases: ['tictactoe', 'tttmove'],
  description: 'Play Tic Tac Toe against the bot using rich mini-app container links',
  run: async (context) => {
    const { client, m, args, prefix } = context;
    const sock = client.sock || client;
    const key = m.sender;

    try {
      const input = (args[0] || '').toLowerCase();

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
        await sendBoard(sock, m, prefix, board, 'Tap the link to open game canvas.', false);
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
        await sendBoard(sock, m, prefix, board, 'That spot is taken, pick another.', false);
        return;
      }

      board[idx] = 'X';
      let winner = checkWinner(board);

      if (winner === 'X') {
        games.delete(key);
        await sendBoard(sock, m, prefix, board, '🎉 You win!', true);
        return;
      }

      if (isFull(board)) {
        games.delete(key);
        await sendBoard(sock, m, prefix, board, "🤝 It's a draw!", true);
        return;
      }

      const botMove = pickBotMove(board);
      board[botMove] = 'O';
      winner = checkWinner(board);

      if (winner === 'O') {
        games.delete(key);
        await sendBoard(sock, m, prefix, board, '💀 Bot wins!', true);
        return;
      }

      if (isFull(board)) {
        games.delete(key);
        await sendBoard(sock, m, prefix, board, "🤝 It's a draw!", true);
        return;
      }

      games.set(key, board);
      await sendBoard(sock, m, prefix, board, 'Your turn.', false);

    } catch (error) {
      console.error(`TicTacToe error: ${error.stack}`);
      games.delete(key);
      await client.sendMessage(m.chat, { text: `╭─❏ 「 ERROR 」\n│ Something broke the game.\n╰───────────────` }).catch(() => {});
    }
  }
};
