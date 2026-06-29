const { cmd } = require('../zaidi');
const { getUserConfigFromMongoDB, updateUserConfigInMongoDB } = require('../lib/database');

cmd({
    pattern: "autoreact",
    desc: "Auto React On/Off (per user)",
    category: "owner",
    fromMe: true
}, async (conn, mek, m, { reply, q }) => {
    // Sender ka JID (unique identifier)
    const sender = m.sender || m.key.remoteJid;

    // Config fetch karein
    let config = await getUserConfigFromMongoDB(sender);
    if (!config) {
        config = { AUTO_REACT: "false" }; // default
    } else if (!config.AUTO_REACT) {
        config.AUTO_REACT = "false";
    }

    // Agar koi argument nahi diya toh status dikhayein
    if (!q) {
        return reply(
`╭━━━〔 *📌 Auto React* 〕━━━⬣
┃ ✅ *.autoreact on*
┃ ❌ *.autoreact off*
> Current Status: ${config.AUTO_REACT}
╰━━━━━━━━━━━━━━━━⬣`
        );
    }

    // ON
    if (q.toLowerCase() === "on") {
        config.AUTO_REACT = "true";
        await updateUserConfigInMongoDB(sender, config);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        return reply("✅ *Auto React Enabled*");
    }

    // OFF
    if (q.toLowerCase() === "off") {
        config.AUTO_REACT = "false";
        await updateUserConfigInMongoDB(sender, config);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        return reply("❌ *Auto React Disabled*");
    }

    return reply("❌ Use: .autoreact on/off");
});
