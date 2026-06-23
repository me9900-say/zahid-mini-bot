const { cmd } = require('../zaidi');
const { updateUserConfig } = require('../lib/database');

// ============================================================
// AUTO REACT PLUGIN — zahid-mini-bot
// Files: plugins/autoreact.js (NEW)
// ============================================================

const DEFAULT_EMOJIS = ['❤️', '😍', '🔥', '👑', '💫', '✨', '😎', '🤩', '💕', '🌹'];

function getRC(config) {
    return {
        enabled: config.AUTO_REACT === 'true',
        groupReact: config.AUTO_REACT_GROUP !== 'false',
        inboxReact: config.AUTO_REACT_INBOX !== 'false',
        cmdOnly: config.AUTO_REACT_CMD_ONLY === 'true',
        emojis: (config.AUTO_REACT_EMOJIS && config.AUTO_REACT_EMOJIS.length) ? config.AUTO_REACT_EMOJIS : DEFAULT_EMOJIS
    };
}

// ==================== COMMAND ====================
cmd({
    pattern: 'autoreact',
    alias: ['areact'],
    desc: 'Enable/disable auto react on messages',
    category: 'settings',
    react: '😍',
    filename: __filename
}, async (conn, mek, m, { args, isOwner, reply, botNumber, config }) => {
    if (!isOwner) return reply('❌ Sirf owner use kar sakta hai.');

    const value = args[0]?.toLowerCase();
    const rc = getRC(config);

    if (value === 'on') {
        config.AUTO_REACT = 'true';
        await updateUserConfig(botNumber, config);
        return reply(
`*╭─── 😍 AUTO REACT ───╮*
*│ ✅ Status: ON*
*│ 🏘 Group: ${rc.groupReact ? 'ON' : 'OFF'}*
*│ 📩 Inbox: ${rc.inboxReact ? 'ON' : 'OFF'}*
*│ 🎯 Cmd Only: ${rc.cmdOnly ? 'YES' : 'NO'}*
*│ Emojis: ${rc.emojis.join(' ')}*
*╰────────────────────○*
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    } else if (value === 'off') {
        config.AUTO_REACT = 'false';
        await updateUserConfig(botNumber, config);
        return reply(
`*╭─── 😍 AUTO REACT ───╮*
*│ ❌ Status: OFF*
*╰────────────────────○*
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    } else if (value === 'group') {
        const val = (args[1] === 'on') ? 'true' : 'false';
        config.AUTO_REACT_GROUP = val;
        await updateUserConfig(botNumber, config);
        return reply(`✅ Group Auto React: *${val === 'true' ? 'ON' : 'OFF'}*`);
    } else if (value === 'inbox') {
        const val = (args[1] === 'on') ? 'true' : 'false';
        config.AUTO_REACT_INBOX = val;
        await updateUserConfig(botNumber, config);
        return reply(`✅ Inbox Auto React: *${val === 'true' ? 'ON' : 'OFF'}*`);
    } else if (value === 'cmdonly') {
        const val = (args[1] === 'on') ? 'true' : 'false';
        config.AUTO_REACT_CMD_ONLY = val;
        await updateUserConfig(botNumber, config);
        return reply(`✅ Command Only React: *${val === 'true' ? 'YES' : 'NO'}*`);
    } else if (value === 'setemoji') {
        const emojis = args.slice(1);
        if (!emojis.length) return reply('❌ Example: .autoreact setemoji ❤️ 🔥 😍 👑');
        config.AUTO_REACT_EMOJIS = emojis;
        await updateUserConfig(botNumber, config);
        return reply(`✅ Emojis set: ${emojis.join(' ')}`);
    } else if (value === 'reset') {
        config.AUTO_REACT_EMOJIS = DEFAULT_EMOJIS;
        await updateUserConfig(botNumber, config);
        return reply(`✅ Emojis reset: ${DEFAULT_EMOJIS.join(' ')}`);
    } else {
        return reply(
`*╭─── 😍 AUTO REACT STATUS ───╮*
*│ Status: ${rc.enabled ? '✅ ON' : '❌ OFF'}*
*│ 🏘 Group: ${rc.groupReact ? 'ON' : 'OFF'}*
*│ 📩 Inbox: ${rc.inboxReact ? 'ON' : 'OFF'}*
*│ 🎯 Cmd Only: ${rc.cmdOnly ? 'YES' : 'NO'}*
*│ Emojis: ${rc.emojis.join(' ')}*
*│*
*│ Commands:*
*│ .autoreact on/off*
*│ .autoreact group on/off*
*│ .autoreact inbox on/off*
*│ .autoreact cmdonly on/off*
*│ .autoreact setemoji ❤️ 🔥 ...*
*│ .autoreact reset*
*╰────────────────────○*
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    }
});

// ==================== LISTENER ====================
cmd({
    on: 'body',
    dontAddCommandList: true
}, async (conn, mek, m, { from, isGroup, isCmd, config }) => {
    try {
        const rc = getRC(config);
        if (!rc.enabled) return;
        if (isGroup && !rc.groupReact) return;
        if (!isGroup && !rc.inboxReact) return;
        if (rc.cmdOnly && !isCmd) return;
        if (mek.key.fromMe) return;

        const emoji = rc.emojis[Math.floor(Math.random() * rc.emojis.length)];
        await conn.sendMessage(from, { react: { text: emoji, key: mek.key } });
    } catch (_) {}
});
