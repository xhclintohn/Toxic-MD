import fetch from 'node-fetch';

const TSDB_KEY = '123';

export const LEAGUES = {
    epl: { name: 'English Premier League', sport: 'soccer', espn: 'eng.1', tsdb: '4328' },
    laliga: { name: 'Spanish La Liga', sport: 'soccer', espn: 'esp.1', tsdb: '4335' },
    seriea: { name: 'Italian Serie A', sport: 'soccer', espn: 'ita.1', tsdb: '4332' },
    bundesliga: { name: 'German Bundesliga', sport: 'soccer', espn: 'ger.1', tsdb: '4331' },
    ligue1: { name: 'French Ligue 1', sport: 'soccer', espn: 'fra.1', tsdb: '4334' },
    ucl: { name: 'UEFA Champions League', sport: 'soccer', espn: 'uefa.champions', tsdb: '4480' },
    kpl: { name: 'Kenyan Premier League', sport: 'soccer', espn: null, tsdb: '4745' },
    nba: { name: 'NBA', sport: 'basketball', espn: 'nba', tsdb: null }
};

const LEAGUE_ALIASES = {
    premier: 'epl', pl: 'epl', premierleague: 'epl', england: 'epl',
    la: 'laliga', spain: 'laliga', spanish: 'laliga',
    italy: 'seriea', italian: 'seriea',
    germany: 'bundesliga', german: 'bundesliga',
    france: 'ligue1', french: 'ligue1',
    champions: 'ucl', championsleague: 'ucl', europe: 'ucl',
    kenya: 'kpl', kenyan: 'kpl', fkf: 'kpl',
    basketball: 'nba'
};

export function resolveLeague(arg) {
    const key = String(arg || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!key) return { key: 'epl', ...LEAGUES.epl };
    if (LEAGUES[key]) return { key, ...LEAGUES[key] };
    if (LEAGUE_ALIASES[key]) return { key: LEAGUE_ALIASES[key], ...LEAGUES[LEAGUE_ALIASES[key]] };
    return null;
}

export function leagueHelp() {
    return Object.entries(LEAGUES).map(([k, v]) => `${k} (${v.name})`).join('\n│ ');
}

async function fetchJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: controller.signal });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

export function eatTime(iso) {
    try {
        return new Date(iso).toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}

export function eatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi', weekday: 'short', day: '2-digit', month: 'short' });
    } catch {
        return '';
    }
}

function todayEat() {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    return parts;
}

function parseEspnEvents(data) {
    const events = data?.events || [];
    return events.map(ev => {
        const comp = ev.competitions?.[0] || {};
        const competitors = comp.competitors || [];
        const home = competitors.find(c => c.homeAway === 'home') || competitors[0] || {};
        const away = competitors.find(c => c.homeAway === 'away') || competitors[1] || {};
        const state = ev.status?.type?.state || 'pre';
        return {
            home: home.team?.shortDisplayName || home.team?.displayName || 'Home',
            away: away.team?.shortDisplayName || away.team?.displayName || 'Away',
            homeScore: home.score ?? null,
            awayScore: away.score ?? null,
            state,
            clock: ev.status?.displayClock || '',
            detail: ev.status?.type?.shortDetail || '',
            date: ev.date
        };
    });
}

function parseTsdbEvents(data) {
    const events = data?.events || [];
    return events.map(ev => {
        const status = String(ev.strStatus || '').toLowerCase();
        let state = 'pre';
        if (/finish|ft|aet|pen/.test(status)) state = 'post';
        else if (/live|1st|2nd|half|extra/.test(status)) state = 'in';
        return {
            home: ev.strHomeTeam || 'Home',
            away: ev.strAwayTeam || 'Away',
            homeScore: ev.intHomeScore ?? null,
            awayScore: ev.intAwayScore ?? null,
            state,
            clock: ev.strProgress || '',
            detail: ev.strStatus || '',
            date: ev.strTimestamp ? `${ev.strTimestamp}Z` : (ev.dateEvent ? `${ev.dateEvent}T${ev.strTime || '00:00:00'}Z` : null)
        };
    });
}

export async function getScoreboard(league, dateStr) {
    if (league.espn) {
        const dateParam = dateStr ? `?dates=${dateStr.replace(/-/g, '')}` : '';
        const data = await fetchJson(`https://site.api.espn.com/apis/site/v2/sports/${league.sport}/${league.espn}/scoreboard${dateParam}`);
        const matches = parseEspnEvents(data);
        if (matches.length) return matches;
    }
    if (league.tsdb) {
        const day = dateStr || todayEat();
        const data = await fetchJson(`https://www.thesportsdb.com/api/v1/json/${TSDB_KEY}/eventsday.php?d=${day}&l=${league.tsdb}`);
        return parseTsdbEvents(data);
    }
    return [];
}

