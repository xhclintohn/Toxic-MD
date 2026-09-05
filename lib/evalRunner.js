import util from 'util';

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

function stripWrappers(code) {
    let src = String(code || '').replace(/\r/g, '').trim();
    if (!src) return '';
    src = src.replace(/^[>$]+\s*/, '');
    const fence = src.match(/^```(?:[a-zA-Z]*)\n([\s\S]*?)\n?```$/);
    if (fence) src = fence[1].trim();
    return src;
}

const RESERVED = new Set(['await', 'arguments', 'eval', 'this', 'null', 'true', 'false', 'default', 'class', 'function', 'return', 'new', 'delete', 'typeof', 'void', 'in', 'of', 'do', 'if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch', 'finally', 'throw', 'var', 'let', 'const', 'yield', 'import', 'export', 'super', 'extends', 'break', 'continue', 'with', 'debugger', 'enum', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'static']);

const STATEMENT_KEYWORDS = /^(return|throw|if|for|while|switch|try|catch|finally|const|let|var|function|class|else|case|default|do|export|import|delete|new\s+[A-Za-z_$]|break|continue)\b/;

function splitTail(src) {
    const trimmed = src.replace(/;\s*$/, '').trimEnd();
    for (let i = trimmed.length - 1; i >= 0; i--) {
        const ch = trimmed[i];
        if (ch !== ';' && ch !== '\n') continue;
        const head = trimmed.slice(0, i);
        const tail = trimmed.slice(i + 1).trim();
        if (!tail || tail.startsWith('//')) continue;
        if (STATEMENT_KEYWORDS.test(tail)) return null;
        if (tail.startsWith('{') || tail.endsWith('}')) return null;
        return { head, tail };
    }
    if (!STATEMENT_KEYWORDS.test(trimmed) && !trimmed.startsWith('{') && !trimmed.endsWith('}') && !trimmed.includes(';')) return { head: '', tail: trimmed };
    return null;
}

function transpileModuleSyntax(code) {
    let src = String(code || '');
    if (!/^\s*(import|export)\s/m.test(src)) return src;

    src = src.replace(/^[ \t]*import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+(['"][^'"]+['"])\s*;?[ \t]*$/gm, 'const $1 = await import($2);');
    src = src.replace(/^[ \t]*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]*)\}\s*from\s+(['"][^'"]+['"])\s*;?[ \t]*$/gm, (match, def, named, mod) => {
        const cleaned = named.split(',').map(part => part.trim()).filter(Boolean).map(part => part.replace(/\s+as\s+/, ': ')).join(', ');
        return 'const __mod_' + def + ' = await import(' + mod + ');\nconst ' + def + ' = __mod_' + def + '.default ?? __mod_' + def + ';\nconst { ' + cleaned + ' } = __mod_' + def + ';';
    });
    src = src.replace(/^[ \t]*import\s+\{([^}]*)\}\s*from\s+(['"][^'"]+['"])\s*;?[ \t]*$/gm, (match, named, mod) => {
        const cleaned = named.split(',').map(part => part.trim()).filter(Boolean).map(part => part.replace(/\s+as\s+/, ': ')).join(', ');
        return 'const { ' + cleaned + ' } = await import(' + mod + ');';
    });
    src = src.replace(/^[ \t]*import\s+([A-Za-z_$][\w$]*)\s+from\s+(['"][^'"]+['"])\s*;?[ \t]*$/gm, (match, def, mod) => {
        return 'const __mod_' + def + ' = await import(' + mod + ');\nconst ' + def + ' = __mod_' + def + '.default ?? __mod_' + def + ';';
    });
    src = src.replace(/^[ \t]*import\s+(['"][^'"]+['"])\s*;?[ \t]*$/gm, 'await import($1);');
    src = src.replace(/^[ \t]*export\s+default\s+/gm, 'return ');
    src = src.replace(/^[ \t]*export\s+(const|let|var|function|class|async)\s/gm, '$1 ');
    src = src.replace(/^[ \t]*export\s*\{[^}]*\}\s*;?[ \t]*$/gm, '');
    return src;
}

function lastStatementReturn(src) {
    const parts = splitTail(src);
    if (!parts) return null;
    const head = parts.head ? parts.head.replace(/;\s*$/, '') + ';\n' : '';
    return head + 'return (' + parts.tail + ');';
}

function buildAttempts(src) {
    const attempts = [];
    attempts.push('return (\n' + src + '\n);');
    const tail = lastStatementReturn(src);
    if (tail) attempts.push(tail);
    attempts.push(src);
    attempts.push('return (' + src + ');');
    return attempts;
}

function declaredNames(src) {
    const names = new Set();
    const simple = /(?:^|[\s;{}(])(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g;
    let match;
    while ((match = simple.exec(src)) !== null) names.add(match[1]);
    const destructured = /(?:^|[\s;{}(])(?:const|let|var)\s*(\{[^}]*\}|\[[^\]]*\])/g;
    while ((match = destructured.exec(src)) !== null) {
        const inner = match[1].slice(1, -1);
        for (const part of inner.split(',')) {
            const piece = part.split(':').pop().split('=')[0].replace(/[.\s]/g, '');
            if (/^[A-Za-z_$][\w$]*$/.test(piece)) names.add(piece);
        }
    }
    return names;
}

function compile(src, keys) {
    const attempts = buildAttempts(src);
    let lastError = null;
    for (const body of attempts) {
        try {
            return new AsyncFunction(...keys, body);
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError || new SyntaxError('Unable to compile code');
}

async function runEval(code, scope = {}) {
    const src = transpileModuleSyntax(stripWrappers(code));
    if (!src) return undefined;
    const taken = declaredNames(src);
    const keys = Object.keys(scope).filter(k => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) && !RESERVED.has(k) && !taken.has(k));
    const values = keys.map(k => scope[k]);
    const fn = compile(src, keys);
    return await fn.apply(scope.m || globalThis, values);
}

function buildScope(context = {}, extra = {}) {
    const client = context.client || context.sock || extra.client;
    const scope = {
        ...context,
        client,
        sock: client,
        conn: client,
        bot: client,
        wa: client,
        xh: client,
        clint: client,
        util,
        process,
        console,
        Buffer,
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval,
        globalThis,
        ...extra
    };
    scope.args = context.args || [];
    return scope;
}

function formatResult(value) {
    if (typeof value === 'string') return value;
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    try {
        return util.inspect(value, { depth: 4 });
    } catch {
        return String(value);
    }
}

export { runEval, buildScope, formatResult, transpileModuleSyntax };
