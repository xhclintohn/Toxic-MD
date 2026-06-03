import { getFakeQuoted } from '../../lib/fakeQuoted.js';

  export default {
      name: 'profile',
      aliases: ['getpp', 'pp', 'pfp'],
      description: 'Get profile picture. In a group with no args, sends the group pic and description.',
      run: async (context) => {
          const { client, m, text, pict } = context;
          const fq = getFakeQuoted(m);
          await client.sendMessage(m.chat, { react: { text: '⏳', key: m.reactKey } });

          try {
              if (m.isGroup && !text && !m.quoted) {
                  const meta = await client.groupMetadata(m.chat);
                  let ppUrl = pict;
                  try {
                      ppUrl = await client.profilePictureUrl(m.chat, 'image');
                  } catch {}
                  const desc = (meta.desc && meta.desc.toString().trim()) || 'No description set.';
                  await client.sendMessage(m.chat, {
                      image: { url: ppUrl },
                      caption: `╭───(    TOXIC-MD    )───\n├───≡ Gʀᴏᴜᴘ Pɪᴄ ≢───\n├ \n├ *${meta.subject}*\n├ \n├ ${desc}\n╰──────────────────☑\n> ©𝐏𝐨𝐰𝐞𝐫𝐞ꀠ𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                  }, { quoted: fq });
                  await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                  return;
              }

              let targetUser = m.sender;

              if (m.quoted) {
                  targetUser = m.quoted.sender;
              } else if (text) {
                  if (text.includes('@')) {
                      const mentionedJid = m.mentionedJid && m.mentionedJid[0];
                      if (mentionedJid) targetUser = mentionedJid;
                  } else {
                      const cleanedNumber = text.replace(/\s+/g, '').replace(/[^\d+]/g, '');
                      if (/^\+?\d{10,15}$/.test(cleanedNumber)) {
                          let formattedNumber = cleanedNumber;
                          if (formattedNumber.startsWith('+')) formattedNumber = formattedNumber.substring(1);
                          targetUser = formattedNumber.includes('@') ? formattedNumber : `${formattedNumber}@s.whatsapp.net`;
                      }
                  }
              }

              let displayName;
              try {
                  const profileName = await client.getName(targetUser);
                  displayName = profileName || targetUser.split('@')[0];
              } catch {
                  displayName = targetUser.split('@')[0];
              }

              let ppUrl = pict;
              try {
                  ppUrl = await client.profilePictureUrl(targetUser, 'image');
              } catch {}

              await client.sendMessage(m.chat, {
                  image: { url: ppUrl },
                  caption: `╭───(    TOXIC-MD    )───\n├───≡ Pʀᴏғɪʟᴇ ≢───\n├ \n├ ${displayName}\n╰──────────────────☑\n> ©𝐏𝐨𝐰𝐞𝐫𝐞ꀠ𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                  mentions: targetUser !== m.sender ? [targetUser] : []
              }, { quoted: fq });
              await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

          } catch (error) {
              await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
              console.error('Profile error:', error);
              await m.reply(`╭───(    TOXIC-MD    )───\n├───≡ Eʀʀᴏʀ ≢───\n├ \n├ Failed to fetch profile.\n├ The user probably blocked you or\n├ their privacy settings are stricter\n├ than your intelligence.\n╰──────────────────☑\n> ©𝐏𝐨𝐰𝐞𝐫𝐞ꀠ𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
          }
      }
  };
  