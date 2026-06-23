// plugins/autoreact.js
// Place this file in: plugins/autoreact.js

const { cmd } = require('../zaidi');
const { getAutoreactSettings, setAutoreactSettings } = require('../data/Antilink');

const DEFAULT_EMOJIS = ['❤️', '😍', '🔥', '👑', '💫', '✨', '😎', '🤩', '💕', '🌹'];

function toFancy(text) {
    const map = { 'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ' };
    return text.toLowerCase().split('').map(c => map[c] || c).join('');
}

cmd({
    pattern: 'autoreact',
    alias: ['areact'],
    desc: 'Auto react on/off karo messages par',
    category: 'settings',
    react: '😍',
    filename: __filename
}, async (conn, mek, m, { args, isOwner, reply, botNumber }) => {
    if (!isOwner) return reply(`❌ ${toFancy('Owner Only')} 😎`);

    const value = args[0]?.toLowerCase();
    const rc = await getAutoreactSettings(botNumber);

    if (value === 'on') {
        await setAutoreactSettings(botNumber, { ...rc, enabled: true });
        return reply(
`╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷
┃❃╭──────────────
┃❃│ 😍 ${toFancy('Auto React')}
┃❃│ ✅ ${toFancy('Status')}: ${toFancy('Activated')}
┃❃│ 🏘 ${toFancy('Group')}: ${rc.groupReact ? toFancy('On') : toFancy('Off')}
┃❃│ 📩 ${toFancy('Inbox')}: ${rc.inboxReact ? toFancy('On') : toFancy('Off')}
┃❃│ 🎯 ${toFancy('Cmd Only')}: ${rc.cmdOnly ? toFancy('Yes') : toFancy('No')}
┃❃│ Emojis: ${rc.emojis.join(' ')}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    } else if (value === 'off') {
        await setAutoreactSettings(botNumber, { ...rc, enabled: false });
        return reply(
`╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷
┃❃╭──────────────
┃❃│ 😍 ${toFancy('Auto React')}
┃❃│ ❌ ${toFancy('Status')}: ${toFancy('Deactivated')}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    } else if (value === 'group') {
        const val = args[1] === 'on';
        await setAutoreactSettings(botNumber, { ...rc, groupReact: val });
        return reply(`✅ Group Auto React: *${val ? 'ON' : 'OFF'}*`);
    } else if (value === 'inbox') {
        const val = args[1] === 'on';
        await setAutoreactSettings(botNumber, { ...rc, inboxReact: val });
        return reply(`✅ Inbox Auto React: *${val ? 'ON' : 'OFF'}*`);
    } else if (value === 'cmdonly') {
        const val = args[1] === 'on';
        await setAutoreactSettings(botNumber, { ...rc, cmdOnly: val });
        return reply(`✅ ${toFancy('Command Only React')}: *${val ? 'YES' : 'NO'}*`);
    } else if (value === 'setemoji') {
        const emojis = args.slice(1);
        if (!emojis.length) return reply('❌ Example: .autoreact setemoji ❤️ 🔥 😍 👑');
        await setAutoreactSettings(botNumber, { ...rc, emojis });
        return reply(`✅ ${toFancy('Emojis Set')}: ${emojis.join(' ')}`);
    } else if (value === 'reset') {
        await setAutoreactSettings(botNumber, { ...rc, emojis: DEFAULT_EMOJIS });
        return reply(`✅ ${toFancy('Emojis Reset')}: ${DEFAULT_EMOJIS.join(' ')}`);
    } else {
        return reply(
`╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷
┃❃╭──────────────
┃❃│ 😍 ${toFancy('Auto React Status')}
┃❃│ ${rc.enabled ? '✅' : '❌'} ${toFancy('Status')}: ${rc.enabled ? toFancy('On') : toFancy('Off')}
┃❃│ 🏘 ${toFancy('Group')}: ${rc.groupReact ? toFancy('On') : toFancy('Off')}
┃❃│ 📩 ${toFancy('Inbox')}: ${rc.inboxReact ? toFancy('On') : toFancy('Off')}
┃❃│ 🎯 ${toFancy('Cmd Only')}: ${rc.cmdOnly ? toFancy('Yes') : toFancy('No')}
┃❃│ Emojis: ${rc.emojis.join(' ')}
┃❃│ ──────────────
┃❃│ 💡 ${toFancy('Commands')}:
┃❃│ .autoreact on/off
┃❃│ .autoreact group on/off
┃❃│ .autoreact inbox on/off
┃❃│ .autoreact cmdonly on/off
┃❃│ .autoreact setemoji ❤️ 🔥 ...
┃❃│ .autoreact reset
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    }
});
