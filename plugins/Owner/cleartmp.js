import { readdirSync, statSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
    name: 'cleartmp',
    alias: ['clearcache', 'clrtmp'],
    description: 'Delete all temporary files (Owner only)',
    run: async (context) => {
        const { client, m, isOwner } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        if (!isOwner) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, 'Owner only command.');
        }
        const tmpDirs = ['./tmp', './temp'].filter(d => existsSync(d));
        if (!tmpDirs.length) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, 'No tmp directories found.');
        }
        let deleted = 0;
        let skipped = 0;
        for (const dir of tmpDirs) {
            for (const file of readdirSync(dir)) {
                const fp = join(dir, file);
                try {
                    if (statSync(fp).isFile()) {
                        unlinkSync(fp);
                        deleted++;
                    } else {
                        skipped++;
                    }
                } catch {
                    skipped++;
                }
            }
        }
        await sendInteractive(client, m, `╭─❏ 「 TMP CLEANED」
│ ✅ Deleted: ${deleted} file(s)\n│ ⏩ Skipped: ${skipped} item(s)\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
};
