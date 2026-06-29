const { cmd } = require('../zaidi');
const { getBuffer, sleep } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');

ffmpeg.setFfmpegPath(ffmpegPath);

// Helper: Download media from message
async function downloadMedia(conn, m) {
    // If it's a quoted message, use that
    const msg = m.quoted ? m.quoted : m;
    if (!msg.message) return null;

    const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage'];
    let mediaKey = null;
    let mediaData = null;

    for (const type of mediaTypes) {
        if (msg.message[type]) {
            mediaKey = type;
            mediaData = msg.message[type];
            break;
        }
    }

    if (!mediaKey) return null;

    // Download the media
    try {
        const buffer = await conn.downloadMediaMessage(msg);
        return { buffer, type: mediaKey, data: mediaData };
    } catch (e) {
        console.error('Download error:', e);
        return null;
    }
}

// Helper: Save buffer to temp file
function saveTempFile(buffer, ext) {
    const filename = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + '.' + ext);
    fs.writeFileSync(filename, buffer);
    return filename;
}

// Helper: Delete temp file
function deleteTempFile(filepath) {
    try {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    } catch (e) {}
}

// -------- Commands --------

// 1. Sticker to Image
cmd({
    pattern: "sticker2img",
    alias: ["s2i", "sticker2image"],
    react: "🖼️",
    desc: "Convert sticker to image (JPEG)",
    category: "converter",
    use: ".sticker2img (reply to a sticker)",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: "🖼️", key: m.key } });

        const media = await downloadMedia(conn, m);
        if (!media || media.type !== 'stickerMessage') {
            return reply('❌ *Reply to a sticker message!*');
        }

        const tempFile = saveTempFile(media.buffer, 'webp');
        const outputFile = tempFile.replace('.webp', '.jpg');

        await sharp(tempFile)
            .jpeg({ quality: 90 })
            .toFile(outputFile);

        await conn.sendMessage(from, {
            image: fs.readFileSync(outputFile),
            caption: '✅ *Sticker converted to image*'
        }, { quoted: mek });

        deleteTempFile(tempFile);
        deleteTempFile(outputFile);
        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error('Sticker2Img Error:', e);
        reply('❌ *Conversion failed!*');
    }
});

// 2. Image to Sticker
cmd({
    pattern: "img2sticker",
    alias: ["i2s", "image2sticker"],
    react: "🎭",
    desc: "Convert image to sticker (WebP)",
    category: "converter",
    use: ".img2sticker (reply to an image)",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: "🎭", key: m.key } });

        const media = await downloadMedia(conn, m);
        if (!media || media.type !== 'imageMessage') {
            return reply('❌ *Reply to an image message!*');
        }

        const tempFile = saveTempFile(media.buffer, 'jpg');
        const outputFile = tempFile.replace('.jpg', '.webp');

        await sharp(tempFile)
            .resize(512, 512, { fit: 'cover' })
            .webp({ quality: 80 })
            .toFile(outputFile);

        await conn.sendMessage(from, {
            sticker: fs.readFileSync(outputFile)
        }, { quoted: mek });

        deleteTempFile(tempFile);
        deleteTempFile(outputFile);
        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error('Img2Sticker Error:', e);
        reply('❌ *Conversion failed!*');
    }
});

// 3. Audio to Document
cmd({
    pattern: "audio2doc",
    alias: ["a2d", "audio2document"],
    react: "📄",
    desc: "Send audio as document",
    category: "converter",
    use: ".audio2doc (reply to an audio)",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: "📄", key: m.key } });

        const media = await downloadMedia(conn, m);
        if (!media || media.type !== 'audioMessage') {
            return reply('❌ *Reply to an audio message!*');
        }

        const ext = media.data.mimetype?.split('/')[1] || 'mp3';
        const tempFile = saveTempFile(media.buffer, ext);

        await conn.sendMessage(from, {
            document: fs.readFileSync(tempFile),
            mimetype: media.data.mimetype || 'audio/mpeg',
            fileName: `audio.${ext}`
        }, { quoted: mek });

        deleteTempFile(tempFile);
        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error('Audio2Doc Error:', e);
        reply('❌ *Conversion failed!*');
    }
});

