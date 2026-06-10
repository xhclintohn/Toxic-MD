export function buildMsg(title, lines = [], footer = '©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧') {
    const body = lines.map(l => `│ ${l}`).join('\n');
    return `╭─❏ 「 ${title}」\n${body}\n╰───────────────\n> ${footer}`;
}

export function buildLine(msg, footer = '©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧') {
    return `│ ${msg}\n╰───────────────\n> ${footer}`;
}

export function buildError(title, err, footer = '©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧') {
    const msg = err instanceof Error ? err.message : String(err);
    return `╭─❏ 「 ${title} ERROR」\n│ ${msg}\n╰───────────────\n> ${footer}`;
}

export function buildList(title, items = [], footer = '©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧') {
    const body = items.map((item, i) => `│ ${i + 1}. ${item}`).join('\n');
    return `╭─❏ 「 ${title}」\n${body}\n╰───────────────\n> ${footer}`;
}

export function buildField(title, fields = {}, footer = '©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧') {
    const body = Object.entries(fields).map(([k, v]) => `│ ${k}: ${v}`).join('\n');
    return `╭─❏ 「 ${title}」\n${body}\n╰───────────────\n> ${footer}`;
}

export function buildUsage(cmd, usage, example, footer = '©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧') {
    return `╭─❏ 「 ${cmd.toUpperCase()}」\n│ Usage: ${usage}\n│ Example: ${example}\n╰───────────────\n> ${footer}`;
}
