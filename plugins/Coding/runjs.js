import { getFakeQuoted } from '../../lib/fakeQuoted.js';
    import { node } from 'compile-run';
export default async (context) => {
    const { m, text } = context;
    const fq = getFakeQuoted(m);
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    let code = text;

    if (m.quoted && m.quoted.text) {
        code = m.quoted.text;
    }

    if (!code) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return m.reply('╭───(    TOXIC-MD    )───\n├───≫ JS COMPILER ≪───\n├ \n├ Provide JavaScript code or quote one.\n├ Example: .runjs console.log("hello")\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
    }

    try {
        let result = await node.runSource(code);
        console.log(result);
        
        let output = result.stdout || 'No output';
        let error = result.stderr ? `├ stderr: ${result.stderr}\n` : '';
        
        m.reply(`╭───(    TOXIC-MD    )───\n├───≫ JS OUTPUT ≪───\n├ \n├ ${output}\n${error}╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        
    } catch (err) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        console.log(err);
        m.reply(`╭───(    TOXIC-MD    )───\n├───≫ JS ERROR ≪───\n├ \n├ ${err.stderr || err.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
};