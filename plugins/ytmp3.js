const { cmd } = require('../zaidi');
const axios = require('axios');

cmd({
    pattern: "play",
    alias: ["song", "naat", "ytmp3", "audio"],
    desc: "🎵 Search and download YouTube audio via Faizan API",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {

    try {
        if (!text) return reply("❌ *Please provide a song name or YouTube link!*");

        let videoUrl = text.trim();

        // Agar user link nahi deta balki song name likhta hai, toh search API se link nikalenge
        if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
            const searchRes = await axios.get(`https://api.giftedtech.my.id/api/download/playaudio?search=${encodeURIComponent(text)}`);
            if (searchRes.data && searchRes.data.result && searchRes.data.result.url) {
                videoUrl = searchRes.data.result.url;
            } else {
                return reply("❌ *Song not found! Please try with accurate keywords.*");
            }
        }

        // Requesting Faizan YouTube Downloader API (Format: mp3)
        const apiUrl = `https://faizan-api.vercel.app/api/ytdown?url=${encodeURIComponent(videoUrl)}&format=mp3`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Validation based on your given JSON structure
        if (!data || data.success !== true || !data.downloadURL) {
            return reply("❌ *Failed to fetch download link from Faizan API!*");
        }

        const songTitle = data.title || "YouTube Audio";
        const audioUrl = data.downloadURL;

        // Step 1: Send Information with Thumbnail
        // Auto generic thumbnail generation from video URL for layout stability
        const videoId = videoUrl.includes("youtu.be/") ? videoUrl.split("youtu.be/")[1].split("?")[0] : videoUrl.split("v=")[1]?.split("&")[0];
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://up6.cc/2026/05/177971006919991.png";

        const infoText = `*🎵 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 𝘠𝘖𝘜𝘛𝘜𝘉𝘌 𝘗𝘓𝘈𝘠*\n\n` +
                         `*📌 Title:* ${songTitle}\n\n` +
                         `*⏳ Sending audio file, please wait...*\n\n` +
                         `*> 𝐷𝜣𝑊𝜨𝐿𝜣𝜟𝐷 𝐵𝜳 𝛧𝜜𝛪𝐷𝛪 𝛭𝐷📂`;

        const sentInfo = await conn.sendMessage(from, {
            image: { url: thumbnailUrl },
            caption: infoText,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363423196146172@newsletter",
                    newsletterName: "𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪",
                    serverMessageId: 2,
                },
            },
        }, { quoted: m });

        // Step 2: Send Audio by quoting the above Info Message
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            ptt: false
        }, { quoted: sentInfo });

    } catch (e) {
        console.error("Play Downloader Error:", e);
        reply("❌ *An error occurred while downloading the audio.*");
    }
});
