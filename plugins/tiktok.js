const { cmd } = require('../zaidi');
const axios = require('axios');

cmd({
    pattern: "tiktok",
    alias: ["tt", "ttdl", "tiktokdl"],
    desc: "📥 Download TikTok videos without watermark",
    category: "download",
    react: "📥",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {

    try {
        // Checking if URL is provided
        if (!args[0]) return reply("❌ *Please provide a TikTok video link!*");
        if (!args[0].includes("tiktok.com")) return reply("❌ *Invalid URL! Please provide a valid TikTok link.*");

        // Requesting Arslan API
        const apiUrl = `https://arslan-apis-v2.vercel.app/download/tiktokdl?url=${encodeURIComponent(args[0])}`;
        const response = await axios.get(apiUrl);
        
        const data = response.data;
        
        // Check if API returned success and has video data
        if (!data || !data.result || !data.result.video) {
            return reply("❌ *Failed to fetch video! Try again later.*");
        }

        const videoUrl = data.result.video;
        const videoTitle = data.result.title || "TikTok Video";

        // Direct Single Message: Send Video with caption and newsletter context
        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: `*📥 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 𝘛𝘐𝘒𝘛𝘖𝘒 𝘋𝘖𝘞𝘕𝘓𝘖𝘈𝘋𝘌𝘙*\n\n*📌 Title:* ${videoTitle}\n\n*> Powered by ZAIDI MDᥫ᭡`,
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

    } catch (e) {
        console.error("TikTok Downloader Error:", e);
        reply("❌ *An error occurred while downloading the video.*");
    }
});
