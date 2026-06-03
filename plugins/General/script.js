import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
  name: 'script',
  aliases: ['repo', 'source', 'github', 'git', 'gh', 'src', 'code', 'sourcecode'],
  description: 'Show GitHub repository info for Toxic-MD',
  run: async (context) => {
    const { client, m, botname, prefix = '' } = context;
    const fq = getFakeQuoted(m);
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    try {
      const repoUrl = 'https://api.github.com/repos/xhclintohn/Toxic-MD';
      const response = await fetch(repoUrl);
      const repoData = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch repository data');
      }

      const repoInfo = {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        lastUpdate: repoData.updated_at,
        owner: repoData.owner.login,
        createdAt: repoData.created_at,
        htmlUrl: repoData.html_url
      };

      const createdDate = new Date(repoInfo.createdAt).toLocaleDateString('en-GB');
      const lastUpdateDate = new Date(repoInfo.lastUpdate).toLocaleDateString('en-GB');

      const replyText = `╭───(    TOXIC-MD    )───\n├───≫ Repository ≪───\n├ \n├ Link:\n├ https://github.com/xhclintohn/Toxic-MD\n├ \n├ Stars : ${repoInfo.stars}\n├ Forks : ${repoInfo.forks}\n├ Created : ${createdDate}\n├ Last Update : ${lastUpdateDate}\n├ Owner : ${repoInfo.owner}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

      try {
        const msg = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
          interactiveMessage: {
            body: { text: replyText },
            footer: { text: '' },
            header: { hasMediaAttachment: false },
            contextInfo: {
              externalAdReply: {
                showAdAttribution: false,
                title: `${botname}`,
                body: `Don't fuck this up.`,
                sourceUrl: `https://github.com/xhclintohn/Toxic-MD`,
                mediaType: 1,
                renderLargerThumbnail: true
              }
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Open Repo',
                    url: repoInfo.htmlUrl,
                    merchant_url: repoInfo.htmlUrl
                  })
                }
              ]
            }
          }
        }), { quoted: fq, userJid: client.user.id });
        await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      } catch {
        await client.sendMessage(m.chat, {
          text: replyText,
          viewOnce: true,
          contextInfo: {
            externalAdReply: {
              showAdAttribution: false,
              title: `${botname}`,
              body: `Don't fuck this up.`,
              sourceUrl: `https://github.com/xhclintohn/Toxic-MD`,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: fq });
      }

    } catch (error) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      console.error('Error in repo command:', error);
      await client.sendMessage(m.chat, {
        text: `╭───(    TOXIC-MD    )───\n├───≫ Eʀʀᴏʀ ≪───\n├ \n├ Couldn't fetch repo data\n├ ${error.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
      }, { quoted: fq });
    }
  }
};
