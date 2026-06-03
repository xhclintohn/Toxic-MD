import middleware from '../../utils/botUtil/middleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { parseDelay, scheduleAction, cancelScheduled } from '../../lib/groupTimers.js';

export default async (context) => {
    await middleware(context, async () => {
        const { client, m, args } = context;
        const fq = getFakeQuoted(m);
        const delayMs = parseDelay(args?.[0]);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        if (delayMs !== null) {
            const label = args[0];
            cancelScheduled(m.chat, 'close');
            scheduleAction(m.chat, 'close', delayMs, async () => {
                try {
                    await client.groupSettingUpdate(m.chat, 'announcement');
                    await client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├───≫ CLOSED ≪───\n├ \n├ ⏰ Scheduled close executed!\n├ Group is now closed.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` });
                } catch {}
            });
            await client.sendMessage(m.chat, { react: { text: '⏰', key: m.reactKey } });
            return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ TIMER SET ≪───\n├ \n├ ⏰ Group will close in *${label}*.\n├ Use .close to cancel & close now.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        try {
            cancelScheduled(m.chat, 'close');
            await client.groupSettingUpdate(m.chat, 'announcement');
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            m.reply(`╭───(    TOXIC-MD    )───\n├───≫ CLOSED ≪───\n├ \n├ Group closed. Shut up now.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            m.reply(`╭───(    TOXIC-MD    )───\n├ Failed to close group: ${e.message?.slice(0, 60)}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    });
};
