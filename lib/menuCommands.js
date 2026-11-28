import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const CATEGORY_DIRS = ['General', 'Settings', 'Owner', 'Dev', 'Heroku', 'Privacy', 'Group', 'AI', 'Downloader', 'Editing', 'Filters', 'Anime', 'NSFW', 'Tools', 'Reactions', 'Coding', 'Search', 'Games'];

export async function getCommandCategories() {
    const categories = [];
    let total = 0;
    for (const dir of CATEGORY_DIRS) {
        let files;
        try {
            files = fs.readdirSync(path.join(process.cwd(), 'plugins', dir)).filter(f => f.endsWith('.js') && f !== 'links.js');
        } catch {
            continue;
        }
        const commands = [];
        for (const file of files) {
            try {
                const modUrl = pathToFileURL(path.join(process.cwd(), 'plugins', dir, file)).href;
                const modRaw = await import(modUrl);
                const mod = modRaw.default !== undefined ? modRaw.default : modRaw;
                if (Array.isArray(mod)) {
                    for (const cmd of mod) if (cmd?.name && typeof cmd.run === 'function') commands.push(cmd.name);
                } else if (typeof mod === 'function') {
                    commands.push(file.replace('.js', ''));
                } else if (mod && typeof mod === 'object' && typeof mod.name === 'string' && typeof mod.run === 'function') {
                    commands.push(mod.name);
                } else {
                    commands.push(file.replace('.js', ''));
                }
            } catch {
                commands.push(file.replace('.js', ''));
            }
        }
        const uniqueCommands = [...new Set(commands)];
        if (uniqueCommands.length) {
            uniqueCommands.sort((a, b) => a.localeCompare(b));
            categories.push({ name: dir.toUpperCase(), commands: uniqueCommands });
            total += uniqueCommands.length;
        }
    }
    return { categories, total };
}
