export async function before(shizo, { isAdmin: izshizoAdmin, isBotAdmin: izshizoBotAdmin, conn }) {
  try {
    const likeEmoji = process.env.AUTO_STATUS_LIKE_EMOJI || "☣️";

    if (!shizo || shizo.key.remoteJid !== 'status@broadcast') {
      return false;
    }

    if (shizo.key.remoteJid === "status@broadcast") {
      const shizoZteamzex = await conn.decodeJid(conn.user.id);
      await conn.sendMessage(shizo.key.remoteJid, {
        react: {
          key: shizo.key,
          text: likeEmoji,
        },
      }, {
        statusJidList: [shizo.key.participant, shizoZteamzex],
      });
    }

    if (process.env.Status_Saver !== 'true') {
      console.log("Status Saver is disabled.");
      return false;
    }

    this.story = this.story || [];
    const { mtype: shizotype, sender: shizosender } = shizo;

    console.log("Received message object:", JSON.stringify(shizo, null, 2));
    if (!shizosender) {
      console.error("Sender is null or undefined");
      return false;
    }

    const teamzexdeveloper = conn.getName(shizosender) || "Unknown";
    console.log("Bot ID:", conn.user.id);

    let teamzexshizo = '';
    const developershizo = Buffer.from("c2hpem8gc3RvcnkgcmVhY3Rpb24=", "base64").toString("utf-8");

    if (shizotype === 'imageMessage' || shizotype === "videoMessage") {
      teamzexshizo = `${developershizo}\n*mmm*\n\n*🩵Status:* ${teamzexdeveloper}\n*🩵Caption:* ${shizo.caption || ''}`;
      await conn.copyNForward(conn.user.id, shizo, true);
      await this.reply(conn.user.id, teamzexshizo, shizo, { mentions: [shizosender] });
      this.story.push({
        type: shizotype,
        quoted: shizo,
        sender: shizosender,
        caption: teamzexshizo,
        buffer: shizo,
      });
    } else if (shizotype === 'audioMessage') {
      teamzexshizo = `${developershizo}\n\n*🩵Status:* ${teamzexdeveloper}`;
      await conn.copyNForward(conn.user.id, shizo, true);
      await this.reply(conn.user.id, teamzexshizo, shizo, { mimetype: shizo.mimetype });
      this.story.push({
        type: shizotype,
        quoted: shizo,
        sender: shizosender,
        buffer: shizo,
      });
    } else if (shizotype === "extendedTextMessage") {
      teamzexshizo = `${developershizo}*\n\n${shizo.text || ''}`;
      await this.reply(conn.user.id, teamzexshizo, shizo, { mentions: [shizosender] });
      this.story.push({
        type: shizotype,
        quoted: shizo,
        sender: shizosender,
        message: teamzexshizo,
      });
    } else if (shizo.quoted) {
      await conn.copyNForward(conn.user.id, shizo.quoted, true);
      await conn.sendMessage(shizo.chat, teamzexshizo, { quoted: shizo });
    } else {
      console.log("Unsupported message type or empty message.");
      return false;
    }

    if (process.env.STATUS_REPLY && process.env.STATUS_REPLY.toLowerCase() === "true") {
      const shizotext = process.env.STATUS_MSG || "Story viewedby bot";
      console.log("Sending status reply to sender:", shizotext);
      const shizoquoted = {
        key: {
          remoteJid: 'status@broadcast',
          id: shizo.key.id,
          participant: shizosender,
        },
        message: shizo.message,
      };
      await conn.sendMessage(shizosender, { text: shizotext }, { quoted: shizoquoted });
    }
  } catch (shizozex) {
    console.error("Failed to process message:", shizozex.message || "Unknown error");
    if (shizo.quoted && shizo.quoted.text) {
      await shizo.reply(shizo.quoted.text);
    } else {
      await this.reply(conn.user.id, "Failed to process message: " + (shizozex.message || "Unknown error"), shizo, { mentions: [shizosender] });
    }
  }

  return true;
}