// 4. Video to Audio
cmd({
    pattern: "video2audio",
    alias: ["v2a", "video2mp3"],
    react: "🎵",
    desc: "Extract audio from video",
    category: "converter",
    use: ".video2audio (reply to a video)",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: "🎵", key: m.key } });

        const media = await downloadMedia(conn, m);
        if (!media || media.type !== 'videoMessage') {
            return reply('❌ *Reply to a video message!*');
        }

        const tempFile = saveTempFile(media.buffer, 'mp4');
        const outputFile = tempFile.replace('.mp4', '.mp3');

        await new Promise((resolve, reject) => {
            ffmpeg(tempFile)
                .toFormat('mp3')
                .on('end', resolve)
                .on('error', reject)
                .save(outputFile);
        });

        await conn.sendMessage(from, {
            audio: fs.readFileSync(outputFile),
            mimetype: 'audio/mpeg'
        }, { quoted: mek });

        deleteTempFile(tempFile);
        deleteTempFile(outputFile);
        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error('Video2Audio Error:', e);
        reply('❌ *Conversion failed!*');
    }
});

// 5. Video to Document
cmd({
    pattern: "video2doc",
    alias: ["v2d", "video2document"],
    react: "📄",
    desc: "Send video as document",
    category: "converter",
    use: ".video2doc (reply to a video)",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: "📄", key: m.key } });

        const media = await downloadMedia(conn, m);
        if (!media || media.type !== 'videoMessage') {
            return reply('❌ *Reply to a video message!*');
        }

        const ext = media.data.mimetype?.split('/')[1] || 'mp4';
        const tempFile = saveTempFile(media.buffer, ext);

        await conn.sendMessage(from, {
            document: fs.readFileSync(tempFile),
            mimetype: media.data.mimetype || 'video/mp4',
            fileName: `video.${ext}`
        }, { quoted: mek });

        deleteTempFile(tempFile);
        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error('Video2Doc Error:', e);
        reply('❌ *Conversion failed!*');
    }
});

// 6. Audio to Video (with static image)
cmd({
    pattern: "audio2video",
    alias: ["a2v", "audio2mp4"],
    react: "🎬",
    desc: "Convert audio to video (with a static image)",
    category: "converter",
    use: ".audio2video (reply to an audio)",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: "🎬", key: m.key } });

        const media = await downloadMedia(conn, m);
        if (!media || media.type !== 'audioMessage') {
            return reply('❌ *Reply to an audio message!*');
        }

        const tempAudio = saveTempFile(media.buffer, 'mp3');
        const tempImage = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + '.jpg');
        // Create a simple black image
        await sharp({
            create: {
                width: 640,
                height: 360,
                channels: 3,
                background: { r: 0, g: 0, b: 0 }
            }
        })
        .jpeg()
        .toFile(tempImage);

        const outputFile = tempAudio.replace('.mp3', '.mp4');

        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(tempImage)
                .input(tempAudio)
                .outputOptions([
                    '-c:v libx264',
                    '-c:a aac',
                    '-shortest',
                    '-pix_fmt yuv420p'
                ])
                .on('end', resolve)
                .on('error', reject)
                .save(outputFile);
        });

        await conn.sendMessage(from, {
            video: fs.readFileSync(outputFile),
            caption: '✅ *Audio converted to video*'
        }, { quoted: mek });

        deleteTempFile(tempAudio);
        deleteTempFile(tempImage);
        deleteTempFile(outputFile);
        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error('Audio2Video Error:', e);
        reply('❌ *Conversion failed!*');
    }
});

// 7. URL Shortener (TinyURL) - Placeholder for API
cmd({
    pattern: "shorten",
    alias: ["tiny", "shorturl"],
    react: "🔗",
    desc: "Shorten a URL using TinyURL (API placeholder)",
    category: "converter",
    use: ".shorten <url>",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: "🔗", key: m.key } });

        const url = args[0];
        if (!url) {
            return reply('❌ *Please provide a URL to shorten!*\nExample: .shorten https://example.com');
        }

        // --- API PLACEHOLDER ---
        // You can replace this with your own API key or service
        // Example using TinyURL (free, no API key needed):
        const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);
        const shortUrl = response.data.trim();

        if (!shortUrl || shortUrl.includes('Error')) {
            return reply('❌ *Failed to shorten URL. Please check the URL and try again.*');
        }

        await conn.sendMessage(from, {
            text: `✅ *Shortened URL:*\n${shortUrl}`,
            quoted: mek
        });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error('Shorten Error:', e);
        reply('❌ *URL shortening failed!*');
    }
});

console.log('✅ Converter plugin loaded!');
