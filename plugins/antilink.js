// plugins/antilink.js
// Place this file in: plugins/antilink.js

const { cmd } = require('../zaidi');
const { getAntilinkSettings, setAntilinkSettings, clearAllWarns } = require('../data/Antilink');

function toFancy(text) {
    const map = { 'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ' };
    return text.toLowerCase().split('').map(c => map[c] || c).join('');
}

cmd({
    pattern: 'antilink',
    alias: ['alink'],
    desc: 'Group mein links block karo',
    category: 'group',
    react: '🔗',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, args, reply }) => {
    if (!isGroup) return reply('❌ Sirf group mein use karo.');
    if (!isAdmins) return reply('❌ Sirf group admins use kar saktay hain.');
    if (!isBotAdmins) return reply('❌ Bot ko pehle admin banao.');

    const value = args[0]?.toLowerCase();
    const settings = await getAntilinkSettings(from);

    if (value === 'on') {
        await setAntilinkSettings(from, true, settings.maxWarns);
        return reply(
`╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷
┃❃╭──────────────
┃❃│ 🔗 ${toFancy('Anti-Link')}
┃❃│ ✅ ${toFancy('Status')}: ${toFancy('Activated')}
┃❃│ ⚠️ ${toFancy('Max Warns')}: ${settings.maxWarns}
┃❃│ 🔒 ${toFancy('Links will be deleted')}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    } else if (value === 'off') {
        await setAntilinkSettings(from, false, settings.maxWarns);
        return reply(
`╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷
┃❃╭──────────────
┃❃│ 🔗 ${toFancy('Anti-Link')}
┃❃│ ❌ ${toFancy('Status')}: ${toFancy('Deactivated')}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    } else if (value === 'warn') {
        const n = parseInt(args[1]);
        if (!n || n < 1 || n > 5) return reply('❌ .antilink warn 1-5\n💡 Example: .antilink warn 3');
        await setAntilinkSettings(from, settings.enabled, n);
        return reply(`✅ Ab *${n}* warns ke baad user kick hoga.`);
    } else if (value === 'reset') {
        clearAllWarns(from);
        return reply('✅ Is group ke saare warnings clear ho gaye.');
    } else {
        return reply(
`╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷
┃❃╭──────────────
┃❃│ 🔗 ${toFancy('Anti-Link Status')}
┃❃│ ${settings.enabled ? '✅' : '❌'} ${toFancy('Status')}: ${settings.enabled ? toFancy('On') : toFancy('Off')}
┃❃│ ⚠️ ${toFancy('Max Warns')}: ${settings.maxWarns}
┃❃│ ──────────────
┃❃│ 💡 ${toFancy('Commands')}:
┃❃│ .antilink on
┃❃│ .antilink off
┃❃│ .antilink warn 3
┃❃│ .antilink reset
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    }
});
