const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');
const config = require('../config');

// ============================================================
// 👑 VV - OWNER ONLY (Sends to Owner's Inbox)
// ============================================================
cmd({
    pattern: "vv",
    alias: ["viewonce", "view", "open"],
    react: "🥺",
    desc: "Retrieve view-once media (Owner only)",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    try {
        await conn.sendMessage(from, {
            react: { text: "🥺", key: m.key }
        });

        if (!isCreator) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply("❌ *YEH COMMAND SIRF BOT OWNER KE LIYE HAI 😎*");
        }

        if (!m.quoted) {
            const display = `╭═══ 🥺 VIEW ONCE ═══⊷
┃❃╭──────────────
┃❃│ ❌ Kisi view once media ko reply karo!
┃❃│ 💡 Use: .vv (reply to view once)
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply(display);
        }

        // 🔥 VIEW ONCE FIX
        let quotedMsg = m.quoted;
        let msg = quotedMsg.message;

        if (msg?.viewOnceMessageV2) {
            msg = msg.viewOnceMessageV2.message;
        } else if (msg?.viewOnceMessageV2Extension) {
            msg = msg.viewOnceMessageV2Extension.message;
        }

        const type = Object.keys(msg)[0];
        const buffer = await quotedMsg.download();

        let content = {};

        if (type === "imageMessage") {
            content = {
                image: buffer,
                caption: quotedMsg.text || "📸 View Once Image"
            };
        } else if (type === "videoMessage") {
            content = {
                video: buffer,
                caption: quotedMsg.text || "🎥 View Once Video"
            };
        } else if (type === "audioMessage") {
            content = {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: false
            };
        } else {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply("❌ *YE VIEW ONCE MEDIA SUPPORT NAHI KARTA 🥺*");
        }

        // 📤 Send to owner's inbox
        const ownerNumber = config.OWNER_NUMBER || "923237045919";
        const ownerJid = ownerNumber + "@s.whatsapp.net";

        await conn.sendMessage(ownerJid, content, { quoted: mek });

        const done = `╭═══ ✅ VIEW ONCE ═══⊷
┃❃╭──────────────
┃❃│ ✅ Media retrieved successfully!
┃❃│ 📤 Sent to owner inbox
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await conn.sendMessage(from, {
            text: done
        }, { quoted: mek });

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (e) {
        console.log("VV ERROR:", e);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply("❌ *VIEW ONCE OPEN KARNE ME ERROR AYA 🥺*");
    }
});

// ============================================================
// 🔥 VV2 - PUBLIC VERSION (Sends to User's DM)
// ============================================================
cmd({
    pattern: "vv2",
    alias: ["viewonce2", "getmedia"],
    react: "👁️",
    desc: "Get view once media in your DM (Public)",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, {
            react: { text: "👁️", key: m.key }
        });

        if (!m.quoted) {
            const display = `╭═══ 👁️ VIEW ONCE ═══⊷
┃❃╭──────────────
┃❃│ ❌ Kisi view once media ko reply karo!
┃❃│ 💡 Use: .vv2 (reply to view once)
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply(display);
        }

        let quotedMsg = m.quoted;
        let msg = quotedMsg.message;

        if (msg?.viewOnceMessageV2) {
            msg = msg.viewOnceMessageV2.message;
        } else if (msg?.viewOnceMessageV2Extension) {
            msg = msg.viewOnceMessageV2Extension.message;
        }

        const type = Object.keys(msg)[0];
        const buffer = await quotedMsg.download();

        let content = {};

        if (type === "imageMessage") {
            content = {
                image: buffer,
                caption: quotedMsg.text || "📸 View Once Image"
            };
        } else if (type === "videoMessage") {
            content = {
                video: buffer,
                caption: quotedMsg.text || "🎥 View Once Video"
            };
        } else if (type === "audioMessage") {
            content = {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: false
            };
        } else {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply("❌ *YE VIEW ONCE MEDIA SUPPORT NAHI KARTA 🥺*");
        }

        // 📤 Send to user's DM (who used the command)
        const userJid = m.sender; // The person who sent the command

        await conn.sendMessage(userJid, content, { quoted: mek });

        const done = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃  ✅ *VIEW ONCE SENT!*  ┃
┃  ═══════════════════════
┃  📥 Media sent to your DM
┃  🔒 Check your inbox
╰━━━━━━━━━━━━━━━━━━━━━━╯

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await conn.sendMessage(from, {
            text: done
        }, { quoted: mek });

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (e) {
        console.log("VV2 ERROR:", e);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply("❌ *ERROR!*");
    }
});

// ============================================================
// 🎯 EMOJI COMMAND - PUBLIC (Sends to User's DM)
// ============================================================
cmd({
    pattern: "👁️",
    alias: ["vv3"],
    react: "👁️",
    desc: "Quick view once (Public)",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, {
            react: { text: "👁️", key: m.key }
        });

        if (!m.quoted) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply("❌ *Reply to a view once media!*");
        }

        let quotedMsg = m.quoted;
        let msg = quotedMsg.message;

        if (msg?.viewOnceMessageV2) {
            msg = msg.viewOnceMessageV2.message;
        } else if (msg?.viewOnceMessageV2Extension) {
            msg = msg.viewOnceMessageV2Extension.message;
        }

        const type = Object.keys(msg)[0];
        const buffer = await quotedMsg.download();

        let content = {};

        if (type === "imageMessage") {
            content = { image: buffer, caption: "📸 View Once" };
        } else if (type === "videoMessage") {
            content = { video: buffer, caption: "🎥 View Once" };
        } else if (type === "audioMessage") {
            content = { audio: buffer, mimetype: "audio/mp4", ptt: false };
        } else {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply("❌ *Not supported!*");
        }

        // Send to user's DM
        const userJid = m.sender;
        await conn.sendMessage(userJid, content, { quoted: mek });

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });
        reply("✅ *Check your DM!*");

    } catch (e) {
        console.log("EMOJI VV ERROR:", e);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply("❌ *Error!*");
    }
});