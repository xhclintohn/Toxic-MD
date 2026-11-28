import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
  
  export default {
      name: 'password',
      aliases: ['genpass', 'passgen', 'strongpass'],
      description: 'Generate a strong random password',
      run: async (context) => {
          const { client, m, text } = context;
          await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
          const len = Math.min(Math.max(parseInt(text || '16') || 16, 8), 64);
          const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
          let pass = '';
          for (let i = 0; i < len; i++) pass += chars[Math.floor(Math.random() * chars.length)];
          const resultText = `╭─❏ 「 Pᴀssᴡᴏʀᴅ Gᴇɴ」
│
│ 🔐 Length: ${len} chars\n│
│ ${pass}\n│
│ Save it. I won't regenerate it for you.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
          try {
              const msg = await generateWAMessageFromContent(m.chat, proto.Message.fromObject({
                  interactiveMessage: {
                      body: { text: resultText },
                      footer: { text: '' },
                      nativeFlowMessage: {
                          buttons: [{ name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: '📋 Copy Password', copy_code: pass }) }],
                          messageParamsJson: ''
                      }
                  }
              }), { userJid: client.user.id });
              await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

              await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
          } catch {
              await client.sendMessage(m.chat, { text: resultText });
          }
      }
  };
  