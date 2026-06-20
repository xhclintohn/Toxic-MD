import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const formatStylishReply = (message) => {
    return (
        `╭─❏ 「 VPS UPDATE 」\n` +
        `│ ${message.split('\n').join('\n│ ')}\n` +
        `╰───────────────\n` +
        `> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧\n` +
        `Pσɯҽɾҽԃ Ⴆყ Tσxιƈ-ɱԃȥ 😈`
    );
};

export default async (context) => {
    const { client, m } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    await ownerMiddleware(context, async () => {
        try {
            try {
                await execAsync('git rev-parse --is-inside-work-tree', { timeout: 15000 });
            } catch {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return await sendInteractive(
                    client,
                    m,
                    formatStylishReply(
                        "This isn't a git repository, genius.\n\n" +
                        "On Pterodactyl/VPS you must deploy by cloning the repo:\n" +
                        "git clone https://github.com/xhclintohn/Toxic-Bot-H .\n\n" +
                        "Re-deploy that way, then this command will work."
                    )
                );
            }

            await client.sendMessage(m.chat, { react: { text: '🔄', key: m.reactKey } });
            await sendInteractive(
                client,
                m,
                formatStylishReply("Checking for updates... don't touch anything. 🙄")
            );

            await execAsync('git fetch origin', { timeout: 60000 });

            const { stdout: localSha } = await execAsync('git rev-parse HEAD');
            const { stdout: remoteSha } = await execAsync('git rev-parse @{u}');

            if (localSha.trim() === remoteSha.trim()) {
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return await sendInteractive(
                    client,
                    m,
                    formatStylishReply("Your bot is already on the latest version, genius.")
                );
            }

            const { stdout: log } = await execAsync(
                'git log HEAD..@{u} --pretty=format:"• %s (%an)" -n 10'
            );

            await sendInteractive(
                client,
                m,
                formatStylishReply(
                    "🆕 Update found! Pulling latest changes...\n\n" +
                    (log.trim() || "No commit messages found.")
                )
            );

            await execAsync('git pull origin HEAD', { timeout: 120000 });

            await sendInteractive(
                client,
                m,
                formatStylishReply("Installing dependencies, hang tight...")
            );
            await execAsync('npm install --omit=dev', { timeout: 300000 });

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await sendInteractive(
                client,
                m,
                formatStylishReply(
                    "Update complete! Restarting Toxic-MD now to apply changes.\n\n" +
                    "If your process manager (PM2 / Pterodactyl) isn't set to auto-restart, " +
                    "start the bot manually after this."
                )
            );

            setTimeout(() => process.exit(0), 3000);

        } catch (error) {
            const errorMessage = error.stderr || error.message || 'Unknown error';
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await sendInteractive(
                client,
                m,
                formatStylishReply(`Update failed:\n${errorMessage}\nTry again without panicking.`)
            );
        }
    });
};