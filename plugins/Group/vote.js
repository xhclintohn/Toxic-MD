import { sendInteractive } from '../../lib/sendInteractive.js';
import { encodePollVoteButton } from '../../lib/pollVote.js';
import { getPollSecret } from '../../lib/pollSecrets.js';

const box = (title, body) => {
    const lines = String(body).split('\n').map(l => l.startsWith('│') ? l : `│ ${l}`).join('\n');
    return `╭─❏ 「 ${title} 」\n${lines}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
};

export default {
    name: 'vote',
    aliases: ['pollvote'],
    description: 'Reply to a poll to vote with quick-reply buttons',
    run: async (context) => {
        const { client, m, store } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fail = async (text) => {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, box('VOTE', text));
        };

        if (!m.quoted) {
            return fail("Reply to a poll with .vote — I'll give you buttons for each option.");
        }

        const qtype = m.quoted?.mtype || '';
        if (qtype !== 'pollCreationMessage' && qtype !== 'pollCreationMessageV3') {
            return fail("That's not a poll. Reply to a poll message with .vote.");
        }

        const poll = m.quoted;
        const options = (poll.options || []).map(o => o.optionName).filter(Boolean);
        if (!options.length) {
            return fail("That poll has no options I can read.");
        }

        const pollName = poll.name || 'Poll';
        const pollId = m.quoted.id;
        let creatorJid = m.quoted.sender || '';
        if (!pollId || !creatorJid) {
            return fail("I can't read that poll's details. Try again.");
        }

        let secret = null;
        try {
            const live = getPollSecret(m.chat, pollId);
            if (live) {
                secret = live.secret;
                if (live.creatorJid) creatorJid = live.creatorJid;
            }
        } catch {}
        if (!secret) {
            try {
                const stored = await store?.loadMessage?.(m.chat, pollId, client);
                secret = stored?.message?.messageContextInfo?.messageSecret || stored?.messageContextInfo?.messageSecret || null;
                if (!secret && Array.isArray(store?.chats?.[m.chat])) {
                    const cands = store.chats[m.chat].filter(x => x?.key?.id === pollId);
                    const found = cands.find(c => c?.message?.messageContextInfo?.messageSecret || c?.messageContextInfo?.messageSecret);
                    if (found) secret = found.message?.messageContextInfo?.messageSecret || found.messageContextInfo.messageSecret;
                }
            } catch {}
        }
        if (!secret) {
            secret = m.msg?.contextInfo?.quotedMessage?.messageContextInfo?.messageSecret || null;
        }
        if (!secret) {
            return fail("I wasn't here when that poll was posted, so I don't have its voting key.\n│ Post a fresh poll while I'm online, then reply .vote to it.");
        }

        try {
            if (options.length <= 3) {
                await client.sendMessage(m.chat, {
                    text: `📊 *${pollName}*\nTap an option to vote:`,
                    footer: 'Toxic-MD poll vote',
                    interactiveButtons: options.map((name) => ({
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({ display_text: name, id: encodePollVoteButton(pollId, creatorJid, secret, name) })
                    }))
                });
            } else {
                await client.sendMessage(m.chat, {
                    text: `📊 *${pollName}*\nPick an option to vote:`,
                    footer: 'Toxic-MD poll vote',
                    buttonText: 'Vote',
                    sections: [{ title: pollName, rows: options.map((name) => ({ title: name, rowId: encodePollVoteButton(pollId, creatorJid, secret, name) })) }]
                });
            }
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch (e) {
            console.error('[VOTE] send failed:', e?.message || e);
            return fail(`Couldn't send the vote buttons: ${String(e?.message || e).slice(0, 80)}`);
        }
    }
};
