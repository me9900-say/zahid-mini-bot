const { cmd } = require('../zaidi');
const axios = require('axios');

// Internal Scraper to convert Song Name to YouTube Link seamlessly
async function searchYouTube(query) {
    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const html = response.data;
        const match = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
        return match && match[1] ? `https://www.youtube.com/watch?v=${match[1]}` : null;
    } catch (e) {
        console.error("Internal Search Error:", e);
        return null;
    }
}

cmd({
    pattern: "ytmp3",
    alias: ["song", "audio", "play"],
    desc: "🎵 Download YouTube audio via Faizan Custom API",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {

    try {
        if (!text) return reply("❌ *Please provide a song name or YouTube link!*");

        let videoUrl = text.trim();

        // Check if input is a name query, if so, extract video link
        if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
            const foundUrl = await searchYouTube(videoUrl);
            if (foundUrl) {
                videoUrl = foundUrl;
            } else {
                return reply("❌ *Song not found! Please try with better keywords.*");
            }
        }

        // Requesting your provided working Faizan API
        const apiUrl = `https://faizan-api.vercel.app/api/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Validation based on your verified JSON output
        if (!data || data.status !== true || !data.result || !data.result.download) {
            return reply("❌ *Failed to fetch download link from the current API route.*");
        }

        const songTitle = data.result.title || "YouTube Audio";
        const duration = data.result.duration ? `${data.result.duration}s` : "Unknown";
        const audioUrl = data.result.download;

        // Extract Video ID for high quality Thumbnail generation
        const videoId = videoUrl.includes("youtu.be/") ? videoUrl.split("youtu.be/")[1].split("?")[0] : videoUrl.split("v=")[1]?.split("&")[0];
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://up6.cc/2026/05/177971006919991.png";

        // Step 1: Send Information with Visual Thumbnail
        const infoText = `*🎵 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 𝘠𝘖𝘜𝘛𝘜𝘉𝘌 𝘈𝘜𝘋𝘐𝘖*\n\n` +
                         `*📌 Title:* ${songTitle}\n` +
                         `*⏱️ Duration:* ${duration}\n\n` +
                         `*⏳ Sending audio file, please wait...*\n\n` +
                         `*> Powered by ZAIDI MDᥫ᭡`;

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

        // Step 2: Send Audio file directly quoting the info card
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            ptt: false
        }, { quoted: sentInfo });

    } catch (e) {
        console.error("YT-MP3 Custom Downloader Error:", e);
        reply("❌ *An error occurred while downloading the audio file.*");
    }
});
