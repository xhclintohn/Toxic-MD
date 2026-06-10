import { sendInteractive } from '../../lib/sendInteractive.js';
export default async (context) => {
    const { client, m, text, fetchJson } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    try {
        if (!text) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, "╭─❏ 「 APK」\n│ Provide an app name, you brainless creature!\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
        }

        await client.sendMessage(m.chat, { react: { text: "⌛", key: m.reactKey } });

        const data = await fetchJson(`https://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(text)}`);

        if (!data?.datalist?.list?.length) {
            await client.sendMessage(m.chat, { react: { text: "❌", key: m.reactKey } });
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, "╭─❏ 「 APK」\n│ App not found!\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
        }

        const app = data.datalist.list[0];
        const apkUrl = app.file?.path;

        if (!apkUrl) {
            await client.sendMessage(m.chat, { react: { text: "❌", key: m.reactKey } });
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, "╭─❏ 「 APK」\n│ APK download link not available!\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
        }

        await client.sendMessage(
            m.chat,
            {
                document: { url: apkUrl },
                fileName: `${app.name}.apk`,
                mimetype: "application/vnd.android.package-archive"
            }
        );

        await client.sendMessage(m.chat, { react: { text: "✅", key: m.reactKey } });

    } catch (error) {
        await client.sendMessage(m.chat, { react: { text: "❌", key: m.reactKey } });
        sendInteractive(client, m, `╭─❏ 「 APK ERROR」
│ APK download failed, not my problem.\n│ ` + error + "\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
    }
};
