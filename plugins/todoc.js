const { cmd } = require('../zaidi');

cmd({
  pattern: "todoc",
  desc: "Reply to any media (image, video, audio, voice, sticker) to send it as a document file.",
  category: "Converter",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    // Check if user replied to a message
    const quotedMsg = m.quoted || mek.quoted;
    if (!quotedMsg) {
      return reply("❌ Please reply to a media message (image, video, audio, voice, sticker) with .todoc");
    }

    let mediaBuffer = null;
    let mimeType = 'application/octet-stream';
    let fileName = `file_${Date.now()}.bin`;

    // ----- CHECK MEDIA TYPE -----
    if (quotedMsg.imageMessage) {
      mimeType = quotedMsg.imageMessage.mimetype || 'image/jpeg';
      const ext = mimeType.split('/')[1] || 'jpg';
      fileName = `image_${Date.now()}.${ext}`;
      mediaBuffer = await conn.downloadMediaMessage(quotedMsg);
    }
    else if (quotedMsg.videoMessage) {
      mimeType = quotedMsg.videoMessage.mimetype || 'video/mp4';
      const ext = mimeType.split('/')[1] || 'mp4';
      fileName = `video_${Date.now()}.${ext}`;
      mediaBuffer = await conn.downloadMediaMessage(quotedMsg);
    }
    else if (quotedMsg.audioMessage) {
      mimeType = quotedMsg.audioMessage.mimetype || 'audio/mpeg';
      const ext = mimeType.split('/')[1] || 'mp3';
      // Voice notes are also audio, we just rename them
      const isVoice = quotedMsg.audioMessage.ptt === true;
      fileName = isVoice ? `voice_${Date.now()}.${ext}` : `audio_${Date.now()}.${ext}`;
      mediaBuffer = await conn.downloadMediaMessage(quotedMsg);
    }
    else if (quotedMsg.stickerMessage) {
      mimeType = quotedMsg.stickerMessage.mimetype || 'image/webp';
      fileName = `sticker_${Date.now()}.webp`;
      mediaBuffer = await conn.downloadMediaMessage(quotedMsg);
    }
    else if (quotedMsg.documentMessage) {
      // Agar pehle se document hai toh bas rename karke resend kar dein
      mimeType = quotedMsg.documentMessage.mimetype || 'application/octet-stream';
      fileName = quotedMsg.documentMessage.fileName || `doc_${Date.now()}.pdf`;
      mediaBuffer = await conn.downloadMediaMessage(quotedMsg);
    }
    else {
      return reply("❌ Yeh media type support nahi hai. Sirf image, video, audio, voice, sticker ya document par reply karein.");
    }

    if (!mediaBuffer) {
      return reply("❌ Media download nahi ho saka. Shayad file bohot badi hai ya corrupt hai.");
    }

    // ----- SEND AS DOCUMENT -----
    await conn.sendMessage(
      from,
      {
        document: mediaBuffer,
        mimetype: mimeType,
        fileName: fileName
      },
      { quoted: m } // Original message ko quote karein
    );

  } catch (error) {
    console.error("TODOC Error:", error);
    reply(`❌ Error: ${error.message || 'Kuch to gadbad hai!'}`);
  }
});
