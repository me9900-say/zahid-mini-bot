const { cmd, commands } = require('../zaidi');
const { sleep } = require('../lib/functions');
const moment = require("moment-timezone");
const config = require('../config');
const { fakevCard } = require('../lib/fakevCard');

cmd({
    pattern: "menu",
    alias: ["commandlist", "allmenu", "help"],
    desc: "Show all bot commands",
    category: "system",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    try {
        await conn.sendMessage(from, {
            react: { text: "📋", key: m.key }
        });

        // 📊 Count commands
        let totalCommands = 0;
        let grouped = {};

        for (const cmd of commands) {
            if (!cmd.pattern || !cmd.category) continue;
            totalCommands++;
            if (!grouped[cmd.category]) grouped[cmd.category] = [];
            grouped[cmd.category].push(cmd.pattern);
        }

        // ⏰ Time & Date
        const time = moment().tz("Africa/Kampala").format("hh:mm:ss A");
        const date = moment().tz("Africa/Kampala").format("dddd, DD MMMM YYYY");

        // 🎨 Build Menu
        let menu = `*╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷*\n`;
        menu += `*┃❃╭──────────────*\n`;
        menu += `*┃❃│ ⏰ ᴛɪᴍᴇ: ${time}*\n`;
        menu += `*┃❃│ 📅 ᴅᴀᴛᴇ: ${date}*\n`;
        menu += `*┃❃│ 📦 ᴛᴏᴛᴀʟ: ${totalCommands} ᴄᴏᴍᴍᴀɴᴅs*\n`;
        menu += `*┃❃│ 🔣 ᴘʀᴇғɪx: ${config.PREFIX || '.'}*\n`;
        menu += `*┃❃╰───────────────*\n`;
        menu += `*╰═════════════════⊷*\n\n`;

        // Categories with Bold Fancy Font
        const categoryEmojis = {
            "main": "💠",
            "system": "🔧",
            "settings": "⚙️",
            "owner": "👑",
            "group": "👥",
            "admin": "🛡️",
            "download": "📥",
            "downloader": "📥",
            "sticker": "🎨",
            "fun": "🎮",
            "general": "📌",
            "tools": "🔧",
            "search": "🔍"
        };

        const sortedCategories = Object.keys(grouped).sort();

        for (const cat of sortedCategories) {
            const emoji = categoryEmojis[cat.toLowerCase()] || "✨";
            // Bold Fancy Category Name
            const fancyCat = cat.charAt(0).toUpperCase() + cat.slice(1);
            menu += `*╭─❏ ${emoji} 𝐅${fancyCat.slice(1)} ${emoji} ❏*\n`;
            const sortedCmds = grouped[cat].sort();
            for (const c of sortedCmds) {
                const fancyCmd = c.toLowerCase();
                menu += `*│ ${fancyCmd}*\n`;
            }
            menu += `*╰─────────────────*\n\n`;
        }

        // Footer
        menu += `*> 𝛲𝜣𝑊𝛯𝑅𝛯𝐷 𝐵𝜳 𝛧𝜟𝛪𝐷𝛪 𝛭𝐷 ᥫ᭡*`;

        // Send Menu with Image
        await conn.sendMessage(from, {
            image: { url: "https://up6.cc/2026/05/177971006919991.png" },
            caption: menu,
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
        }, { quoted: fakevCard });

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (e) {
        console.error("Menu Error:", e);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply("❌ *Menu failed to load!*");
    }
});