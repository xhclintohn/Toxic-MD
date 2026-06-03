import { getFakeQuoted } from '../../lib/fakeQuoted.js';
export default async (context) => {

  const { client, m, text } = context;
  const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

  if (!text) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return m.reply(`╭───(    TOXIC-MD    )───\n├ Where's the link, you forgetful moron?\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`)
  }
  if (!text.includes('github.com')) return m.reply(`╭───(    TOXIC-MD    )───\n├ Is that even a GitHub repo link?! Think again.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`)

  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

  try {
      let regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
      let [, user3, repo] = text.match(regex1) || []
      repo = repo.replace(/.git$/, '')
      let url = `https://api.github.com/repos/${user3}/${repo}/zipball`
      let filename = (await fetch(url, {method: 'HEAD'})).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
      await client.sendMessage(m.chat, { document: { url: url }, fileName: filename+'.zip', mimetype: 'application/zip' }, { quoted: fq })
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
  } catch (err) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
      m.reply("╭───(    TOXIC-MD    )───\n├ Git clone failed. Skill issue.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧")
  }

  }