import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { generateAndSendReport } from '../../features/autoreport.js';
import { getGroupSettings, updateGroupSetting } from '../../database/config.js';

let _intervalId = null;
let _lastReportTime = 0;

const REPORT_INTERVAL = 24 * 60 * 60 * 1000;

const fmt = (msg) => `╭─❏ 「 AUTOREPORT」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

async function runReport(client, m) {
    if (!m.isGroup) return false;
    const result = await generateAndSendReport(client, m.chat);
    _lastReportTime = Date.now();
    return result;
}

function startAutoReport(client, jid) {
    if (_intervalId) clearInterval(_intervalId);
    _intervalId = setInterval(async () => {
        try {
            await generateAndSendReport(client, jid);
        } catch (e) {
            console.error('[AUTOREPORT] scheduled report failed:', e.message);
        }
    }, REPORT_INTERVAL);
}

function stopAutoReport() {
    if (_intervalId) {
        clearInterval(_intervalId);
        _intervalId = null;
    }
}

export default {
    name: 'autoreport',
    aliases: ['autorp', 'arp'],
    description: 'Toggle automatic daily group stats report to group status. Owner only.',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, text, prefix } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            if (!m.isGroup) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('This command only works in groups.'));
            }

            const arg = (text || '').trim().toLowerCase();

            if (arg === 'now') {
                await client.sendMessage(m.chat, { react: { text: '📊', key: m.reactKey } });
                const ok = await runReport(client, m);
                if (ok) {
                    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                    return sendInteractive(client, m, fmt('Daily report posted to group status!\n│ Next auto-report in 24 hours.\n│ \n│ Turn off anytime: ' + prefix + 'autoreport off'));
                } else {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt('Failed to generate report. Not enough chat data yet.'));
                }
            }

            if (['on', 'enable', 'start', 'true'].includes(arg)) {
                try {
                    await updateGroupSetting(m.chat, 'autoreport', 1);
                } catch {}
                startAutoReport(client, m.chat);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return sendInteractive(client, m, fmt('Auto-report ENABLED!\n│ I will post group stats to status every 24 hours.\n│ \n│ Turn off: ' + prefix + 'autoreport off'));
            }

            if (['off', 'disable', 'stop', 'false'].includes(arg)) {
                try {
                    await updateGroupSetting(m.chat, 'autoreport', 0);
                } catch {}
                stopAutoReport();
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return sendInteractive(client, m, fmt('Auto-report DISABLED.\n│ No more daily spam to your group status.'));
            }

            const gs = await getGroupSettings(m.chat);
            const isEnabled = gs?.autoreport === true || gs?.autoreport === 1;
            const timeSinceLast = Date.now() - _lastReportTime;
            const timeStr = _lastReportTime > 0
                ? `${Math.floor(timeSinceLast / 3600000)}h ago`
                : 'Never';

            await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Auto-report is currently *${isEnabled ? 'ON' : 'OFF'}*\n│ Last report: ${timeStr}\n│ \n│ Usage:\n│ ${prefix}autoreport on — enable daily reports\n│ ${prefix}autoreport off — disable\n│ ${prefix}autoreport now — post report immediately\n│ \n│ Aliases: ${prefix}autorp, ${prefix}arp`));
        });
    }
};

export { startAutoReport, stopAutoReport };
