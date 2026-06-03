import { c, cpp, node, python, java } from 'compile-run';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
export default async (context) => {
    const { m } = context;
    const fq = getFakeQuoted(m);
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });


    if (m.quoted && m.quoted.text) {
        const code = m.quoted.text;

async function runCode() {
  try {
    let result = await java.runSource(code);
    console.log(result);
    m.reply(`╭───(    TOXIC-MD    )───\n├───≫ JAVA OUTPUT ≪───\n├ \n├ ${result.stdout || 'No output'}\n${result.stderr ? '├ stderr: ' + result.stderr + '\n' : ''}╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  } catch (err) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    console.log(err);
    m.reply(`╭───(    TOXIC-MD    )───\n├───≫ JAVA ERROR ≪───\n├ \n├ ${err.stderr || err.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }
}

runCode();

} else { 

m.reply('╭───(    TOXIC-MD    )───\n├───≫ JAVA COMPILER ≪───\n├ \n├ Quote a valid and short Java code\n├ to compile, you absolute walnut.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧')

}

}