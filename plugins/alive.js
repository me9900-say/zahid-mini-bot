const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');
const moment = require("moment-timezone");

let botStartTime = Date.now();

cmd({
    pattern: "alive",
    desc: "⚡ Check if bot is active",
    category: "main",
    react: "💡",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    try {
        await conn.sendMessage(from, {
            react: { text: "💡", key: m.key }
        });

        const pushname = m.pushName || "User";
        const currentTime = moment().tz("Africa/Kampala").format("hh:mm:ss A");
        const currentDate = moment().tz("Africa/Kampala").format("dddd, DD MMMM YYYY");

        const runtimeMs = Date.now() - botStartTime;
        const runtimeHours = Math.floor(runtimeMs / (1000 * 60 * 60));
        const runtimeMinutes = Math.floor((runtimeMs / (1000 * 60)) % 60);
        const runtimeSeconds = Math.floor((runtimeMs / 1000) % 60);

        // 🎨 Fancy Output with Box Design
        const msg = await conn.sendMessage(from, {
            text: `ᥫ᭡𝛧𝜜𝛪𝐷𝛪 𝛭𝐷 𝐵𝜣𝑇 𓆩 𝐀𝐋𝐈𝐕𝐄 𓆪 ⏤͟͟͞͞🧸🌷`
        }, { quoted: mek });

        await sleep(1500);

        const display = `╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷
┃❃╭──────────────
┃❃│ 👤 ${pushname}
┃❃│ ⏰ ${currentTime}
┃❃│ 📅 ${currentDate}
┃❃│ ⏳ ${runtimeHours}h ${runtimeMinutes}m ${runtimeSeconds}s
┃❃│ 🤖 Status: 🟢 Active
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʑɑ͢ı֟፝𝛛֟ı֟፝-ϻ֟͡𝛛֟`;

        await conn.relayMessage(from, {
            protocolMessage: {
                key: msg.key,
                type: 14,
                editedMessage: {
                    conversation: display
                }
            }
        }, {});

        await sleep(1000);

        // Send Image with Newsletter
        await conn.sendMessage(from, {
            image: { url: "https://up6.cc/2026/05/177971006919991.png" },
            caption: `✨ ${pushname}, Bot is Active!`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                mentionedJid: [m.sender],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363423196146172@newsletter",
                    newsletterName: "𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪",
                    serverMessageId: 2,
                },
            },
        }, { quoted: mek });

        await conn.sendMessage(from, {
            react: { text: "✨", key: m.key }
        });

    } catch (e) {
        console.error("Alive Error:", e);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply("❌ *Alive failed!*");
    }
});