function eatDateOffset(offsetDays) {
    const d = new Date(Date.now() + offsetDays * 86400000);
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d).replace(/-/g, '');
}

async function espnRange(league, fromOffset, toOffset, state) {
    const seen = new Set();
    const out = [];
    for (let o = fromOffset; o <= toOffset; o++) {
        const data = await fetchJson(`https://site.api.espn.com/apis/site/v2/sports/${league.sport}/${league.espn}/scoreboard?dates=${eatDateOffset(o)}`);
        for (const m of parseEspnEvents(data)) {
            if (m.state !== state) continue;
            const k = `${m.home}|${m.away}|${m.date}`;
            if (seen.has(k)) continue;
            seen.add(k);
            out.push(m);
        }
    }
    return out;
}

async function tsdbRange(league, fromOffset, toOffset, state) {
    const seen = new Set();
    const out = [];
    for (let o = fromOffset; o <= toOffset; o++) {
        const day = eatDateOffset(o);
        const iso = `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}`;
        const data = await fetchJson(`https://www.thesportsdb.com/api/v1/json/${TSDB_KEY}/eventsday.php?d=${iso}&l=${league.tsdb}`);
        for (const m of parseTsdbEvents(data)) {
            if (m.state !== state) continue;
            const k = `${m.home}|${m.away}|${m.date}`;
            if (seen.has(k)) continue;
            seen.add(k);
            out.push(m);
        }
    }
    return out;
}

export async function getFixtures(league) {
    if (league.espn) {
        const matches = await espnRange(league, 0, 6, 'pre');
        if (matches.length) return matches;
    }
    if (league.tsdb) {
        const ranged = await tsdbRange(league, 0, 6, 'pre');
        if (ranged.length) return ranged;
        const data = await fetchJson(`https://www.thesportsdb.com/api/v1/json/${TSDB_KEY}/eventsnextleague.php?id=${league.tsdb}`);
        return parseTsdbEvents(data);
    }
    return [];
}

export async function getResults(league) {
    if (league.espn) {
        const matches = await espnRange(league, -6, 0, 'post');
        if (matches.length) return matches.reverse();
    }
    if (league.tsdb) {
        const ranged = await tsdbRange(league, -6, 0, 'post');
        if (ranged.length) return ranged.reverse();
        const data = await fetchJson(`https://www.thesportsdb.com/api/v1/json/${TSDB_KEY}/eventspastleague.php?id=${league.tsdb}`);
        return parseTsdbEvents(data);
    }
    return [];
}

function currentSeason() {
    const now = new Date();
    const y = now.getFullYear();
    return now.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

export async function getTable(league) {
    if (league.espn && league.sport === 'soccer') {
        const data = await fetchJson(`https://site.api.espn.com/apis/v2/sports/soccer/${league.espn}/standings`);
        const entries = data?.children?.[0]?.standings?.entries || [];
        if (entries.length) {
            return entries.map(e => {
                const stat = (n) => e.stats?.find(s => s.name === n)?.value ?? null;
                return {
                    rank: stat('rank'),
                    team: e.team?.displayName || e.team?.shortDisplayName || '?',
                    played: stat('gamesPlayed'),
                    wins: stat('wins'),
                    draws: stat('ties'),
                    losses: stat('losses'),
                    gf: stat('pointsFor'),
                    ga: stat('pointsAgainst'),
                    gd: stat('pointDifferential'),
                    points: stat('points'),
                    form: null
                };
            }).sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
        }
    }
    if (league.tsdb) {
        const data = await fetchJson(`https://www.thesportsdb.com/api/v1/json/${TSDB_KEY}/lookuptable.php?l=${league.tsdb}&s=${currentSeason()}`);
        const table = data?.table || [];
        return table.map(t => ({
            rank: Number(t.intRank) || null,
            team: t.strTeam || '?',
            played: t.intPlayed ?? null,
            wins: t.intWin ?? null,
            draws: t.intDraw ?? null,
            losses: t.intLoss ?? null,
            gf: t.intGoalsFor ?? null,
            ga: t.intGoalsAgainst ?? null,
            gd: t.intGoalDifference ?? null,
            points: t.intPoints ?? null,
            form: t.strForm || null
        })).sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
    }
    return [];
}

export function formatMatch(m) {
    if (m.state === 'post') {
        return `${m.home} ${m.homeScore ?? '-'} - ${m.awayScore ?? '-'} ${m.away} (FT)`;
    }
    if (m.state === 'in') {
        const clock = m.clock ? ` ${m.clock}` : '';
        return `🔴${clock} ${m.home} ${m.homeScore ?? 0} - ${m.awayScore ?? 0} ${m.away}`;
    }
    const when = m.date ? `${eatDate(m.date)} ${eatTime(m.date)}` : '';
    return `${m.home} vs ${m.away}${when ? ` — ${when}` : ''}`;
}
