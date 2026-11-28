export default {
  name: 'games',
  aliases: ['gameslist', 'arcade'],
  description: 'List available live mini-app games',
  run: async (context) => {
    const { client, m, prefix } = context;
    const text = `╭─❏ 「 ARCADE 」\n│ ❌⭕ ${prefix}ttt — Tic Tac Toe vs an unbeatable bot\n│ 🏃 ${prefix}runner — Endless runner, tap to jump\n╰───────────────`;
    await client.sendMessage(m.chat, { text });
  }
};
