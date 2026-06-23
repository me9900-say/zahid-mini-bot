const { cmd } = require('../zaidi');
const axios = require('axios');

// Ultra Fast Internal Scraper
async function searchYouTube(query) {
    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl);
        const html = response.data;
        const match = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
        return match && match[1] ? `https://www.youtube.com/watch?v=${match[1]}` : null;
    } catch (e) {
        return null;
    }
}

cmd({
    pattern: "ytmp3",
    alias: ["song", "audio", "play"],
    desc: "🎵 Instant Download YouTube audio via Faizan API",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {

    try {
        if (!text) return reply("❌ *Please provide a song name or YouTube link!*");

        let videoUrl = text.trim();

        // Checking if text is query
        if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
            const foundUrl = await searchYouTube(videoUrl);
            if (foundUrl) {
                videoUrl = foundUrl;
            } else {
                return reply("❌ *Song not found!*");
            }
        }

        // Direct API request
        const apiUrl = `https://faizan-api.vercel.app/api/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || data.status !== true || !data.result || !data.result.download) {
            return reply("❌ *Server busy! Try again.*");
        }

        const songTitle = data.result.title || "YouTube Audio";
        const duration = data.result.duration ? `${data.result.duration}s` : "Unknown";
        const audioUrl = data.result.download;

        // Extract Video ID instantly
        const videoId = videoUrl.includes("youtu.be/") ? videoUrl.split("youtu.be/")[1].split("?")[0] : videoUrl.split("v=")[1]?.split("&")[0];
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://up6.cc/2026/05/177971006919991.png";

        // New Layout According to Your Requirement
        const infoMessage = `*${songTitle}*\n\n` +
                            `👤 *Channel:* YouTube Audio\n` +
                            `⏱ *Duration:* ${duration}\n` +
                            `👁 *Views:* Synchronizing...\n\n` +
                            `> ⚡𝐷𝜣𝑊𝜨𝐿𝜣𝜟𝐷 𝐵𝜳 𝛧𝜜𝛪𝐷𝛪 𝛭𝐷📂⚡`;

        // Step 1: Send Details Card with Image
        const sentInfo = await conn.sendMessage(from, {
            image: { url: thumbnailUrl },
            caption: infoMessage,
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

        // Step 2: Instant Stream Upload
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: sentInfo });

    } catch (e) {
        console.error(e);
    }
});
