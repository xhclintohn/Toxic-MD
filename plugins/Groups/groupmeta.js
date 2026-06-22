import middleware from '../../utils/botUtil/middleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (title, msg) => `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const nameHandler = async (context) => {
    await middleware(context, async () => {
        const { client, m, text, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const newName = (text || '').trim();
        if (!newName) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(fmt('USAGE', `Provide a new group name.\n│ Usage: ${prefix}setgroupname <name>`));
        }
        if (newName.length > 100) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(fmt('ERROR', `Name can't exceed 100 characters.`));
        }
        try {
            await client.groupUpdateSubject(m.chat, newName);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await sendInteractive(client, m, fmt('UPDATED', `Group name set to "${newName}".`));
        } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt('FAILED', `Couldn't update group name. Am I an admin?`));
        }
    });
};

const descHandler = async (context) => {
    await middleware(context, async () => {
        const { client, m, text, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const newDesc = (text || '').trim();
        if (!newDesc) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(fmt('USAGE', `Provide a new description.\n│ Usage: ${prefix}setgroupdesc <description>`));
        }
        try {
            await client.groupUpdateDescription(m.chat, newDesc);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await sendInteractive(client, m, fmt('UPDATED', `Group description updated.`));
        } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt('FAILED', `Couldn't update description. Am I an admin?`));
        }
    });
};

const restrictHandler = async (context) => {
    await middleware(context, async () => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const _ON = new Set(['on','lock','locked','enable','enabled','true','1','yes','adminsonly']);
        const _OFF = new Set(['off','unlock','unlocked','disable','disabled','false','0','no','everyone']);
        const val = (args[0] || '').toLowerCase();
        if (!_ON.has(val) && !_OFF.has(val)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(fmt('USAGE', `Usage: ${prefix}setgrouprestrict on | off`));
        }
        try {
            const lock = _ON.has(val);
            await client.groupSettingUpdate(m.chat, lock ? 'locked' : 'unlocked');
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await sendInteractive(client, m, fmt('UPDATED', `Group editing now ${lock ? 'locked to admins only' : 'open to all members'}.`));
        } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt('FAILED', `Couldn't update group settings. Am I an admin?`));
        }
    });
};

export default [
    {
        name: 'setgroupname',
        aliases: ['gcname', 'groupname', 'changename', 'renamegc', 'setname', 'gcsubject', 'groupsubject', 'renamegroup', 'changegcname'],
        description: 'Change the group name/subject',
        run: nameHandler
    },
    {
        name: 'setgroupdesc',
        aliases: ['gcdesc', 'gdesc', 'groupdesc', 'changedesc', 'setdesc', 'changedescription', 'groupdescription', 'desc', 'editdesc', 'updatedesc'],
        description: 'Change the group description',
        run: descHandler
    },
    {
        name: 'setgrouprestrict',
        aliases: ['gcrestrict', 'restrict', 'lockgc', 'unlockgc', 'gclock', 'grouplock', 'locksettings', 'unlocksettings', 'editlock'],
        description: 'Lock or unlock group settings to admins only',
        run: restrictHandler
    }
];
