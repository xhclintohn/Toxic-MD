import fetch from 'node-fetch';
  import { sendInteractive } from '../../lib/sendInteractive.js';

  const HEADERS = {
      'User-Agent': 'Toxic-MD-Bot/2.0',
      'Accept': 'application/vnd.github.v3+json',
  };

  const fmt = (lines) => lines.join('\n') + '\n> ©𝒏𝒐𝒘𝒆𝒓𝒆𝒅 𝒁𝒚 𝒙𝒉_𝒄𝒍𝒎𝒗𝒘𝒐𝒗';

  export default async (context) => {
      const { client, m, text, prefix } = context;

      if (!text?.trim()) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return sendInteractive(client, m, fmt([
              '╭─❗ 「 GitHub Stalker 」',
              '│ Usage: ' + prefix + 'github <username>',
              '│ Example: ' + prefix + 'github xhclintohn',
              '╰───────────────',
          ]));
      }

      const username = text.trim().replace(/^@/, '');
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

      try {
          const [userRes, reposRes] = await Promise.all([
              fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers: HEADERS }),
              fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=5`, { headers: HEADERS }),
          ]);

          if (!userRes.ok) {
              await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
              if (userRes.status === 404) return sendInteractive(client, m, fmt(['╭─❗ 「 GitHub 」', '│ User not found: ' + username, '╰───────────────']));
              if (userRes.status === 403) return sendInteractive(client, m, fmt(['╭─❗ 「 GitHub 」', '│ Rate limit hit. Try again in a minute.', '╰───────────────']));
              throw new Error('GitHub API: ' + userRes.status);
          }

          const u = await userRes.json();
          const repos = reposRes.ok ? await reposRes.json() : [];

          const joined = new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
          const updated = new Date(u.updated_at || u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

          const lines = [
              '╭─❗ 「 👤 GitHub Profile 」',
              '│',
              '│ 👤 Name:       ' + (u.name || u.login),
              '│ 🔗 Username:  @' + u.login,
              '│ 📄 Bio:        ' + (u.bio || 'No bio set'),
              '│ 📍 Location:  ' + (u.location || 'Unknown'),
              '│ 🌎 Blog:       ' + (u.blog || 'None'),
              '│ 👀 Company:   ' + (u.company || 'None'),
              '│',
              '│ 📊 Stats',
              '│   • Repos:     ' + u.public_repos,
              '│   • Gists:     ' + u.public_gists,
              '│   • Followers: ' + u.followers,
              '│   • Following: ' + u.following,
              '│',
              '│ 📅 Joined:    ' + joined,
              '│ 🔄 Updated:   ' + updated,
          ];

          if (repos.length > 0) {
              lines.push('│');
              lines.push('│ 🗂️ Recent Repos');
              repos.slice(0, 5).forEach((repo, i) => {
                  const stars = repo.stargazers_count > 0 ? ' ⭐' + repo.stargazers_count : '';
                  const lang = repo.language ? ' [' + repo.language + ']' : '';
                  lines.push(`│   ${i + 1}. ${repo.name}${lang}${stars}`);
              });
          }

          lines.push('│');
          lines.push('│ 🔗 ' + u.html_url);
          lines.push('╰───────────────');

          await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});

          // Send profile picture if available
          if (u.avatar_url) {
              try {
                  const imgRes = await fetch(u.avatar_url, { headers: { 'User-Agent': 'Toxic-MD-Bot/2.0' } });
                  if (imgRes.ok) {
                      const imgBuf = Buffer.from(await imgRes.arrayBuffer());
                      return client.sendMessage(m.chat, {
                          image: imgBuf,
                          caption: fmt(lines),
                      });
                  }
              } catch {}
          }
          return sendInteractive(client, m, fmt(lines));

      } catch (err) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return sendInteractive(client, m, fmt([
              '╭─❗ 「 GitHub 」',
              '│ Error: ' + (err.message || 'Unknown error'),
              '╰───────────────',
          ]));
      }
  };
  