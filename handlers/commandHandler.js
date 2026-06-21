import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXTRA_ALIASES = {
  fbdl:       ['fb', 'facebook', 'fbvideo', 'fbdownload', 'facedown'],
  igdl:       ['ig', 'instagram', 'insta', 'igvideo', 'igdownload'],
  tomp3:       ['vid2audio', 'audio', 'videotoaudio', '2audio', 'toaudio'],
  tikdl:      ['tiktok', 'tik', 'tt', 'ttdl', 'tiktokvid'],
  tikaudio:   ['tikaudio', 'tikmp3', 'tiktokmp3', 'tikmusic'],
  twtdl:      ['twitter', 'tw', 'xdl', 'xvideo', 'tweet', 'twdl', 'x'],
  ytmp3:      ['ytaudio', 'ytmusic', 'youtubemp3', 'ytm3', 'yta'],
  ytmp4:      ['ytvideo', 'youtubevideo', 'ytv', 'ytmp4dl', 'youtube', 'ytv'],
  yt:         ['youtube', 'ytdl', 'ytdown'],
  yts:        ['ytsearch', 'ytsrch', 'yttitle', 'search', 'youtubesearch'],
  play:       ['ply', 'playy', 'pl', 'music', 'song'],
  video:      ['vid', 'videodl'],
  alldl:      ['alldl', 'anylink', 'universaldl'],
  igstory:    ['igstory', 'instastory'],
  spotify:    ['spotifydl', 'spoti', 'spt', 'spotifysong'],
  soundcloud: ['scdl', 'sc', 'soundclouddl'],
  pinterest:  ['pin', 'pinterestimg', 'pindl', 'pint'],
  mediafire:  ['mf', 'mfiredl', 'medfire'],
  gitclone:   ['gclone', 'gitdown', 'clonegit'],
  capcut:     ['cap', 'capcutdl'],
  threads:    ['threadsdl', 'tdl'],
  bilibili:   ['bili', 'bilibilitv', 'bvideo', 'bvdl'],
  snackvideo: ['snack', 'snackvid', 'sck'],
  apk:        ['apkdown', 'apkdl', 'app'],
  shazam:     ['identify', 'songid', 'detectsong', 'whatmusic', 'findmusic', 'fmusic', 'getmusic', 'gmusic'],
  blocklist:  ['listblock', 'lb', 'blockedlist', 'myblocked'],
  sticker:    ['s', 'stk', 'stkr', 'make'],
  toimg:      ['toimage', 'stickertoimg', 'stkimg'],
  attp:       ['attp', 'textsticker'],
  promote:    ['makeadmin', 'addadmin', 'promoteuser', 'addadmin'],
  demote:     ['unadmin', 'removeadmin', 'deadmin', 'demoteuser', 'dall'],
  remove:     ['kick', 'removemember', 'removefrom', 'yeet', 'boot', 'k'],
  add:        ['addmember', 'adduser'],
  link:       ['invitelink', 'grouplink', 'gclink', 'invite', 'linkgc', 'linkgroup'],
  revoke:     ['resetlink', 'revokelink', 'newlink', 'reset'],
  tagall:     ['all', 'everyone', 'mention', 'mentionall'],
  tagadmins:  ['admins', 'calladmins', 'mentionadmins', 'tagadminto'],
  warn:       ['warns', 'warnlist'],
  close:      ['mute', 'mutegroup'],
  open:       ['unmute', 'unmutegroup', 'opengroup'],
  fetch:      ['get', 'web', 'curl', 'url', 'http', 'https'],
  ping:       ['p', 'speed', 'latency', 'response', 'pong', 'px'],
  menu:       ['commands', 'list', 'cmds', 'm'],
  start:      ['alive', 'online', 'toxic'],
  help:       ['h', 'info', 'usage'],
  eval:       ['ev', 'evl'],
  shell:      ['sh', 'bash', 'terminal', 'exec'],
  restart:    ['reboot', 'rs', 'redeploy', 'update'],
  stickerwm:  ['wm', 'watermark', 'stickermark'],
  tr:         ['translate', 'tl', 'trans', 'trt'],
  togif:      ['tomp4', 'giftomp4'],
  gpt:        ['chatgpt', 'openai', 'ai'],
  gemini:     ['bard', 'google-ai'],
  groq:       ['groqai'],
  image:      ['img', 'pic', 'searchimage', 'imgsearch'],
  google:     ['gsearch', 'googlesearch'],
  wiki:       ['wikipedia', 'wikisearch', 'wp'],
  lyrics:     ['lyric', 'songlyrics', 'lrc'],
  movie:      ['film', 'imdb', 'movieinfo'],
  github:     ['gh', 'git', 'gitinfo'],
  npm:        ['npminfo', 'nodepackage'],
  wallpaper:  ['wallpaperimg', 'bgimage'],
  uptime:     ['up', 'ut', 'servertime', 'runtime', 'botuptime', 'howlong'],
  profile:    ['me', 'myprofile', 'getpp', 'whois'],
  settings:   ['config', 'botconfig', 'botsettings', 'mysettings', 'setting', 'setup', 'bset'],
  ban:        ['blacklist', 'banuser'],
  unban:      ['whitelist', 'unbanuser'],
  broadcast:  ['bc', 'announce'],
  block:      ['blockuser', 'blk', 'die'],
  unblock:    ['unblockuser', 'ublk'],
  joingc:     ['join', 'joingroup'],
  leavegc:    ['leave', 'leavegroup', 'left'],
  del:        ['delete', 'd'],
  screenshot: ['ss', 'ssweb'],
  retrieve:   ['vv', 'xd', 'rvo'],
  checkid:    ['id', 'cekid', 'idch'],
  fullpp:     ['pp', 'setpp', 'setprofile'],
  kill:       ['kickall'],
  botgc:      ['groups', 'listgroup', 'listgroups', 'totalgroup', 'tg', 'lg'],
  darkgpt:    ['wormgpt', 'worm'],
  toghibli:   ['ghibli'],
  clear:      ['clearchat', 'wipe'],
  pin:        ['pinmsg', 'unpin'],
  oadmin:     ['admin'],
  prefix:     ['setprefix'],
  getcmd:     ['cmd'],
  telesticker:['ts'],
  autoview:   ['autoviewstatus', 'view', 'autostatus', 'statusview'],
  anticall:   ['callprivacy', 'callpriv', 'nocall', 'callblock'],
  antidelete: ['antidel', 'nodel', 'savedel', 'recoverdelete'],
  antiedit:   ['antied', 'noedit', 'trackedit', 'edittrack'],
  antiviewonce: ['viewonce', 'vo', 'antionce', 'avoice', 'viewonceprotect'],
  autolike:   ['autolik', 'autoreact', 'statuslike', 'likeall'],
  autoread:   ['autotick', 'automark', 'autoblue', 'readall'],
  autobio:    ['bio', 'setbio', 'updatebio', 'autobio'],
  stealth:    ['ghost', 'invisible', 'stealthmode', 'hideme'],
  multiprefix: ['multipfx', 'multipref', 'allprefix', 'anyprefix'],
  antitag:    ['notag', 'tagprot', 'tagprotect', 'blocktag'],
  antiforeign: ['foreign', 'antifor', 'foreignblock', 'kickforeign'],
  gcpresence: ['gcpres', 'groupstatus', 'grouppresence', 'gcp'],
  chatbotpm:  ['chatbot', 'aipm', 'pmbot', 'dmai'],
  autoai:     ['aireply', 'smartai', 'aimode', 'airespond'],
  presence:   ['setpres', 'onlinestatus', 'setstatus', 'setonline'],
  reaction:   ['setemoji', 'likeemoji', 'statusemoji', 'reactemoji'],
  stickerwm:  ['stickerpack', 'stickername', 'packname'],
  stats:      ['stat', 'botstats', 'botstat', 'statistics', 'botinfo'],
  messageprivacy: ['msgprivacy'],
  addsudo:    ['addowner'],
  delsudo:    ['delowner'],
  promoteall: ['pall'],
  demoteall:  ['dall'],
  reaction:   ['reactemoji'],
  xreact:     ['rch'],
  listonline: ['whoonline', 'onlinemembers', 'activemembers'],
  approve: ['approveall'],
  warncount:  ['wc', 'warns'],
  resetwarn:  ['rw', 'clearwarn'],
  setwarncount: ['swc', 'setwarn', 'warnlimit'],
  mode:       ['botmode', 'setmode'],
  device:     ['setdevice', 'devicemode', 'platform', 'deviceset', 'setplatform'],
  upx:        ['ghupload', 'uploadmedia'],
  upload:     ['tourl', 'mediaurl', 'geturl', 'fileurl'],
  base64:     ['tobase64', 'b64', 'encode64', 'unbase64', 'debase64', 'frombase64', 'decode64', 'b64decode'],
  ngc:          ['newgc', 'groupcreate', 'creategc', 'newgroup', 'creategroup'],
  ginfo:        ['groupinfo', 'gcinfo', 'groupmeta', 'gmetadata', 'gcmeta'],
  wabot:        ['addaibot', 'addwabot', 'gcaibot', 'addwhatsappbot'],
  disappearing: ['disappear', 'disap', 'dsp', 'gvanish', 'timer', 'ephemeral', 'vanish', 'gcvanish'],
  setwelcome:   ['welcomemsg', 'customwelcome', 'setwelcomemsg'],
  setgoodbye:   ['goodbyemsg', 'customgoodbye', 'setgoodbyemsg'],
  blockgc:      ['bangc', 'silencegc', 'mutegc'],
  unblockgc:    ['ungc', 'unbangc', 'unsilencegc'],
  blockedgcs:   ['listblockedgc', 'bannedgcs', 'blockedgroups'],
  trustlink:    ['addtrustedlink', 'allowlink', 'whitelistlink'],
  untrustlink:  ['removetrustedlink', 'disallowlink', 'unwhitelistlink'],
  trustlist:    ['listtrusted', 'trustedlinks', 'allowedlinks'],
  crm:          ['compile', 'tojs', 'getjson'],
  run:          ['resend', 'rerun', 'insp', 'inspect'],
  vupdate:      ['vup', 'selfupdate', 'gitupdate'],
  cloneweb:     ['clone', 'webclone', 'getsource'],
  'crm-snip':   ['crmsnip', 'snip', 'csnip'],
  'crm-cmd':    ['crmcmd', 'tocmd', 'ccmd'],
  addcmd:       ['newcmd', 'savecmd', 'createcmd'],
  delcmd:       ['delcommand', 'rmcmd', 'removecmd'],
  setmention:   ['sm', 'setm'] };

function fixPluginFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fixPluginFiles(filePath);
      } else if (file.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;
        newContent = newContent.replace(/^[ \t]+import /gm, 'import ');
        newContent = newContent.replace(/^[ \t]+export default /gm, 'export default ');
        newContent = newContent.replace(/^[ \t]+export /gm, 'export ');
        if (newContent !== content) {
          fs.writeFileSync(filePath, newContent);
        }
      }
    }
  } catch(e) {}
}

const pluginsPath = path.join(__dirname, '..', 'plugins');
if (fs.existsSync(pluginsPath)) {
  fixPluginFiles(pluginsPath);
}

export const commands = {};
export const aliases = {};

export let totalCommands = 0;

export const commandsReady = (async () => {
  const pluginsPath = path.join(__dirname, '..', 'plugins');

  if (!fs.existsSync(pluginsPath)) {
    console.log('Plugins folder not found');
    return;
  }

  async function loadPlugins(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        await loadPlugins(filePath);
      } else if (file.endsWith('.js')) {
        try {
          const plugin = await import(`file://${filePath}`);
          const cmd = plugin.default;

          if (Array.isArray(cmd)) {
            for (const singleCmd of cmd) {
              if (singleCmd && singleCmd.name && typeof singleCmd.run === 'function') {
                commands[singleCmd.name] = singleCmd.run;
                totalCommands++;
                const allAliases = [...(singleCmd.aliases || []), ...(singleCmd.alias || []), ...(EXTRA_ALIASES[singleCmd.name] || [])];
                for (const alias of allAliases) {
                  if (!aliases[alias]) aliases[alias] = singleCmd.name;
                }
              }
            }
          } else if (typeof cmd === 'function') {
            const commandName = path.basename(file, '.js');
            commands[commandName] = cmd;
            totalCommands++;
            const allAliases = [...(EXTRA_ALIASES[commandName] || [])];
            for (const alias of allAliases) {
              if (!aliases[alias]) aliases[alias] = commandName;
            }
          } else if (cmd && cmd.name && typeof cmd.run === 'function') {
            commands[cmd.name] = cmd.run;
            totalCommands++;
            const allAliases = [...(cmd.aliases || []), ...(cmd.alias || []), ...(EXTRA_ALIASES[cmd.name] || [])];
            for (const alias of allAliases) {
              if (!aliases[alias]) aliases[alias] = cmd.name;
            }
          }
        } catch (e) {
          console.log(`Failed to load plugin ${file}:`, e.message);
        }
      }
    }
  }

  await loadPlugins(pluginsPath);
})();
