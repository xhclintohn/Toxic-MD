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

function buildFlowButtons(prefix, board, ended) {
  if (ended) {
    return [
      {
        name: 'flow',
        buttonParamsJson: JSON.stringify({
          flow_token: `${prefix}ttt_reset`,
          flow_id: "RESTART_FLOW",
          flow_cta: "🔁 Play Again",
          flow_action: "navigate",
          flow_context: { flow_screen: "WELCOME_SCREEN" }
        })
      }
    ];
  }

  return [
    {
      name: 'flow',
      buttonParamsJson: JSON.stringify({
        flow_token: `${prefix}ttt_move_session`,
        flow_id: "GAME_BOARD_FLOW",
        flow_cta: "🎮 Make Your Move",
        flow_action: "navigate",
        flow_context: {
          flow_screen: "BOARD_SCREEN",
          flow_data: {
            available_moves: emptyIndexes(board).map(i => ({ id: `${i + 1}`, title: `Slot ${i + 1}` })),
            current_board: renderBoard(board)
          }
        }
      })
    }
  ];
}

async function sendBoard(client, m, prefix, board, statusLine, ended) {
  const txt = `╭─❏ 「 TIC TAC TOE 」\n│ ${statusLine}\n│\n${renderBoard(board).split('\n').map(l => `│ ${l}`).join('\n')}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  const buttons = buildFlowButtons(prefix, board, ended);

  const customProto = {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          body: { text: txt },
          footer: { text: 'Toxic-MD' },
          header: { title: 'Tic Tac Toe', hasMediaAttachment: false },
          nativeFlowMessage: {
            buttons: buttons
          }
        }
      }
    }
  };

  const rawSocket = client.sock || client;
  
  if (rawSocket && typeof rawSocket.relayMessage === 'function') {
    const msgId = m.key.id;
    const msgContext = { quoted: m };
    const generated = await rawSocket.relayMessage(m.chat, customProto, { messageId: msgId }, msgContext);
    return generated;
  }

  await client.sendMessage(m.chat, customProto, { quoted: m });
}

export default {
  name: 'ttt',
  aliases: ['tictactoe', 'tttmove'],
  description: 'Play Tic Tac Toe against the bot using native flow windows',
  run: async (context) => {
    const { client, m, args, prefix } = context;
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
        await sendBoard(client, m, prefix, board, 'Open the app to make your move.', false);
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
        await sendBoard(client, m, prefix, board, 'That spot is taken, pick another.', false);
        return;
      }

      board[idx] = 'X';
      let winner = checkWinner(board);

      if (winner === 'X') {
        games.delete(key);
        await sendBoard(client, m, prefix, board, '🎉 You win!', true);
        return;
      }

      if (isFull(board)) {
        games.delete(key);
        await sendBoard(client, m, prefix, board, "🤝 It's a draw!", true);
        return;
      }

      const botMove = pickBotMove(board);
      board[botMove] = 'O';
      winner = checkWinner(board);

      if (winner === 'O') {
        games.delete(key);
        await sendBoard(client, m, prefix, board, '💀 Bot wins!', true);
        return;
      }

      if (isFull(board)) {
        games.delete(key);
        await sendBoard(client, m, prefix, board, "🤝 It's a draw!", true);
        return;
      }

      games.set(key, board);
      await sendBoard(client, m, prefix, board, 'Your turn.', false);

    } catch (error) {
      console.error(`TicTacToe error: ${error.stack}`);
      games.delete(key);
      await client.sendMessage(m.chat, { text: `╭─❏ 「 ERROR 」\n│ Something broke the game.\n╰───────────────` }).catch(() => {});
    }
  }
};
