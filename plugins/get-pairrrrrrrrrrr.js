const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');
const axios = require('axios');

// ==================== PAIR COMMAND ====================
cmd({
    pattern: "pair",
    alias: ["getpair", "pairing", "clonebot"],
    react: "✅",
    desc: "Get pairing code for bot",
    category: "download",
    use: ".pair 92323***",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, isGroup, senderNumber }) => {
    try {
        await conn.sendMessage(from, {
            react: { text: "⏳", key: m.key }
        });

        // Extract phone number
        const phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');

        // Validate phone number
        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            const display = `╭═══ ❌ PAIR ═══⊷
┃❃╭──────────────
┃❃│ ❌ Invalid number!
┃❃│ 💡 Use: .pair 92323*******
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply(display);
        }

        // Get pairing code from API
        const response = await axios.get(`https://arslan-mini-bot-e4ec84c138eb.herokuapp.com/code?number=${encodeURIComponent(phoneNumber)}`);

        if (!response.data || !response.data.code) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply("❌ Failed to get pairing code. Try again.");
        }

        const pairingCode = response.data.code;

        // Send ONLY the code (for quick copy)
        await reply(pairingCode);

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (error) {
        console.error("Pair error:", error);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply("❌ Error occurred. Try again.");
    }
});

// ==================== PAIR2 COMMAND (Private Chat Only) ====================
cmd({
    pattern: "pair2",
    alias: ["getpair2", "reqpair", "clonebot2"],
    react: "📉",
    desc: "Get pairing code (private chat only)",
    category: "download",
    use: ".pair 92323XXX",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, isGroup, senderNumber }) => {
    try {
        await conn.sendMessage(from, {
            react: { text: "⏳", key: m.key }
        });

        // Check if in group
        if (isGroup) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply("❌ This command only works in private chat.");
        }

        // Extract phone number
        const phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');

        // Validate phone number
        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            const display = `╭═══ ❌ PAIR2 ═══⊷
┃❃╭──────────────
┃❃│ ❌ Invalid number!
┃❃│ 💡 Use: .pair 92323*******
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply(display);
        }

        // Get pairing code from API
        const response = await axios.get(`https://arslan-mini-bot-e4ec84c138eb.herokuapp.com/code?number=${encodeURIComponent(phoneNumber)}`);

        if (!response.data || !response.data.code) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply("❌ Failed to get pairing code. Try again.");
        }

        const pairingCode = response.data.code;

        // Send ONLY the code (for quick copy)
        await reply(pairingCode);

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (error) {
        console.error("Pair2 error:", error);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply("❌ Error occurred. Try again.");
    }
});