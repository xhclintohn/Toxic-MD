import middleware from '../../utils/botUtil/middleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { getBinaryNodeChild, getBinaryNodeChildren } from '@whiskeysockets/baileys';

export default async (context) => {
    await middleware(context, async () => {
        const { client, m, participants, botname, groupMetadata, text, pushname } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        if (!text) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ ERROR ≪───\n├ \n├ Provide number to be added.\n├ Format: add 254114885159\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const _participants = participants.map((user) => user.id.split(':')[0] + '@s.whatsapp.net');

        const numberList = text.split(',')
            .map((v) => v.replace(/[^0-9]/g, ''))
            .filter((v) => v.length > 4 && v.length < 20 && !_participants.includes(v + '@s.whatsapp.net'));

        const checkedUsers = await Promise.all(
            numberList.map(async (v) => {
                const exists = await client.onWhatsApp(v + '@s.whatsapp.net');
                return { num: v, exists: exists?.[0]?.exists };
            })
        );

        const users = checkedUsers.filter(v => v.exists).map(v => v.num + '@c.us');

        if (!users.length) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ ADD ≪───\n├ \n├ None of those numbers exist on WhatsApp\n├ or they're already in the group. 🙄\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const response = await client.query({
            tag: 'iq',
            attrs: {
                type: 'set',
                xmlns: 'w:g2',
                to: m.chat,
            },
            content: users.map((jid) => ({
                tag: 'add',
                attrs: {},
                content: [{ tag: 'participant', attrs: { jid } }],
            })),
        });

        const add = getBinaryNodeChild(response, 'add');
        const participant = getBinaryNodeChildren(add, 'participant');

        let respon = await client.groupInviteCode(m.chat);

        for (const user of participant.filter((item) => item.attrs.error === 401 || item.attrs.error === 403 || item.attrs.error === 408)) {
            const jid = user.attrs.jid;
            const content = getBinaryNodeChild(user, 'add_request');
            const invite_code = content.attrs.code;
            const invite_code_exp = content.attrs.expiration;

            let teza;
            if (user.attrs.error === 401) {
                teza = `╭───(    TOXIC-MD    )───\n├ @${jid.split('@')[0].split(':')[0]} has blocked the bot.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
            } else if (user.attrs.error === 403) {
                teza = `╭───(    TOXIC-MD    )───\n├ @${jid.split('@')[0].split(':')[0]} has set privacy settings for group adding.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
            } else if (user.attrs.error === 408) {
                teza = `╭───(    TOXIC-MD    )───\n├ @${jid.split('@')[0].split(':')[0]} recently left the group.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
            }

            await m.reply(teza);

            let links = `╭───(    TOXIC-MD    )───\n├───≫ GROUP INVITE ≪───\n├ \n├ ${pushname} is trying to add you to\n├ ${groupMetadata.subject}\n├ \n├ https://chat.whatsapp.com/${respon}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

            await client.sendMessage(jid, { text: links }, { quoted: fq });
        }

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
    });
};
