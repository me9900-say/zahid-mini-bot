const { cmd } = require('../zaidi');
const axios = require('axios');

// ===== TikTok SEARCH API (TikWM) =====
async function searchTikTok(query, count = 5) {
    try {
        const url = `https://tikwm.com/api/search?keywords=${encodeURIComponent(query)}&count=${count}`;
        const res = await axios.get(url);
        return res.data.data?.videos || [];
    } catch (e) {
        console.error("Search API Error:", e.message);
        return [];
    }
}

cmd({
    pattern: "ttsearch",
    alias: ["ts", "tiktoksearch", "tts"],
    desc: "Search TikTok videos and send top 5 results",
    category: "downloader",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, senderNumber }) => {

    // 1️⃣ Check query
    const query = args.join(' ');
    if (!query) {
        return reply("❌ Kuch search karo!\nExample: .ttsearch nisha pomi");
    }

    await reply(`⏳ *"${query}"* ke liye search ho raha hai...`);

    try {
        const videos = await searchTikTok(query, 5);

        if (!videos || videos.length === 0) {
            return reply(`❌ *"${query}"* ke liye koi video nahi mili.`);
        }

        // 2️⃣ Send first 5 videos
        const total = Math.min(videos.length, 5);
        await reply(`✅ *${total}* videos mil gaye! Bhej raha hoon...`);

        for (let i = 0; i < total; i++) {
            const video = videos[i];
            const title = video.title || 'No Title';
            const author = video.author?.username || 'Unknown';
            const playUrl = video.play;

            if (!playUrl) continue;

            try {
                await conn.sendMessage(from, {
                    video: { url: playUrl },
                    caption: `🎬 *Video ${i+1}/${total}*\n📝 *Title:* ${title.slice(0, 100)}${title.length > 100 ? '...' : ''}\n👤 *Author:* @${author}\n❤️ *Likes:* ${video.digg_count || 0}\n💬 *Comments:* ${video.comment_count || 0}`,
                    // Thumbnail optional: contextInfo ke sath nahi daal rahe, direct video bhej rahe
                }, { quoted: mek });

                // ✨ 1 second ka delay taake WhatsApp bot ko block na kare
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (sendErr) {
                console.error(`Video ${i+1} send failed:`, sendErr.message);
                // Agar ek fail ho toh agla send karo
                continue;
            }
        }

        // Agar koi video send nahi hui toh batado
        // (Already handled above, but just in case)
        // Final message optional:
        // await reply("✅ Sare videos bhej diye!");

    } catch (error) {
        console.error("TTSearch Error:", error);
        return reply("⚠️ Kuch gadbad ho gayi! Try again later.");
    }
});
