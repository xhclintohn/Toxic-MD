import fetch from 'node-fetch';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

function getHeaders() {
    return {
        'User-Agent': 'Toxic-MD-Bot/2.0',
        'Accept': 'application/vnd.github.v3+json'
    };
}

async function githubUserStalk(user) {
    const response = await fetch('https://api.github.com/users/' + user, { headers: getHeaders() });
    if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    return response.json();
}

async function githubRepoSearch(query) {
    const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`, { headers: getHeaders() });
    if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    return response.json();
}

async function githubCodeSearch(query) {
    const response = await fetch(`https://api.github.com/search/code?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    return response.json();
}

async function githubTrending() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const response = await fetch(`https://api.github.com/search/repositories?q=created:>${weekAgo}&sort=stars&order=desc`, { headers: getHeaders() });
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    return response.json();
}

export default async (context) => {
    const { client, m, text, prefix, args, commandName } = context;
    const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    if (!text) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ GitHub Search ≪───\n├ Usage:\n├ ${prefix}github user <username>\n├ ${prefix}github repos <query>\n├ ${prefix}github trending\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    const subCommand = args[0]?.toLowerCase();
    const searchQuery = args.slice(1).join(' ');

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        if (subCommand === 'user' || subCommand === 'stalk') {
            if (!searchQuery) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return m.reply('Give me a GitHub username to stalk.');
            }
            const userData = await githubUserStalk(searchQuery);
            const bio = userData.bio || 'No bio';
            const location = userData.location || 'Unknown';
            const createdDate = new Date(userData.created_at).toLocaleDateString();
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await m.reply(
                `╭───(    TOXIC-MD    )───\n├───≫ GitHub User ≪───\n├ Name: ${userData.name || userData.login}\n├ Username: @${userData.login}\n├ Bio: ${bio}\n├ Location: ${location}\n├ Repos: ${userData.public_repos}\n├ Followers: ${userData.followers}\n├ Following: ${userData.following}\n├ Joined: ${createdDate}\n├ URL: ${userData.html_url}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            );
        } else if (subCommand === 'repos' || subCommand === 'search') {
            if (!searchQuery) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return m.reply('Give me something to search, genius.');
            }
            const repoData = await githubRepoSearch(searchQuery);
            if (!repoData.items || repoData.items.length === 0) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return m.reply('No repositories found. Try a different query.');
            }
            const top5 = repoData.items.slice(0, 5);
            const repoList = top5.map((repo, i) =>
                `├ ${i + 1}. ${repo.full_name}\n│  ⭐ ${repo.stargazers_count} | ${repo.language || 'Unknown'}\n│  ${repo.description ? repo.description.substring(0, 60) : 'No description'}`
            ).join('\n');
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ GitHub Repos ≪───\n${repoList}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        } else if (subCommand === 'trending') {
            const trendData = await githubTrending();
            if (!trendData.items || trendData.items.length === 0) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return m.reply('No trending repos found.');
            }
            const top5 = trendData.items.slice(0, 5);
            const trendList = top5.map((repo, i) =>
                `├ ${i + 1}. ${repo.full_name}\n│  ⭐ ${repo.stargazers_count} | ${repo.language || 'Unknown'}\n│  ${repo.description ? repo.description.substring(0, 60) : 'No description'}`
            ).join('\n');
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ GitHub Trending ≪───\n${trendList}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        } else {
            const userData = await githubUserStalk(text.trim());
            const bio = userData.bio || 'No bio';
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await m.reply(
                `╭───(    TOXIC-MD    )───\n├───≫ GitHub User ≪───\n├ Name: ${userData.name || userData.login}\n├ Username: @${userData.login}\n├ Bio: ${bio}\n├ Repos: ${userData.public_repos}\n├ Followers: ${userData.followers}\n├ URL: ${userData.html_url}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            );
        }
    } catch (error) {
        console.error('GitHub search error:', error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        if (error.message.includes('404')) return m.reply('User/repo not found. Double-check the name.');
        if (error.message.includes('403')) return m.reply('GitHub rate limit hit. Try again in a minute.');
        await m.reply(`╭───(    TOXIC-MD    )───\n├ GitHub search failed.\n├ Something went wrong. Try again.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
};
