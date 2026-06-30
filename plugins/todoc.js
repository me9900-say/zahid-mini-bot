const { cmd } = require('../zaidi');

// Helper function to extract media from current message or quoted message
function extractMedia(msg) {
  try {
    // Check if the current message itself is a media message
    if (msg.imageMessage) return { type: 'image', media: msg.imageMessage };
    if (msg.videoMessage) return { type: 'video', media: msg.videoMessage };
    if (msg.audioMessage) return { type: 'audio', media: msg.audioMessage };
    if (msg.stickerMessage) return { type: 'sticker', media: msg.stickerMessage };
    if (msg.documentMessage) return { type: 'document', media: msg.documentMessage };

    // Check if the current message has a quoted message (reply)
    if (msg.quoted) {
      const q = msg.quoted;
      if (q.imageMessage) return { type: 'image', media: q.imageMessage };
      if (q.videoMessage) return { type: 'video', media: q.videoMessage };
      if (q.audioMessage) return { type: 'audio', media: q.audioMessage };
      if (q.stickerMessage) return { type: 'sticker', media: q.stickerMessage };
      if (q.documentMessage) return { type: 'document', media: q.documentMessage };
    }

    // Agar message extendedText hai (caption wali image ke case mein)
    // Baaz frameworks mein imageMessage andar hota hai
    if (msg.message) {
      if (msg.message.imageMessage) return { type: 'image', media: msg.message.imageMessage };
      if (msg.message.videoMessage) return { type: 'video', media: msg.message.videoMessage };
      if (msg.message.audioMessage) return { type: 'audio', media: msg.message.audioMessage };
      if (msg.message.stickerMessage) return { type: 'sticker', media: msg.message.stickerMessage };
      if (msg.message.documentMessage) return { type: 'document', media: msg.message.documentMessage };
      
      // quoted inside message
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted) {
        if (quoted.imageMessage) return { type: 'image', media: quoted.imageMessage };
        if (quoted.videoMessage) return { type: 'video', media: quoted.videoMessage };
        if (quoted.audioMessage) return { type: 'audio', media: quoted.audioMessage };
        if (quoted.stickerMessage) return { type: 'sticker', media: quoted.stickerMessage };
        if (quoted.documentMessage) return { type: 'document', media: quoted.documentMessage };
      }
    }

    return null;
  } catch (e) {
    console.log("Extract error:", e);
    return null;
  }
}

cmd({
  pattern: "todoc",
  desc: "Convert any media (image, video, audio, voice, sticker) to document. Use as caption or reply.",
  category: "tools",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    // Extract media from the message
    const mediaData = extractMedia(m);

    if (!mediaData) {
      return reply("❌ Koi media nahi mila. Image, video, audio, voice ya sticker bhejein (caption me .todoc likhein) ya kisi media ko reply karein.");
    }

    const { type, media } = mediaData;
    let mimeType = 'application/octet-stream';
    let fileName = `file_${Date.now()}.bin`;

    // Set filename and mimetype based on type
    switch (type) {
      case 'image':
        mimeType = media.mimetype || 'image/jpeg';
        const imgExt = mimeType.split('/')[1] || 'jpg';
        fileName = `image_${Date.now()}.${imgExt}`;
        break;
      case 'video':
        mimeType = media.mimetype || 'video/mp4';
        const vidExt = mimeType.split('/')[1] || 'mp4';
        fileName = `video_${Date.now()}.${vidExt}`;
        break;
      case 'audio':
        mimeType = media.mimetype || 'audio/mpeg';
        const audExt = mimeType.split('/')[1] || 'mp3';
        const isVoice = media.ptt === true;
        fileName = isVoice ? `voice_${Date.now()}.${audExt}` : `audio_${Date.now()}.${audExt}`;
        break;
      case 'sticker':
        mimeType = media.mimetype || 'image/webp';
        fileName = `sticker_${Date.now()}.webp`;
        break;
      case 'document':
        mimeType = media.mimetype || 'application/octet-stream';
        fileName = media.fileName || `doc_${Date.now()}.pdf`;
        break;
      default:
        return reply("❌ Unknown media type.");
    }

    // Download the media
    const mediaBuffer = await conn.downloadMediaMessage(media);
    if (!mediaBuffer) {
      return reply("❌ Media download nahi ho saka (shayad file size 100MB se zyada hai)");
    }

    // Send as document
    await conn.sendMessage(
      from,
      {
        document: mediaBuffer,
        mimetype: mimeType,
        fileName: fileName
      },
      { quoted: m }
    );

  } catch (error) {
    console.error("TODOC Error:", error);
    reply(`❌ Error: ${error.message || 'Kuch to gadbad hai!'}`);
  }
});
