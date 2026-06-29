const { cmd } = require("../zaidi");

cmd({
  pattern: "view",
  fromMe: false,
  desc: "Forward view-once media as normal",
  react: "📤",
  filename: __filename
}, async (client, mek, m, { reply, sender, from }) => {
  const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted) return reply("❌ Kisi view‑once message ko reply karke `view` likhein.");

  let media = null;
  let type = "";

  // 1️⃣ ViewOnceV2 (latest)
  if (quoted.viewOnceMessageV2) {
    const inner = quoted.viewOnceMessageV2.message;
    if (inner.imageMessage) {
      media = inner.imageMessage;
      type = "image";
    } else if (inner.videoMessage) {
      media = inner.videoMessage;
      type = "video";
    } else if (inner.audioMessage) {
      media = inner.audioMessage;
      type = "audio";
    }
  }
  // 2️⃣ ViewOnce (older)
  else if (quoted.viewOnceMessage) {
    const inner = quoted.viewOnceMessage.message;
    if (inner.imageMessage) {
      media = inner.imageMessage;
      type = "image";
    } else if (inner.videoMessage) {
      media = inner.videoMessage;
      type = "video";
    } else if (inner.audioMessage) {
      media = inner.audioMessage;
      type = "audio";
    }
  }
  // 3️⃣ Normal media (if user mistakenly uses command)
  else {
    if (quoted.imageMessage) {
      media = quoted.imageMessage;
      type = "image";
    } else if (quoted.videoMessage) {
      media = quoted.videoMessage;
      type = "video";
    } else if (quoted.audioMessage) {
      media = quoted.audioMessage;
      type = "audio";
    }
  }

  if (!media) return reply("❌ Yeh view‑once media nahi hai.");

  // Send as normal message
  const msg = {
    [type]: { url: media.url },
    caption: media.caption || ""
  };

  await client.sendMessage(sender, msg);
  await reply("✅ Media forward kar diya (bina view‑once).");
});
