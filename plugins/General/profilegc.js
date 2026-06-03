import { getFakeQuoted } from '../../lib/fakeQuoted.js';
export default async (context) => {
    const { client, m } = context;
    const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    function convertTimestamp(timestamp) {
        const d = new Date(timestamp * 1000);
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return {
            date: d.getDate(),
            month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d),
            year: d.getFullYear(),
            day: daysOfWeek[d.getUTCDay()],
            time: `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}:${d.getUTCSeconds().toString().padStart(2, '0')}`
        }
    }

    if (!m.isGroup) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ Eʀʀᴏʀ ≪───\n├ \n├ This command is meant for groups.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    let info = await client.groupMetadata(m.chat);
    let ts = await convertTimestamp(info.creation);

    try {
        var pp = await client.profilePictureUrl(m.chat, 'image');
    } catch {
        var pp = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg';
    }

    const membersCount = info.participants.filter(p => !p.admin).length;
    const adminsCount = info.participants.filter(p => p.admin).length;
    const owner = info.owner || info.participants.find(p => p.admin === 'superadmin')?.id;

    const caption = `╭───(    TOXIC-MD    )───
├───≫ Gʀᴏᴜᴘ Iɴꜰᴏ ≪───
├ 
├ Name : *${info.subject}*
├ ID : *${info.id}*
├ Owner : ${owner ? '@' + owner.split('@')[0] : 'Unknown'}
├ 
├ Created :
├ ${ts.day}, ${ts.date} ${ts.month} ${ts.year}
├ ${ts.time} UTC
├ 
├ Participants :
├ Total : *${info.size}*
├ Members : *${membersCount}*
├ Admins : *${adminsCount}*
├ 
├ Settings :
├ Messages : ${info.announce ? 'Admins Only' : 'Everyone'}
├ Edit Info : ${info.restrict ? 'Admins Only' : 'Everyone'}
├ Add Members : ${info.memberAddMode ? 'Everyone' : 'Admins Only'}
╰──────────────────☉
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    await client.sendMessage(m.chat, { 
        image: { url: pp }, 
        caption: caption
    }, { quoted: fq });
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
};
