const { cmd } = require('../zaidi');
const { updateUserConfig } = require('../lib/database');

// ============================================================
// ANTILINK PLUGIN — zahid-mini-bot
// Files: plugins/antilink.js (NEW)
// ============================================================

const warnMap = new Map(); // `${groupJid}_${userJid}` → warn count

function hasLink(text) {
    if (!text) return false;
    return /https?:\/\/[^\s]+|www\.[^\s]+|chat\.whatsapp\.com\/[^\s]+|t\.me\/[^\s]+|bit\.ly\/[^\s]+|youtu\.be\/[^\s]+/gi.test(text);
}

function getGroupAL(config, groupJid) {
    const groups = config.ANTILINK_GROUPS || {};
    return groups[groupJid] || { enabled: false, maxWarns: 2 };
}

async function saveGroupAL(botNumber, config, groupJid, settings) {
    if (!config.ANTILINK_GROUPS) config.ANTILINK_GROUPS = {};
    config.ANTILINK_GROUPS[groupJid] = settings;
    await updateUserConfig(botNumber, config);
}

// ==================== COMMAND ====================
cmd({
    pattern: 'antilink',
    alias: ['alink'],
    desc: 'Enable/disable antilink in group',
    category: 'group',
    react: '🔗',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, args, reply, botNumber, config }) => {
    if (!isGroup) return reply('❌ Sirf group mein use karo.');
    if (!isAdmins) return reply('❌ Sirf group admins use kar saktay hain.');
    if (!isBotAdmins) return reply('❌ Bot ko admin banana padega pehle.');

    const settings = getGroupAL(config, from);
    const value = args[0]?.toLowerCase();

    if (value === 'on') {
        await saveGroupAL(botNumber, config, from, { enabled: true, maxWarns: settings.maxWarns || 2 });
        return reply(
`*╭─── 🔗 ANTI-LINK ───╮*
*│ ✅ Status: ON*
*│ ⚠️ Max Warns: ${settings.maxWarns || 2}*
*│ Links send karne par warn milega*
*│ Warn limit ke baad kick!*
*╰────────────────────○*
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    } else if (value === 'off') {
        await saveGroupAL(botNumber, config, from, { enabled: false, maxWarns: settings.maxWarns || 2 });
        return reply(
`*╭─── 🔗 ANTI-LINK ───╮*
*│ ❌ Status: OFF*
*╰────────────────────○*
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    } else if (value === 'warn') {
        const n = parseInt(args[1]);
        if (!n || n < 1 || n > 5) return reply('❌ Use: .antilink warn 1-5\nExample: .antilink warn 3');
        await saveGroupAL(botNumber, config, from, { ...settings, maxWarns: n });
        return reply(`✅ Ab *${n}* warns ke baad user kick hoga.`);
    } else if (value === 'reset') {
        for (const key of warnMap.keys()) {
            if (key.startsWith(from)) warnMap.delete(key);
        }
        return reply('✅ Is group ke saare warnings clear ho gaye.');
    } else {
        const status = settings.enabled ? '✅ ON' : '❌ OFF';
        return reply(
`*╭─── 🔗 ANTI-LINK STATUS ───╮*
*│ Status: ${status}*
*│ Max Warns: ${settings.maxWarns || 2}*
*│*
*│ Commands:*
*│ .antilink on*
*│ .antilink off*
*│ .antilink warn 3*
*│ .antilink reset*
*╰────────────────────○*
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    }
});

// ==================== LISTENER ====================
cmd({
    on: 'body',
    dontAddCommandList: true
}, async (conn, mek, m, { from, isGroup, sender, isAdmins, isBotAdmins, body, config, isOwner }) => {
    try {
        if (!isGroup) return;
        if (!body || !hasLink(body)) return;
        const settings = getGroupAL(config, from);
        if (!settings.enabled) return;
        if (isAdmins || isOwner) return;
        if (!isBotAdmins) return;

        const warnKey = `${from}_${sender}`;
        const currentWarns = (warnMap.get(warnKey) || 0) + 1;
        const maxWarns = settings.maxWarns || 2;

        try { await conn.sendMessage(from, { delete: mek.key }); } catch (_) {}

        if (currentWarns >= maxWarns) {
            warnMap.delete(warnKey);
            try { await conn.groupParticipantsUpdate(from, [sender], 'remove'); } catch (_) {}
            await conn.sendMessage(from, {
                text: `*╭─── 🚫 KICKED ───╮*\n*│ @${sender.split('@')[0]}*\n*│ ❌ Links share karne par kick*\n*│ Warns: ${currentWarns}/${maxWarns}*\n*╰────────────────────○*\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`,
                mentions: [sender]
            });
        } else {
            warnMap.set(warnKey, currentWarns);
            await conn.sendMessage(from, {
                text: `*╭─── ⚠️ WARNING ───╮*\n*│ @${sender.split('@')[0]}*\n*│ 🔗 Links allowed nahi hain!*\n*│ Warn: ${currentWarns}/${maxWarns}*\n*│ ${maxWarns - currentWarns} aur warn baad kick!*\n*╰────────────────────○*\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`,
                mentions: [sender]
            });
        }
    } catch (e) {
        console.error('Antilink error:', e.message);
    }
});
